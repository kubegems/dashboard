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
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #[`item.name`]="{ item }">
        {{ item.metadata.name }}
      </template>
      <template #[`item.tunnel`]="{ item }">
        <v-icon v-if="item.status.tunnel.connected" color="success" small>mdi-check-circle</v-icon>
        <v-icon v-else color="error" small>mdi-error-circle</v-icon>
      </template>
      <template #[`item.register`]="{ item }">
        {{ item.status.manufacture['edge.kubegems.io/edge-agent-register-address'] }}
      </template>
      <template #[`item.status`]="{ item }">
        <span
          :class="{
            'v-avatar': true,
            'mr-1': true,
            'kubegems__waiting-flashing': edgeStatus[item.status.phase] === edgeStatus.Waiting,
          }"
          :style="{
            height: '10px',
            minWidth: '10px',
            width: '10px',
            marginTop: '-2px',
            backgroundColor: `${edgeStatus[item.status.phase]}`,
          }"
        />
        <span>
          {{ item.status.phase }}
        </span>
      </template>
      <template #[`item.node`] />
      <template #[`item.project`]="{ item }">
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
  import { onMounted, reactive } from 'vue';

  import Pagination from '../Pagination.vue';
  import { useEdgeClusterPagination } from '@/composition/cluster';
  import { useRoute } from '@/composition/router';
  import { PROJECT_KEY, TENANT_KEY } from '@/constants/label';
  import { EdgeCluster } from '@/types/edge_cluster';

  onMounted(() => {
    getEdgeClusterList();
  });

  enum edgeStatus {
    Online = '#00BCD4',
    Offline = '#9e9e9e',
    Waiting = '#fb8c00',
  }

  const route = useRoute();

  const headers = [
    { text: '名称', value: 'name', align: 'start' },
    { text: '注册集群', value: 'register', align: 'start' },
    { text: '隧道', value: 'tunnel', align: 'start' },
    { text: '状态', value: 'status', align: 'start', width: 100 },
    { text: '项目', value: 'project', align: 'start' },
    { text: '主机数', value: 'node', align: 'start' },
  ];

  let pagination: Pagination<EdgeCluster> = reactive<Pagination<EdgeCluster>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getEdgeClusterList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<EdgeCluster> = await useEdgeClusterPagination(new EdgeCluster(), params.page, params.size, {
      [TENANT_KEY]: [route.params.tenant],
    });
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };
</script>
