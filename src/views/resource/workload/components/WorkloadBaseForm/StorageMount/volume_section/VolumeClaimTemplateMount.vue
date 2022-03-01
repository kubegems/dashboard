<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-sheet class="pt-2 px-2">
      <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
        <span>模版定义</span>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="obj.metadata.name"
          class="my-0"
          required
          label="卷名称"
          :rules="objRules.nameRule"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-if="!manifest"
          v-model="obj.spec.storageClassName"
          :items="storageClasses"
          :rules="objRules.storageClassNameRule"
          color="primary"
          label="存储类型"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @focus="onStorageClassSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip
              color="primary"
              small
              class="mx-1"
            >
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="obj.spec.accessModes[0]"
          :items="accessModes"
          :rules="objRules.accessModeRule"
          color="primary"
          label="访问模式"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
        >
          <template #selection="{ item }">
            <v-chip
              color="primary"
              small
              class="mx-1"
            >
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="obj.spec.resources.requests.storage"
          class="my-0"
          required
          label="容量"
          :rules="objRules.storageRule"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount
      ref="volumeMount"
      :containers="data.spec.template.spec.containers"
      :volume-mount-name="volumeMountName"
      :volume="volume"
      type="VolumeClaimTemplate"
    />
  </v-form>
</template>

<script>
import { getStorageClassList } from '@/api'
import VolumeMount from './VolumeMount'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'VolumeClaimTemplateMount',
  components: { VolumeMount },
  mixins: [BaseResource],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    volumeMountName: {
      type: String,
      default: () => null,
    },
    volume: {
      type: Object,
      default: () => null,
    },
    template: {
      type: Object,
      default: () => null,
    },
    manifest: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      storageClasses: [],
      obj: {
        metadata: {
          name: '',
        },
        spec: {
          accessModes: [],
          resources: {
            requests: {
              storage: '10Gi',
            },
          },
          storageClassName: '',
        },
      },
      objRules: {
        nameRule: [required],
        storageClassNameRule: [required],
        accessModeRule: [required],
        storageRule: [required],
      },
    }
  },
  computed: {
    storageClass() {
      if (
        this.obj.spec.storageClassName &&
        this.obj.spec.storageClassName !== ''
      ) {
        const sc = this.storageClasses.find((sc) => {
          return sc.metadata.name === this.obj.spec.storageClassName
        })
        if (sc) {
          return sc
        } else {
          return null
        }
      } else {
        return null
      }
    },
    accessModes() {
      if (
        this.storageClass &&
        this.storageClass.metadata.annotations[
          `storageclass.${process.env.VUE_APP_DOMAIN}/supported-access-modes`
        ]
      ) {
        const modes =
          this.storageClass.metadata.annotations[
            `storageclass.${process.env.VUE_APP_DOMAIN}/supported-access-modes`
          ].split(',')
        const accessModes = []
        modes.forEach((mode) => {
          if (mode === 'rwo') {
            accessModes.push({ text: '单节点读写', value: 'ReadWriteOnce' })
          } else if (mode === 'rox') {
            accessModes.push({ text: '多节点只读', value: 'ReadOnlyMany' })
          } else if (mode === 'rwx') {
            accessModes.push({ text: '多节点读写', value: 'ReadWriteMany' })
          }
        })
        return accessModes
      } else {
        return [
          { text: '单节点读写', value: 'ReadWriteOnce' },
          { text: '多节点只读', value: 'ReadOnlyMany' },
          { text: '多节点读写', value: 'ReadWriteMany' },
        ]
      }
    },
  },
  async mounted() {
    if (this.template) {
      this.storageClassList()
      this.obj = deepCopy(this.template)
      this.$refs.volumeMount.initVolumeMount(this.obj.metadata.name)
    }
  },
  methods: {
    async storageClassList() {
      let data = {}
      if (!this.manifest) {
        data = await getStorageClassList(this.ThisCluster, {
          size: 500,
        })
      }
      this.storageClasses = data.List
      this.storageClasses.forEach((v) => {
        v.text = v.metadata.name
        v.value = v.metadata.name
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    generateData() {
      if (this.$refs.form.validate(true)) {
        const data = this.$refs.volumeMount.generateData()
        if (data) {
          // this.obj.metadata.namespace = this.data.metadata.namespace
          for (const item in data) {
            data[item].name = this.obj.metadata.name
          }
          return {
            volumeMount: data,
            volumeClaimTemplate: deepCopy(this.obj),
          }
        }
        return null
      }
      return null
    },
    onStorageClassSelectFocus() {
      this.storageClassList()
    },
  },
}
</script>

<style lang="scss" scoped>
.mode-width {
  width: 200px;
}
</style>
