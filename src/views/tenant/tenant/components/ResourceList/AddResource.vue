<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建集群资源"
    icon="mdi-server-plus"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm
        ref="resource"
        :quota="quota"
        @clusterChange="onClusterChange"
      />
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
import ResourceBaseForm from './ResourceBaseForm'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'AddResource',
  components: {
    ResourceBaseForm,
  },
  mixins: [BaseResource],
  props: {
    clusters: {
      type: Array,
      default: () => null,
    },
  },
  data: () => ({
    dialog: false,
    item: null,
    quota: null,
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addTenantResourceQuota() {
      if (this.$refs.resource.validate()) {
        const data = deepCopy(this.$refs.resource.getData())
        if (
          this.clusters.some((c) => {
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
    async onClusterChange(clusterId) {
      this.quota = await this.m_resource_clusterQuota(clusterId, {
        NowCpu: 0,
        NowMemory: 0,
        NowStorage: 0,
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
