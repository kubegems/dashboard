<template>
  <div>
    <v-text-field
      v-model="search"
      class="search"
      clearable
      dense
      flat
      hide-details
      label="搜索"
      prepend-inner-icon="mdi-magnify"
      solo
    />
    <v-treeview
      activatable
      :active.sync="active"
      color="primary"
      dense
      item-key="treeId"
      :items="items"
      :load-children="environmentList"
      :open.sync="open"
      open-on-click
      return-object
      rounded
      :search="search"
      transition
    >
      <template #prepend="{ item }">
        <v-icon v-if="item.type === 'project'" color="primary" left small> fas fa-cube </v-icon>

        <v-icon v-else color="primary" left small> fas fa-cloud </v-icon>
      </template>
    </v-treeview>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getProjectList, getProjectEnvironmentList, getAllProjectList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { SERVICE_MONITOR_NS } from '@/utils/namespace';

  export default {
    name: 'ProjectEnvironmentTree',
    mixins: [BaseSelect],
    props: {
      value: {
        type: [Object],
        default: undefined,
      },
    },
    data() {
      return {
        items: [],
        active: [],
        open: [],
        search: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport']),
    },
    watch: {
      value: {
        handler(newValue) {
          if (this.active !== newValue) {
            this.active = newValue ? [newValue] : [];
          }
        },
        immediate: true,
      },
      active(newValue) {
        if (this.value !== newValue[0]) {
          this.onActiveChange(newValue);
        }
      },
    },
    mounted() {
      this.projectList();
    },
    methods: {
      // 此接口中返回的env列表中没有集群信息，所以树采用懒加载方式
      async projectList() {
        let data = {};
        if (this.AdminViewport) {
          data = await getAllProjectList({ size: 999 });
        } else {
          data = await getProjectList(this.Tenant().ID, { size: 999 });
        }
        this.items = data.List.map((item) => ({
          type: 'project',
          treeId: `proj-${item.ProjectName}`,
          id: item.ID,
          name: item.ProjectName,
          children: [],
        }));
        if (this.AdminViewport) {
          this.items.push({
            type: 'project',
            treeId: `proj-system`,
            id: 0,
            name: 'system(平台全局)',
            children: [],
          });
        }
        this.defaultActiveByQuery();
      },
      async environmentList(proj) {
        let data = {};
        if (proj.id === 0) {
          await this.m_select_clusterSelectData();
          data.List = [];
          data.List = this.m_select_clusterItems.map((c) => {
            return {
              ID: 0,
              EnvironmentName: c.text,
              Cluster: {
                ClusterName: c.text,
              },
              ClusterID: c.value,
              ProjectID: 0,
              Project: {
                ProjectName: 'system',
              },
              Namespace: SERVICE_MONITOR_NS,
            };
          });
        } else {
          data = await getProjectEnvironmentList(proj.id, { size: 999, noprocessing: true });
        }
        const children = data.List.map((item) => ({
          type: 'environment',
          treeId: `env-${item.EnvironmentName}`,
          id: item.ID,
          name: item.EnvironmentName,
          clusterId: item.ClusterID,
          clusterName: item.Cluster.ClusterName,
          projectId: item.ProjectID,
          projectName: item.Project.ProjectName,
          namespace: item.Namespace,
        }));
        this.$set(proj, 'children', children);
      },
      onActiveChange(value) {
        const v = value[0];
        this.$emit('input', v);
        this.$emit('change', v);
      },
      async defaultActiveByQuery() {
        const { env, proj } = this.$route.query;
        let projItem = void 0;
        if (proj) {
          projItem = this.items.find((item) => item.name === proj);
          projItem && (await this.environmentList(projItem));
        }
        this.open = projItem ? [projItem] : [];
        this.active = env
          ? [
              {
                type: 'environment',
                treeId: `env-${env}`,
              },
            ]
          : [];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .search {
    padding-top: 6px;
    margin-bottom: 8px;
  }
</style>
