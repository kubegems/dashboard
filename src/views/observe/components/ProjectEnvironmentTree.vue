<template>
  <v-treeview
    :items="items"
    :active.sync="active"
    :open.sync="open"
    item-key="treeId"
    activatable
    open-on-click
    dense
    transition
    color="primary"
    return-object
    :load-children="getEnvironmentList"
  >
    <template #prepend="{ item }">
      <v-chip
        v-if="item.type === 'project'"
        color="primary"
        label
        small
        class="mr-2"
      >
        Proj
      </v-chip>
      <v-chip
        v-else
        color="green"
        text-color="white"
        label
        small
        class="mr-2"
      >
        Env
      </v-chip>
    </template>
  </v-treeview>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectList, getProjectEnvironmentList } from '@/api'
export default {
  name: 'ProjectEnvironmentTree',
  props: {
    value: {
      type: [Object],
      default: undefined,
    },
  },
  data () {
    return {
      items: [],
      active: [],
      open: [],
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
  },
  watch: {
    value: {
      handler (newValue) {
        if (this.active !== newValue) {
          this.active = newValue ? [newValue] : []
        }
      },
      immediate: true,
    },
    active (newValue) {
      if (this.value !== newValue[0]) {
        this.onActiveChange(newValue)
      }
    },
  },
  mounted () {
    this.getProjectList()
  },
  methods: {
    // 此接口中返回的env列表中没有集群信息，所以树采用懒加载方式
    async getProjectList () {
      const data = await getProjectList(this.Tenant().ID, { size: 999 })
      this.items = data.List.map((item) => ({
        type: 'project',
        treeId: `proj-${item.ProjectName}`,
        id: item.ID,
        name: item.ProjectName,
        children: [],
      }))
      this.getDefaultActiveByQuery()
    },
    async getEnvironmentList (proj) {
      const data = await getProjectEnvironmentList(proj.id, { size: 999, noprocessing: true })
      const children = data.List.map(item => ({
        type: 'environment',
        treeId: `env-${item.EnvironmentName}`,
        id: item.ID,
        name: item.EnvironmentName,
        clusterId: item.ClusterID,
        clusterName: item.Cluster.ClusterName,
        projectId: item.ProjectID,
        projectName: item.Project.ProjectName,
        namespace: item.Namespace,
      }))
      this.$set(proj, 'children', children)
    },
    onActiveChange (value) {
      const v = value[0]
      this.$emit('input', v)
      this.$emit('change', v)
    },
    async getDefaultActiveByQuery () {
      const { env, proj } = this.$route.query
      let projItem = void 0
      if (proj) {
        projItem = this.items.find(item => item.name === proj)
        projItem && await this.getEnvironmentList(projItem)
      }
      this.open = projItem ? [projItem] : []
      this.active = env ? [{
        type: 'environment',
        treeId: `env-${env}`,
      }] : []
    },
  },
}
</script>
