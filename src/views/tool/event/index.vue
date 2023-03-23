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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right align-center">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker
              ref="datetimePicker"
              v-model="date"
              :default-value="30"
              default-value-for-query
              query-end-time-key="end"
              query-start-time-key="start"
              value-change-to-query
              @change="datetimeChanged"
            />
            <v-btn class="primary--text" small text @click="refresh">
              <v-icon left small> mdi-refresh </v-icon>
              {{ i18n.t('operate.refresh') }}
            </v-btn>
          </v-sheet>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card flat>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.message'), value: 'message' }"
          :filters="filters"
        />
      </v-card-title>

      <v-data-table
        class="mx-4 kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="index"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-expand
        single-expand
        @click:row="rowClick"
        @page-count="pagination.pageCount = $event"
      >
        <template #item.reason="{ item }">
          {{ item.stream.reason }}
        </template>
        <template #item.type="{ item }">
          <v-chip
            class="font-weight-medium chip-width"
            :color="item.stream.type === 'Normal' ? 'success' : 'warning'"
            small
          >
            <span>{{ item.stream.type }}</span>
          </v-chip>
        </template>
        <template #item.count="{ item }">
          {{ item.stream.count }}
        </template>
        <template #item.namespace="{ item }">
          {{ item.stream.metadata_namespace ? item.stream.metadata_namespace : '' }}
        </template>
        <template #item.name="{ item }">
          {{ item.stream.metadata_name ? item.stream.metadata_name : '' }}
        </template>
        <template #item.component="{ item }">
          {{ item.stream.source_component ? item.stream.source_component : '' }}
        </template>
        <template #item.host="{ item }">
          {{ item.stream.source_host ? item.stream.source_host : '' }}
        </template>
        <template #item.firstAt="{ item }">
          {{
            item.stream.firstTimestamp
              ? moment(item.stream.firstTimestamp).format('lll')
              : item.stream.metadata_creationTimestamp
              ? moment(item.stream.metadata_creationTimestamp).format('lll')
              : ''
          }}
        </template>
        <template #item.lastAt="{ item }">
          {{
            item.stream.lastTimestamp
              ? moment(item.stream.lastTimestamp).format('lll')
              : item.stream.metadata_creationTimestamp
              ? moment(item.stream.metadata_creationTimestamp).format('lll')
              : ''
          }}
        </template>
        <template #item.message="{ item }">
          {{ item.stream.message.length > 100 ? item.stream.message.substr(0, 100) + '......' : item.stream.message }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="text-left" :colspan="headers.length">
            <pre class="kubegems__word-all-break">{{ item.stream.message }}</pre>
          </td>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :front-page="true"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getEventList"
      />
    </v-card>
    <!-- </v-card> -->
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from './i18n';
  import { useClusterList } from '@/composition/cluster';
  import { useRouter } from '@/composition/router';
  import { useClusterListInTenant, useEnvironmentListInTenant } from '@/composition/tenant';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { useStore } from '@/store';
  import { Cluster } from '@/types/cluster';
  import { Log } from '@/types/log';
  import { Tenant } from '@/types/tenant';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();

  const date = ref([]);
  const datetimeChanged = (): void => {
    pagination.page = 1;
    getEventList();
  };

  const datetimePicker = ref(null);
  const refresh = () => {
    datetimePicker.value.refresh(true);
  };

  const headers = [
    { text: i18nLocal.t('table.component'), value: 'component', align: 'start', width: 150 },
    { text: i18nLocal.t('table.host'), value: 'host', align: 'start', width: 250 },
    { text: i18nLocal.t('table.service'), value: 'name', align: 'start', width: 200 },
    { text: i18nLocal.t('table.namespace'), value: 'namespace', align: 'start', width: 150 },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start', width: 150 },
    { text: 'Reason', value: 'reason', align: 'start', width: 100 },
    { text: i18nLocal.t('table.message'), value: 'message', align: 'start', width: 200 },
    { text: i18nLocal.t('table.count'), value: 'count', align: 'start', width: 50 },
    { text: i18nLocal.t('table.first_at'), value: 'firstAt', align: 'start', width: 150 },
    { text: i18nLocal.t('table.last_at'), value: 'lastAt', align: 'start', width: 150 },
    { text: '', value: 'data-table-expand' },
  ];

  let pagination: Pagination<Log> = reactive<Pagination<Log>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      start: null,
      end: null,
      tenant: null,
      message: null,
      reason: null,
      clustername: null,
      direction: 'backward',
      limit: 500,
    },
  });

  const getEventList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    params.request = Object.assign(params.request, useQuery().value);
    params.request.start = `${Date.parse(moment(date.value[0]).utc().format())}000000`;
    params.request.end = `${Date.parse(moment(date.value[1]).utc().format())}000000`;
    if (store.state.AdminViewport) {
      params.request.tenant = null;
    }
    let query = `{container="event-exporter", stream="stdout"} | json | __error__=""`;
    if (params.request.tenant) {
      const tenant = store.state.TenantStore.find((t) => {
        return t.TenantName === params.request.tenant;
      });
      const data = await useEnvironmentListInTenant(new Tenant({ TenantName: params.request.tenant, ID: tenant?.ID }));
      if (data?.length === 0) return;
      query += `|line_format "{{.metadata_namespace}}"|~"${data
        .map((d) => {
          return d.Namespace;
        })
        .join('|')}"`;
    }
    if (params.request.message) {
      query += `|line_format "{{.message}}"|~ \`${params.request.message}\``;
    }
    if (params.request.reason) {
      query += `|line_format "{{.reason}}"|~ \`${params.request.reason}\``;
    }
    if (!store.state.Admin && !params.request.tenant) {
      return;
    }
    if (!params.request.clustername) return;
    const data: Log[] = await new Log().getEventList(params.request.clustername, {
      query: query,
      ...params.request,
    });
    data.sort((a, b) => {
      return parseInt(b.values[0][0]) - parseInt(a.values[0][0]);
    });
    pagination.items = data;
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const rowClick = (item, { expand, isExpanded }): void => {
    expand(!isExpanded);
  };

  const clusterItems = ref<Cluster[]>([]);
  const generateFilter = async (): Promise<void> => {
    if (pagination.request.tenant) {
      const tenant = store.state.TenantStore.find((t) => {
        return t.TenantName === pagination.request.tenant;
      });
      clusterItems.value = await useClusterListInTenant(new Tenant({ ID: tenant?.ID, TenantName: tenant?.TenantName }));
    } else {
      clusterItems.value = await useClusterList(new Cluster());
    }
    if (clusterItems.value.length > 0 && !pagination.request.clustername) {
      router.replace({ query: { clustername: clusterItems.value[0].ClusterName, ...query.value } });
    }
  };
  const filters: ComputedRef<any[]> = computed(() => {
    return [
      {
        text: i18nLocal.t('filter.cluster'),
        value: 'clustername',
        items: clusterItems.value.map((c) => {
          return { text: c.ClusterName, value: c.ClusterName, parent: 'clustername' };
        }),
      },
      { text: i18nLocal.t('filter.message'), value: 'message', items: [] },
      {
        text: 'Reason',
        value: 'reason',
        items: [
          { text: 'Evicted', value: 'Evicted', parent: 'reason' },
          { text: 'Scheduled', value: 'Scheduled', parent: 'reason' },
          {
            text: 'SuccessfulCreate',
            value: 'SuccessfulCreate',
            parent: 'reason',
          },
          {
            text: 'SuccessfulDelete',
            value: 'SuccessfulDelete',
            parent: 'reason',
          },
          {
            text: 'FailedDaemonPod',
            value: 'FailedDaemonPod',
            parent: 'reason',
          },
          {
            text: 'ImageGCFailed',
            value: 'ImageGCFailed',
            parent: 'reason',
          },
          {
            text: 'FreeDiskSpaceFailed',
            value: 'FreeDiskSpaceFailed',
            parent: 'reason',
          },
          {
            text: 'NodeHasNoDiskPressure',
            value: 'NodeHasNoDiskPressure',
            parent: 'reason',
          },
          {
            text: 'Started',
            value: 'Started',
            parent: 'reason',
          },
          {
            text: 'Unhealthy',
            value: 'Unhealthy',
            parent: 'reason',
          },
          {
            text: 'FailedGetResourceMetric',
            value: 'FailedGetResourceMetric',
            parent: 'reason',
          },
          {
            text: 'FailedComputeMetricsReplicas',
            value: 'FailedComputeMetricsReplicas',
            parent: 'reason',
          },
          {
            text: 'Killing',
            value: 'Killing',
            parent: 'reason',
          },
          {
            text: 'FailedCreate',
            value: 'FailedCreate',
            parent: 'reason',
          },
        ],
      },
    ];
  });
  watch(
    () => query.value.message,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.message = newValue;
        getEventList();
      } else {
        pagination.message = '';
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => query.value.reason,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.reason = newValue;
        getEventList();
      } else {
        pagination.reason = '';
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => query.value.clustername,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.clustername = newValue;
        getEventList();
      } else {
        pagination.clustername = '';
      }
    },
    {
      deep: true,
    },
  );

  onMounted(async () => {
    await generateFilter();
  });
</script>

<style lang="scss" scoped>
  .chip-width {
    width: 70px;
    display: block;
    text-align: center;
  }
</style>
