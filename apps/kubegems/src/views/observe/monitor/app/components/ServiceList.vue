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
    <v-data-table
      class="mx-4"
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
      @update:sort-by="sortBy"
      @update:sort-desc="sortDesc"
    >
      <template #item.labelvalue="{ item }">
        {{ item.labelvalue }}
      </template>
      <template #item.avgRequestQPS="{ item }">
        {{ `${parseFloat(item.valueMap.avgRequestQPS).toFixed(3)} req/s` || '-' }}
      </template>
      <template #item.avgResponseDurationSeconds="{ item }">
        {{ beautifyTime(item.valueMap.avgResponseDurationSeconds, 1000000) || '-' }}
      </template>
      <template #item.p75ResponseDurationSeconds="{ item }">
        {{ beautifyTime(item.valueMap.p75ResponseDurationSeconds, 1000000) || '-' }}
      </template>
      <template #item.p90ResponseDurationSeconds="{ item }">
        {{ beautifyTime(item.valueMap.p90ResponseDurationSeconds, 1000000) || '-' }}
      </template>
      <template #item.errorCount="{ item }">
        {{
          item.valueMap.errorCount
            ? `${parseFloat(item.valueMap.errorCount).toFixed(1)} (${
                item.valueMap.errorRate === 'NaN' ? '-' : (item.valueMap.errorRate * 100).toFixed(3)
              }%)`
            : '-'
        }}
      </template>
    </v-data-table>

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getServiceList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { beautifyTime } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { nextTick, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { useServicePagination } from '@/composition/telemetry';
  import { Telemetry } from '@/types/opentelemetry';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
      date?: string[];
    }>(),
    {
      env: undefined,
      date: undefined,
    },
  );

  watch(
    () => props.env,
    async (newValue) => {
      if (newValue && newValue.clusterName && newValue.namespace) {
        nextTick(() => {
          getServiceList();
        });
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => props.date,
    async (newValue) => {
      if (newValue && newValue.length === 2 && props.env.clusterName) {
        pagination.start = moment(props.date[0]).utc().format();
        pagination.end = moment(props.date[1]).utc().format();
        nextTick(() => {
          getServiceList();
        });
      }
    },
    {
      deep: true,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'labelvalue', align: 'start', sortable: false },
    { text: i18nLocal.t('table.avg_req'), value: 'avgRequestQPS', align: 'start' },
    { text: i18nLocal.t('table.avg_res'), value: 'avgResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.p75_res'), value: 'p75ResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.p90_res'), value: 'p90ResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.error_count'), value: 'errorCount', align: 'start' },
  ];

  let pagination: Pagination<Telemetry> = reactive<Pagination<Telemetry>>({
    page: 1,
    size: 20,
    pageCount: 0,
    items: [],
    start: '',
    end: '',
    sortby: '',
  });

  const getServiceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Telemetry> = await useServicePagination(
      new Telemetry(),
      props.env.clusterName,
      props.env.namespace,
      params,
    );
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const by = ref('');
  const desc = ref<boolean>(undefined);
  const sortBy = (name: string): void => {
    if (name) {
      by.value = name;
    } else {
      by.value = '';
    }
    if (by.value && desc.value !== undefined) {
      pagination.sortby = desc.value ? `${by.value}Desc` : `${by.value}Asc`;
      getServiceList();
    }
  };
  const sortDesc = (des: boolean): void => {
    if (des !== undefined) {
      desc.value = des;
    } else {
      desc.value = undefined;
    }
    if (by.value && desc.value !== undefined) {
      pagination.sortby = desc.value ? `${by.value}Desc` : `${by.value}Asc`;
      getServiceList();
    }
  };
</script>
