<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="资源调整"
    icon="mdi-scale"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm
        ref="resource"
        :quota="quota"
        :cluster="cluster"
        edit
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="tenantResourceApply"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postTenantResourceApply, getTenantResourceApplyDetail } from '@/api'
import ResourceBaseForm from '@/views/tenant/tenant/components/ResourceList/ResourceBaseForm'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ScaleResource',
  components: {
    ResourceBaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    item: null,
    quota: null,
    cluster: '',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  watch: {
    item: {
      handler(newValue) {
        if (newValue) {
          this.cluster = newValue?.Cluster?.ClusterName
        }
      },
      deep: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async tenantResourceApply() {
      if (this.$refs.resource.validate()) {
        const data = deepCopy(this.$refs.resource.getData())
        data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`
        data.Content[`requests.storage`] = `${
          data.Content[`requests.storage`]
        }Gi`
        data.ClusterID = this.item.ClusterID
        data.TenantID = this.item.TenantID
        await postTenantResourceApply(this.item.TenantID, this.item.ClusterID, data)
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
      if (item.NvidiaGpu) { this.item.NowNvidiaGpu = item.NvidiaGpu }
      if (item.TkeGpu) { this.item.NowTkeGpu = item.TkeGpu }
      if (item.TkeMemory) { this.item.NowTkeMemory = item.TkeMemory }
      this.quota = await this.m_resource_clusterQuota(this.item.ClusterID, this.item)
      let content = {
        'limits.cpu': item.Cpu,
        'limits.memory': item.Memory,
        'requests.storage': item.Storage,
      }
      if (item.NvidiaGpu) {
        content['limits.nvidia.com/gpu'] = item.NowNvidiaGpu
      }
      if (item.TkeGpu) {
        content['tencent.com/vcuda-core'] = item.TkeGpu
      }
      if (item.TkeMemory) {
        content['tencent.com/vcuda-memory'] = item.TkeMemory
      }
      if (
        this.item.TenantResourceQuotaApply &&
        this.item.TenantResourceQuotaApply.Status === 'pending'
      ) {
        const data = await getTenantResourceApplyDetail(
          this.item.TenantID,
          this.item.TenantResourceQuotaApplyID,
        )
        content = {
          'limits.cpu': data.Content[`limits.cpu`],
          'limits.memory': data.Content[`limits.memory`].replaceAll('Gi', ''),
          'requests.storage': data.Content[`requests.storage`].replaceAll(
            'Gi',
            '',
          ),
        }
        if (item.NvidiaGpu) {
          content['limits.nvidia.com/gpu'] = data.Content[`limits.nvidia.com/gpu`]
        }
        if (item.TkeGpu) {
          content['tencent.com/vcuda-core'] = data.Content[`tencent.com/vcuda-core`]
        }
        if (item.TkeMemory) {
          content['tencent.com/vcuda-memory'] = data.Content[`tencent.com/vcuda-memory`]
        }
      }
      this.$refs.resource.setContent(content)
    },
    reset() {
      this.dialog = false
      this.$refs.resource.reset()
      this.quota = null
    },
  },
}
</script>
