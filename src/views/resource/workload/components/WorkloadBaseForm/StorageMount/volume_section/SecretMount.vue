<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeName"
          :items="items"
          :rules="volumeRules.SecretRule"
          color="primary"
          label="密钥"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          :readonly="edit"
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
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet
      v-for="(item, index) in volumeCopy && volumeCopy.secret.items
        ? volumeCopy.secret.items
        : []"
      :key="index"
      class="px-2"
    >
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeCopy.secret.items[index].key"
          :items="secrets"
          :rules="volumeRules[index].KeyRule"
          color="primary"
          label="密钥键"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @focus="onSecretKeySelectFocus"
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
        <v-text-field
          v-model="volumeCopy.secret.items[index].path"
          class="my-0"
          required
          label="路径"
          :rules="volumeRules[index].PathRule"
        />
      </v-flex>
      <v-btn
        class="mt-4"
        dark
        text
        fab
        right
        x-small
        color="error"
        @click="removeKV(index)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
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
import { getSecretList, getSecretDetail, getAppResourceFileMetas } from '@/api'
import VolumeMount from './VolumeMount'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'SecretMount',
  components: { VolumeMount },
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
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      items: [],
      secrets: [],
      volumeName: null,
      volumeCopy: {
        secret: {
          items: [],
        },
      },
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
    volumeRules() {
      const rule = { SecretRule: [required] }
      if (this.volumeCopy && this.volumeCopy.secret.items) {
        this.volumeCopy.secret.items.forEach((i, index) => {
          rule[index] = {}
          rule[index].KeyRule = [required]
          rule[index].PathRule = [required]
        })
      }
      return rule
    },
  },
  watch: {
    volume: {
      handler: function() {
        this.loadData()
      },
      deep: true,
    },
  },
  async mounted() {
    await this.secretList()
    this.loadData()
  },
  methods: {
    loadData() {
      if (this.volume) {
        this.volumeName = this.volume.secret.secretName
        this.volumeCopy = deepCopy(this.volume)
        if (this.namespace.length > 0) { this.secretDetail() }
      }
    },
    async secretList() {
      let data = {}
      if (this.manifest) {
        data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: 'Secret',
            noprocessing: true,
          },
        )
        this.items = data
      } else {
        data = await getSecretList(this.ThisCluster, this.namespace || this.$route.query.namespace, {
          size: 1000,
          noprocessing: true,
        })
        this.items = data.List
      }
      this.items.forEach((v) => {
        v.text = v.secret ? v.secret.metadata.name : v.metadata.name
        v.value = v.secret ? v.secret.metadata.name : v.metadata.name
      })
    },
    async secretDetail() {
      const data = await getSecretDetail(
        this.ThisCluster,
        this.namespace || this.$route.query.namespace,
        this.volumeName,
        { noprocessing: true },
      )
      if (data.data) {
        for (const item in data.data) {
          this.secrets.push({
            text: item,
            value: item,
          })
        }
      }
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
              secret: {
                secretName: this.volumeObj.metadata.name,
                items: this.volumeCopy.secret.items
                  ? this.volumeCopy.secret.items
                  : [],
              },
            },
          }
        }
        return null
      }
      return null
    },
    removeKV(index) {
      this.$delete(this.volumeCopy.secret.items, index)
    },
    // eslint-disable-next-line vue/no-unused-properties
    addItem() {
      if (!this.volumeCopy.secret.items) this.volumeCopy.secret.items = []
      this.volumeCopy.secret.items.push({ key: '', path: '' })
    },
    onSecretKeySelectFocus() {
      this.secretDetail()
    },
  },
}
</script>
