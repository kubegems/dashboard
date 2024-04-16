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
    <v-data-table
      class="px-0"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.name="{ item }">
        <div class="float-left mr-2">
          <v-icon
            :class="{ 'kubegems__waiting-flashing-front': edgeStatus[item.status.phase] === edgeStatus.Waiting }"
            :color="edgeStatus[item.status.phase]"
            small
          >
            mdi-heart-pulse
          </v-icon>
        </div>
        <div class="float-left">
          <span> {{ getDisplayName(item) }} </span>
        </div>
        <div class="kubegems__clear-float" />
      </template>
      <template #item.tunnel="{ item }">
        <BaseStatus
          :bg-color="tunnelStatus[item.status.tunnel.connected ? 'Online' : 'Offline']"
          :status="item.status.tunnel.connected ? 'Online' : 'Offline'"
        />
      </template>
      <template #item.register="{ item }">
        {{ item.status.manufacture['edge.kubegems.io/edge-agent-register-address'] }}
      </template>
      <template #item.node="{ item }">
        {{ item.status.manufacture ? item.status.manufacture['edge.kubegems.io/nodes-count'] : '' }}
      </template>
      <template #item.project="{ item }">
        {{ item.metadata.labels[PROJECT_KEY] }}
      </template>
    </v-data-table>

    <Pagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @loaddata="getEdgeClusterList"
    />
  </div>
</template>

<script lang="ts" setup>
  import { useEdgeClusterPagination } from '@kubegems/api/hooks/cluster';
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams } from '@kubegems/extension/router';
  import config from '@kubegems/libs/constants/global';
  import { EDGE_DEVICEID_KEY, PROJECT_KEY, TENANT_KEY } from '@kubegems/libs/constants/label';
  import { onMounted, reactive } from 'vue';

  import { useI18n } from '../../i18n';
  import Pagination from '../Pagination.vue';

  onMounted(() => {
    getEdgeClusterList();
  });

  const edgeStatus = {
    Online: config.theme.THEME_COLOR.success,
    Offline: config.theme.THEME_COLOR_EXTEND.greyLight,
    Waiting: config.theme.THEME_COLOR_EXTEND.warning,
  };

  const tunnelStatus = {
    Online: config.theme.THEME_COLOR.success,
    Offline: config.theme.THEME_COLOR_EXTEND.greyLight,
  };

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const routeParams = useParams();

  const headers = [
    { text: i18nLocal.t('edge.table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('edge.table.register_cluster'), value: 'register', align: 'start' },
    { text: i18nLocal.t('edge.table.tunnel'), value: 'tunnel', align: 'start' },
    { text: i18n.t('resource.project'), value: 'project', align: 'start' },
    { text: i18nLocal.t('edge.table.node_count'), value: 'node', align: 'start' },
  ];

  let pagination: Pagination<EdgeCluster> = reactive<Pagination<EdgeCluster>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getEdgeClusterList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<EdgeCluster> = await useEdgeClusterPagination(new EdgeCluster(), params.page, params.size, {
      [TENANT_KEY]: [routeParams.value.tenant],
    });
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const getDisplayName = (item: EdgeCluster) => {
    return item?.metadata?.labels?.[EDGE_DEVICEID_KEY] || item?.metadata?.name || '';
  };
</script>
