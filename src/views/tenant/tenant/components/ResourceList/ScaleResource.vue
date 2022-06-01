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
import ResourceBaseForm from './ResourceBaseForm'
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
    async updateTenantResourceQuota() {
      if (this.$refs.resource.validate()) {
        const data = deepCopy(this.$refs.resource.getData())
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
      this.$refs.resource.setContent({
        'limits.cpu': item.Cpu,
        'limits.memory': item.Memory,
        'requests.storage': item.Storage,
      })
    },
    reset() {
      this.dialog = false
      this.$refs.resource.reset()
      this.quota = null
    },
  },
}
</script>
