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
  <v-card class="mt-3">
    <v-card-title class="py-4">
      <BaseFilter1 :default="{ items: [], text: $t('filter.edge_name'), value: 'search' }" :filters="filters" />
      <v-spacer />
      <v-menu left>
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2">
            <v-flex>
              <v-btn color="primary" text @click="addEdgeCluster">
                <v-icon left>mdi-plus-box</v-icon>
                {{ $root.$t('operate.create_c', [$root.$t('resource.edge_cluster')]) }}
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-card-title>
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.name="{ item }">
        <a class="text-subtitle-2" @click.stop="edgeDetail(item)">
          {{ item.metadata.name }}
        </a>
      </template>
      <template #item.label="{ item, index }">
        <BaseCollapseChips
          :id="`edge_label_${index}`"
          :chips="item.metadata.labels || {}"
          icon="mdi-label"
          single-line
        />
      </template>
      <template #item.version="{ item }">
        {{ item.status.manufacture ? item.status.manufacture['edge.kubegems.io/kubernetes-version'] : '' }}
      </template>
      <template #item.tunnel="{ item }">
        <BaseStatus
          :bg-color="tunnelStatus[item.status.tunnel.connected ? 'Online' : 'Offline']"
          :status="item.status.tunnel.connected ? 'Online' : 'Offline'"
        />
      </template>
      <template #item.register="{ item }">
        {{ item.status.manufacture ? item.status.manufacture['edge.kubegems.io/edge-agent-register-address'] : '' }}
      </template>
      <template #item.status="{ item, index }">
        <EdgeStatusTip
          :edge-cluster="item"
          :top="pagination.size - index <= 5 || (pagination.items.length <= 5 && index >= 1)"
        >
          <template #trigger>
            <BaseStatus
              :bg-color="edgeStatus[item.status.phase]"
              :flashing="edgeStatus[item.status.phase] === edgeStatus.Waiting"
              :status="item.status.phase"
            />
          </template>
        </EdgeStatusTip>
      </template>
      <!-- <template #item.node="{ item }" /> -->
      <template #item.joinAt="{ item }">
        {{ moment(item.metadata.creationTimestamp).format('lll') }}
      </template>
      <template #item.action="{ item }">
        <v-flex :id="`r${item.metadata.resourceVersion}`" />
        <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" small text @click="updateEdgeCluster(item)">
                  {{ $root.$t('operate.edit') }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" small text @click="deleteEdgeCluster(item)">
                  {{ $root.$t('operate.delete') }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getEdgeClusterList"
    />

    <EdgeClusterForm ref="edgeCluster" @refresh="getEdgeClusterList({ page: 1, size: 10 })" />
  </v-card>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';
  import EdgeClusterForm from './EdgeClusterForm/index.vue';
  import EdgeStatusTip from './EdgeStatusTip.vue';
  import { useEdgeClusterPagination } from '@/composition/cluster';
  import { useEnvironmentList } from '@/composition/environment';
  import { useProjectList } from '@/composition/project';
  import { useRoute, useRouter } from '@/composition/router';
  import { useTenantList } from '@/composition/tenant';
  import { ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@/constants/label';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { useStore } from '@/store';
  import { EdgeCluster } from '@/types/edge_cluster';
  import { Environment } from '@/types/environment';
  import { Project } from '@/types/project';
  import { Tenant } from '@/types/tenant';

  enum edgeStatus {
    Online = '#00BCD4',
    Offline = '#9e9e9e',
    Waiting = '#fb8c00',
  }

  enum tunnelStatus {
    Online = '#00BCD4',
    Offline = '#9e9e9e',
  }

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const router = useRouter();
  const route = useRoute();

  const labels = ref<{ [key: string]: string[] }>({});
  let tenantList = ref<Tenant[]>([]);
  let projectList = ref<Project[]>([]);
  let environmentList = ref<Environment[]>([]);
  const filters = ref([{ items: [], text: i18nLocal.t('filter.edge_name'), value: 'search' }]);
  const getTenantFilters = async () => {
    const filter = { items: [], text: i18n.t('resource.tenant'), value: 'tenant' };
    if (tenantList.value.length === 0) tenantList.value = await useTenantList(new Tenant());
    filter.items = tenantList.value.map((d: Tenant) => {
      return { text: d.TenantName, value: d.TenantName, parent: 'tenant' };
    });
    const index = filters.value.findIndex((f) => {
      return f.value === 'tenant';
    });
    if (index > -1) {
      filters.value[index] = filter;
    } else {
      filters.value.push(filter);
    }
  };
  const getProjectFilters = async () => {
    const filter = { items: [], text: i18n.t('resource.project'), value: 'project' };
    if (projectList.value.length === 0) projectList.value = await useProjectList(new Project());
    filter.items = projectList.value.map((d: Project) => {
      if (labels.value[TENANT_KEY]?.length > 0) {
        if (labels.value[TENANT_KEY].indexOf(d.Tenant.TenantName) > -1)
          return { text: d.ProjectName, value: d.ProjectName, parent: 'project' };
      } else {
        return { text: d.ProjectName, value: d.ProjectName, parent: 'project' };
      }
    });
    const index = filters.value.findIndex((f) => {
      return f.value === 'project';
    });
    if (index > -1) {
      filters.value[index] = filter;
    } else {
      filters.value.push(filter);
    }
  };
  const getEnvironmentFilters = async () => {
    const filter = { items: [], text: i18n.t('resource.environment'), value: 'environment' };
    if (environmentList.value.length === 0) environmentList.value = await useEnvironmentList(new Environment());
    filter.items = environmentList.value.map((d: Environment) => {
      if (labels.value[PROJECT_KEY]?.length > 0) {
        if (labels.value[PROJECT_KEY].indexOf(d.Project.ProjectName) > -1)
          return { text: d.EnvironmentName, value: d.EnvironmentName, parent: 'environment' };
      } else {
        return { text: d.EnvironmentName, value: d.EnvironmentName, parent: 'environment' };
      }
    });
    const index = filters.value.findIndex((f) => {
      return f.value === 'environment';
    });
    if (index > -1) {
      filters.value[index] = filter;
    } else {
      filters.value.push(filter);
    }
  };

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.label'), value: 'label', align: 'start' },
    { text: i18nLocal.t('table.version'), value: 'version', align: 'start' },
    { text: i18nLocal.t('table.register_cluster'), value: 'register', align: 'start' },
    { text: i18nLocal.t('table.tunnel'), value: 'tunnel', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start', width: 100 },
    { text: i18nLocal.t('table.node_count'), value: 'node', align: 'start' },
    { text: i18nLocal.t('table.join_at'), value: 'joinAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20, sortable: false },
  ];

  let pagination: Pagination<EdgeCluster> = reactive<Pagination<EdgeCluster>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getEdgeClusterList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<EdgeCluster> = await useEdgeClusterPagination(
      new EdgeCluster(),
      params.page,
      params.size,
      labels.value,
      params.search,
    );
    pagination = Object.assign(pagination, data);
  };

  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.tenant) {
        labels.value[TENANT_KEY] = [newValue.value.tenant];
      }
      if (newValue.value.project) {
        labels.value[PROJECT_KEY] = [newValue.value.project];
      }
      if (newValue.value.environment) {
        labels.value[ENVIRONMENT_KEY] = [newValue.value.environment];
      }
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      }
      getTenantFilters();
      getProjectFilters();
      getEnvironmentFilters();
      getEdgeClusterList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const deleteEdgeCluster = (item: EdgeCluster): void => {
    const edge = new EdgeCluster(item);
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.edge_cluster')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.edge_cluster')])} ${item.metadata.name}`,
        type: 'delete',
        name: item.metadata.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.metadata.name.length > 0) {
          await edge.deleteEdgeCluster();
          getEdgeClusterList();
        }
      },
    });
  };

  const edgeCluster = ref(null);
  const addEdgeCluster = (): void => {
    edgeCluster.value.open();
  };
  const updateEdgeCluster = (item: EdgeCluster): void => {
    edgeCluster.value.init(item);
    edgeCluster.value.open();
  };
  const edgeDetail = (item: EdgeCluster): void => {
    store.commit('SET_EDGE', item.metadata.name);
    router.push({
      name: 'cluster-detail',
      params: { name: item.metadata.name, ...route.params },
    });
  };
</script>
