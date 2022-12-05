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
      :custom-sort="customSort"
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.labelvalue="{ item }">
        {{ item.labelvalue }}
      </template>
      <template #item.avgRequestQPS="{ item }">
        {{ `${parseFloat(item.valueMap.avgRequestQPS).toFixed(3)} req/s` || '-' }}
      </template>
      <template #item.avgResponseDurationSeconds="{ item }">
        {{ beautifyUnit(item.valueMap.avgResponseDurationSeconds) || '-' }}
      </template>
      <template #item.p75ResponseDurationSeconds="{ item }">
        {{ beautifyUnit(item.valueMap.p75ResponseDurationSeconds) || '-' }}
      </template>
      <template #item.p90ResponseDurationSeconds="{ item }">
        {{ beautifyUnit(item.valueMap.p90ResponseDurationSeconds) || '-' }}
      </template>
      <template #item.errorCount="{ item }">
        {{
          item.valueMap.errorCount
            ? `${parseFloat(item.valueMap.errorCount).toFixed(1)} (${(item.valueMap.errorRate * 100).toFixed(3)}%)`
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
  import { reactive, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { useServicePagination } from '@/composition/telemetry';
  import { useGlobalI18n } from '@/i18n';
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
    }>(),
    {
      env: undefined,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'labelvalue', align: 'start' },
    { text: i18nLocal.t('table.avg_req'), value: 'avgRequestQPS', align: 'start' },
    { text: i18nLocal.t('table.avg_res'), value: 'avgResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.p75_res'), value: 'p75ResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.p90_res'), value: 'p90ResponseDurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.error_count'), value: 'errorCount', align: 'start' },
  ];

  let pagination: Pagination<Telemetry> = reactive<Pagination<Telemetry>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getServiceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Telemetry> = await useServicePagination(
      new Telemetry(),
      props.env.clusterName,
      props.env.namespace,
      params.page,
      params.size,
    );
    pagination = Object.assign(pagination, data);
  };

  watch(
    () => props.env,
    async (newValue) => {
      if (newValue) {
        getServiceList();
      }
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  enum numberBoolean {
    'true' = 1,
    'false' = 0,
  }
  const customSort = (items: Telemetry[], sortBy: string[], sortDesc: boolean[]): Telemetry[] => {
    const column: string = sortBy[0];
    if (!column) return items;
    if (
      column === 'avgRequestQPS' ||
      column === 'avgResponseDurationSeconds' ||
      column === 'p75ResponseDurationSeconds' ||
      column === 'p90ResponseDurationSeconds' ||
      column === 'errorCount'
    ) {
      items.sort((a, b) => {
        if (!sortDesc[0]) {
          return numberBoolean[(a?.valueMap?.[column] > b?.valueMap?.[column]).toString()];
        } else {
          return numberBoolean[(b?.valueMap?.[column] < a?.valueMap?.[column]).toString()];
        }
      });
    } else {
      items.sort((a, b) => {
        if (!sortDesc[0]) {
          return numberBoolean[(a?.[column] > b?.[column]).toString()];
        } else {
          return numberBoolean[(b?.[column] < a?.[column]).toString()];
        }
      });
    }
    return items;
  };

  const beautifyUnit = (num: string): string => {
    let result = parseFloat(num) * 1000 * 1000;
    const units = ['us', 'ms', 's'];
    for (const index in units) {
      if (Math.abs(result) <= 1000 || parseInt(index) === units.length - 1) {
        return `${result.toFixed(3)} ${units[index]}`;
      }
      result /= 1000;
    }
    return `${result.toFixed(3)} Yi`;
  };
</script>
