<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="资源调整"
    icon="mdi-scale"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="`集群${item ? item.Cluster.ClusterName : ''}`" />
      <v-card-text class="px-0 pb-0 mt-2">
        <ResourceChart :quota="quota" />
      </v-card-text>

      <BaseSubTitle title="资源调整目标值" />
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        class="mt-3 mx-1"
      >
        <v-row>
          <v-col
            cols="4"
            class="px-2 py-0"
          >
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                可用CPU
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedCpu.toFixed(1) : 0 }} core
                </span>
                当前
                <span class="text-subtitle-2 primary--text">
                  {{ item ? item.NowCpu : 0 }} Gi
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
            class="px-2 py-0"
          >
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                可用内存
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedMemory.toFixed(1) : 0 }} Gi
                </span>
                当前
                <span class="text-subtitle-2 primary--text">
                  {{ item ? item.NowMemory : 0 }} Gi
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
            class="px-2 py-0"
          >
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                可用存储
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.AllocatedStorage.toFixed(1) : 0 }}
                  Gi
                </span>
                当前
                <span class="text-subtitle-2 primary--text">
                  {{ item ? item.NowStorage : 0 }} Gi
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
      </v-form>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateTenantResourceQuota"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateTenantResourceQuota } from '@/api'
import ResourceChart from './ResourceChart'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'ScaleResource',
  components: {
    ResourceChart,
  },
  mixins: [BaseResource],
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
    async updateTenantResourceQuota() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.obj)
        data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`
        data.Content[`requests.storage`] = `${
          data.Content[`requests.storage`]
        }Gi`
        data.ClusterID = this.item.ClusterID
        data.TenantID = this.item.TenantID
        await putUpdateTenantResourceQuota(
          this.item.TenantID,
          this.item.ClusterID,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.item = deepCopy(item)
      this.item.NowCpu = item.Cpu
      this.item.NowMemory = item.Memory
      this.item.NowStorage = item.Storage
      this.quota = await this.m_resource_clusterQuota(this.item.ClusterID, this.item)
      this.obj.Content = {
        'limits.cpu': item.Cpu,
        'limits.memory': item.Memory,
        'requests.storage': item.Storage,
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
