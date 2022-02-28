<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeName"
          :items="items"
          :rules="volumeRules"
          color="primary"
          label="存储卷"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @change="onVolumeChange"
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
      <v-flex
        v-if="volumeObj"
        class="ml-2 pt-4"
      >
        <span class="text-body-2 mx-1">
          类型:{{ volumeObj.spec.storageClassName }}
        </span>
        <span class="text-body-2 mx-1">
          容量:{{ volumeObj.spec.resources.requests.storage }}
        </span>
        <span class="text-body-2 mx-1">
          访问模式:{{ volumeObj.spec.accessModes[0] }}
        </span>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount
      ref="volumeMount"
      :containers="containers"
      :volume-mount-name="volumeMountName"
      :volume="volume"
    />
  </v-form>
</template>

<script>
import { getPersistentVolumeClaimList, getAppResourceFileMetas } from '@/api'
import VolumeMount from './VolumeMount'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'

export default {
  name: 'PersistentVolumeClaimMount',
  components: {
    VolumeMount,
  },
  mixins: [BaseResource],
  props: {
    containers: {
      type: Array,
      default: () => [],
    },
    namespace: {
      type: String,
      default: () => '',
    },
    volumeMountName: {
      type: String,
      default: () => null,
    },
    volume: {
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
      volumeName: null,
      volumeRules: [required],
      items: [],
    }
  },
  computed: {
    volumeObj() {
      const index = this.items.findIndex((v) => {
        return v.metadata.name === this.volumeName
      })
      if (index > -1) return this.items[index]
      return null
    },
  },
  async mounted() {
    await this.persistentVolumeClaimList()
    if (this.volume) {
      this.volumeName = this.volume.persistentVolumeClaim.claimName
    }
  },
  methods: {
    async persistentVolumeClaimList() {
      let data = {}
      if (this.manifest) {
        data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: 'PersistentVolumeClaim',
            noprocessing: true,
          },
        )
        this.items = data
      } else {
        data = await getPersistentVolumeClaimList(
          this.ThisCluster,
          this.namespace,
          {
            size: 500,
            noprocessing: true,
          },
        )
        this.items = data.List
      }
      this.items = this.items
        .filter((v) => {
          return !(
            v.metadata.annotations &&
            v.metadata.annotations['pvc.kubegems.io/in-use'] === 'true'
          )
        })
        .map((v) => {
          return {
            text: v.metadata.name,
            value: v.metadata.name,
            ...v,
          }
        })
    },
    onVolumeChange() {
      this.$refs.volumeMount.initVolumeMount(this.volumeName)
    },
    // eslint-disable-next-line vue/no-unused-properties
    generateData() {
      if (this.$refs.form.validate(true)) {
        const data = this.$refs.volumeMount.generateData()
        if (data) {
          return {
            volumeMount: data,
            volume: {
              name: this.volume ? this.volume.name : this.volumeName,
              persistentVolumeClaim: {
                claimName: this.volumeObj.metadata.name,
              },
            },
          }
        }
        return null
      }
      return null
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
      this.$refs.volumeMount.$refs.form.reset()
    },
  },
}
</script>
