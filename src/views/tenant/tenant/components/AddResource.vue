<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建集群资源"
    icon="mdi-server-plus"
    @reset="reset"
  >
    <template #content>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent
      >
        <BaseSubTitle title="集群定义" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.ClusterID"
                class="my-0"
                :items="m_select_clusterItems"
                :rules="objRules.clusterIDRules"
                color="primary"
                hide-selected
                label="集群"
                no-data-text="暂无可选数据"
                @focus="onClusterSelectFocus"
                @change="onClusterChange"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    class="mx-1"
                    small
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
          <ResourceChart :quota="quota" />
        </v-card-text>

        <BaseSubTitle title="资源限制值" />
        <v-card-text class="px-0 pb-0">
          <v-row class="mx-0">
            <v-col
              cols="4"
              class="px-0 py-0"
            >
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  可用CPU
                  <span class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }} core
                  </span>
                </v-flex>
                <v-text-field
                  v-model="obj.Content['limits.cpu']"
                  class="my-0"
                  required
                  label="CPU扩容后限制值"
                  suffix="core"
                  :rules="objRules.cpuRules"
                />
              </v-sheet>
            </v-col>
            <v-col
              cols="4"
              class="pa-0"
            >
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  可用内存
                  <span class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }} Gi
                  </span>
                </v-flex>
                <v-text-field
                  v-model="obj.Content['limits.memory']"
                  class="my-0"
                  required
                  label="内存扩容后限制值"
                  suffix="Gi"
                  :rules="objRules.memoryRules"
                />
              </v-sheet>
            </v-col>
            <v-col
              cols="4"
              class="px-0 py-0"
            >
              <v-sheet class="px-2">
                <v-flex class="text-subtitle-1">
                  可用存储
                  <span class="text-subtitle-2 primary--text">
                    {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }}
                    Gi
                  </span>
                </v-flex>
                <v-text-field
                  v-model="obj.Content[`requests.storage`]"
                  class="my-0"
                  required
                  label="存储扩容后限制值"
                  suffix="Gi"
                  :rules="objRules.storageRules"
                />
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addTenantResourceQuota"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddTenantResourceQuota } from '@/api'
import ResourceChart from './ResourceChart'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'AddResource',
  components: {
    ResourceChart,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    clusters: {
      type: Array,
      default: () => null,
    },
  },
  data: () => ({
    dialog: false,
    valid: false,
    item: null,
    quota: null,
    obj: {
      ClusterID: null,
      TenantID: null,
      Content: {
        'limits.cpu': '',
        'limits.memory': '',
        'requests.storage': '',
      },
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        clusterIDRules: [required],
        cpuRules: [
          required,
          (v) => !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedCpu : 0) ||
            '超出最大限制',
        ],
        memoryRules: [
          required,
          (v) => !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedMemory : 0) ||
            '超出最大限制',
        ],
        storageRules: [
          required,
          (v) => !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedStorage : 0) ||
            '超出最大限制',
        ],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addTenantResourceQuota() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.obj)
        if (
          this.clusters.find((c) => {
            return c.ClusterID === data.ClusterID
          })
        ) {
          this.$store.commit('SET_SNACKBAR', {
            text: `集群已存在`,
            color: 'warning',
          })
          return
        }
        data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`
        data.Content[`requests.storage`] = `${
          data.Content[`requests.storage`]
        }Gi`
        data.TenantID = this.item.ID
        await postAddTenantResourceQuota(this.item.ID, data)
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.item = deepCopy(item)
    },
    async onClusterChange() {
      this.quota = await this.m_resource_clusterQuota(this.obj.ClusterID, {
        NowCpu: 0,
        NowMemory: 0,
        NowStorage: 0,
      })
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
      this.quota = null
    },
    onClusterSelectFocus() {
      this.m_select_clusterSelectData(null)
    },
  },
}
</script>
