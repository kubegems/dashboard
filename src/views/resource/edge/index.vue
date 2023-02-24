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
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.edge_name'), value: 'search' }"
          :filters="filters"
        />
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
                  {{ i18n.t('operate.create_c', [i18n.t('resource.edge_cluster')]) }}
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
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.name="{ item, index }">
          <div class="float-left mr-2">
            <EdgeStatusTip
              :edge-cluster="item"
              :top="pagination.size - index <= 5 || (pagination.items.length <= 5 && index >= 1)"
            >
              <template #trigger>
                <v-icon
                  :class="{ 'kubegems__waiting-flashing-front': edgeStatus[item.status.phase] === edgeStatus.Waiting }"
                  :color="edgeStatus[item.status.phase]"
                  small
                >
                  mdi-heart-pulse
                </v-icon>
              </template>
            </EdgeStatusTip>
          </div>
          <div class="float-left">
            <a v-if="item.status.phase === 'Online'" class="text-subtitle-2" @click.stop="edgeDetail(item)">
              {{ item.metadata.labels[EDGE_DEVICEID_KEY] || item.metadata.name }}
            </a>
            <span v-else> {{ item.metadata.labels[EDGE_DEVICEID_KEY] || item.metadata.name }} </span>
          </div>
          <div class="kubegems__clear-float" />
          <div>
            <EdgeManufactureTip
              :edge-cluster="item"
              :top="pagination.size - index <= 5 || (pagination.items.length <= 5 && index >= 1)"
            >
              <template #trigger>
                <v-icon class="mr-1" color="primary" small>mdi-text-box-outline</v-icon>
                <span class="primary--text text-caption">{{ i18nLocal.t('tip.manufacture') }}</span>
              </template>
            </EdgeManufactureTip>
          </div>
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
        <template #item.node="{ item }">
          {{ item.status.manufacture ? item.status.manufacture['edge.kubegems.io/nodes-count'] : '' }}
        </template>
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
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="openTerminal(item)"> Kubectl </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="deleteEdgeCluster(item)">
                    {{ i18n.t('operate.delete') }}
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
    </v-card>

    <EdgeClusterForm ref="edgeCluster" in-env @refresh="getEdgeClusterList({ page: 1, size: 10 })" />
    <Terminal ref="terminal" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onUnmounted, reactive, ref, watch } from 'vue';

  import { useI18n } from './i18n';
  import { useEdgeClusterPagination } from '@/composition/cluster';
  import { useRoute, useRouter } from '@/composition/router';
  import { EDGE_DEVICEID_KEY, ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@/constants/label';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { useStore } from '@/store';
  import { EdgeCluster } from '@/types/edge_cluster';
  import EdgeClusterForm from '@/views/resource/cluster/components/EdgeClusterForm/index.vue';
  import EdgeManufactureTip from '@/views/resource/cluster/components/EdgeManufactureTip.vue';
  import EdgeStatusTip from '@/views/resource/cluster/components/EdgeStatusTip.vue';
  import Terminal from '@/views/resource/components/common/Terminal/index.vue';

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
  const route = useRoute();
  const router = useRouter();
  const i18nLocal = useI18n();

  const filters = [
    { text: i18nLocal.t('filter.edge_name'), value: 'search', items: [] },
    { items: [], text: i18nLocal.t('filter.device_id'), value: 'deviceid' },
  ];

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.label'), value: 'label', align: 'start' },
    { text: i18nLocal.t('table.version'), value: 'version', align: 'start' },
    { text: i18nLocal.t('table.register_cluster'), value: 'register', align: 'start' },
    { text: i18nLocal.t('table.tunnel'), value: 'tunnel', align: 'start' },
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

  const labels = ref<{ [key: string]: string[] }>({
    [ENVIRONMENT_KEY]: [route.params.environment],
    [PROJECT_KEY]: [route.params.project],
    [TENANT_KEY]: [route.params.tenant],
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

  let interval: NodeJS.Timeout;
  onUnmounted(() => {
    clearInterval(interval);
  });
  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.deviceid) {
        labels.value[EDGE_DEVICEID_KEY] = [newValue.value.deviceid];
      } else {
        delete labels.value[EDGE_DEVICEID_KEY];
      }
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      getEdgeClusterList();
      clearInterval(interval);
      interval = setInterval(() => {
        getEdgeClusterList();
      }, 30 * 1000);
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
      name: 'edge-detail',
      params: { ...route.params, name: item.metadata.name },
      query: { edgeName: item.metadata.name },
    });
  };

  const terminal = ref(null);
  const openTerminal = (item: EdgeCluster): void => {
    terminal.value.init(null, item, 'kubectl', true);
    terminal.value.open();
  };
</script>
