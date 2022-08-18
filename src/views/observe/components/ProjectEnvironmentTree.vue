<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <div>
    <v-text-field
      v-model="search"
      class="search"
      clearable
      dense
      flat
      hide-details
      :label="$root.$t('query')"
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
        <v-icon v-if="item.type === 'project'" color="primary" left small> mdi-view-dashboard </v-icon>

        <v-icon v-else color="primary" left small> mdi-cloud </v-icon>
      </template>
      <template #label="{ item }">
        <span class="text-body-2">{{ item.name }}</span>
      </template>
    </v-treeview>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getAllProjectList, getProjectEnvironmentList, getProjectList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { SERVICE_LOGGING_NS, SERVICE_MONITOR_NS } from '@/utils/namespace';

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
            name: `system(${this.$root.$t('resource.platform')})`,
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
              Namespace: this.$route.name === 'admin-observe-monitor-config' ? SERVICE_MONITOR_NS : SERVICE_LOGGING_NS,
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
