<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="资源调整"
    icon="mdi-scale"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="`集群${item ? item.ClusterName : ''}`" />
      <v-card-text class="px-0 pb-0 mt-2">
        <ResourceChart :quota="quota" />
      </v-card-text>

      <BaseSubTitle title="资源调整目标值" />
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        class="mt-4 mx-1"
        @submit.prevent
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
                  {{ item ? item.NowCpu : 0 }} core
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.Content['limits.cpu']"
                class="my-0"
                required
                label="CPU扩容后限制值"
                suffix="core"
                :rules="objRules.CpuRules"
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
                :rules="objRules.MemoryRules"
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
                :rules="objRules.StorageRules"
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
        :loading="passLoading"
        @click="approvePass"
      >
        通过
      </v-btn>
      <v-btn
        class="float-right"
        color="error"
        text
        :loading="cancelLoading"
        @click="approveReject"
      >
        拒绝
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postApprovePass, postApproveReject, getTenantResourceQuota } from '@/api'
import ResourceChart from '@/views/tenant/tenant/components/ResourceChart'
import BaseResource from '@/mixins/resource'
import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'ApproveResource',
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
    passLoading: false,
    cancelLoading: false,
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        ClusterIDRules: [required],
        CpuRules: [
          required,
          (v) => !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedCpu : 0) ||
            '超出最大限制',
        ],
        MemoryRules: [
          required,
          (v) => !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
          (v) =>
            parseInt(v) <= (this.quota ? this.quota.AllocatedMemory : 0) ||
            '超出最大限制',
        ],
        StorageRules: [
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
    async approvePass() {
      if (this.$refs.form.validate(true)) {
        this.passLoading = true
        const data = {
          Content: {},
        }
        data.Content['limits.cpu'] = `${this.obj.Content['limits.cpu']}`
        data.Content['limits.memory'] = `${this.obj.Content['limits.memory']}Gi`
        data.Content[`requests.storage`] = `${
          this.obj.Content[`requests.storage`]
        }Gi`
        await postApprovePass(this.item.ID, data)
        this.passLoading = false
        this.reset()
        this.$emit('refresh')
      }
    },
    async approveReject() {
      this.cancelLoading = true
      await postApproveReject(this.item.ID)
      this.cancelLoading = false
      this.reset()
      this.$emit('refresh')
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.item = deepCopy(item)
      const data = await getTenantResourceQuota(
        this.item.ClusterName,
        this.item.TenantName,
        { noprocessing: true },
      )
      this.item.NowCpu = parseFloat(sizeOfCpu(data.spec.hard['limits.cpu']))
      this.item.NowMemory = parseFloat(
        sizeOfStorage(data.spec.hard['limits.memory']),
      )
      this.item.NowStorage = parseFloat(
        sizeOfStorage(data.spec.hard[`requests.storage`]),
      )
      this.quota = await this.m_resource_clusterQuota(this.item.ClusterID, this.item)
      this.obj.Content = {
        'limits.cpu': this.item.Content[`limits.cpu`],
        'limits.memory': this.item.Content[`limits.memory`].replaceAll(
          'Gi',
          '',
        ),
        'requests.storage': this.item.Content[`requests.storage`].replaceAll(
          'Gi',
          '',
        ),
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
