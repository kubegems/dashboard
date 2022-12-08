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
      class="mx-1"
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
      <template #item.requestRate="{ item }">
        {{ `${parseFloat(item.valueMap.requestRate || 0).toFixed(3)} req/s` || '-' }}
      </template>
      <template #item.errorRate="{ item }">
        {{ item.valueMap.errorRate ? `${parseFloat(item.valueMap.errorRate).toFixed(3)} /s` : '-' }}
      </template>
      <template #item.p50DurationSeconds="{ item }">
        {{ beautifyTime(item.valueMap.p50DurationSeconds, 1000000) || '-' }}
      </template>
      <template #item.p90DurationSeconds="{ item }">
        {{ beautifyTime(item.valueMap.p90DurationSeconds, 1000000) || '-' }}
      </template>
    </v-data-table>

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getOperation"
    />
  </div>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { nextTick, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import { useOperationPagination } from '@/composition/telemetry';
  import { useGlobalI18n } from '@/i18n';
  import { Telemetry } from '@/types/opentelemetry';
  import { beautifyTime } from '@/utils/helpers';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
      date?: string[];
      service?: string;
    }>(),
    {
      env: undefined,
      date: undefined,
      service: undefined,
    },
  );

  watch(
    () => props.date,
    async (newValue) => {
      if (newValue && newValue.length === 2 && props.env.clusterName && props.service) {
        pagination.start = moment(props.date[0]).utc().format();
        pagination.end = moment(props.date[1]).utc().format();
        nextTick(() => {
          getOperation();
        });
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.service,
    async (newValue) => {
      if (newValue && props.env.clusterName) {
        nextTick(() => {
          pagination.page = 1;
          getOperation();
        });
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'labelvalue', align: 'start', sortable: false },
    { text: i18nLocal.t('table.avg_req'), value: 'requestRate', align: 'start' },
    { text: i18nLocal.t('table.p50_res'), value: 'p50DurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.p90_res'), value: 'p90DurationSeconds', align: 'start' },
    { text: i18nLocal.t('table.error_count'), value: 'errorRate', align: 'start' },
  ];

  let pagination: Pagination<Telemetry> = reactive<Pagination<Telemetry>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    start: '',
    end: '',
    sortby: '',
  });
  const getOperation = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Telemetry> = await useOperationPagination(
      new Telemetry(),
      props.env.clusterName,
      props.env.namespace,
      props.service,
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
      getOperation();
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
      getOperation();
    }
  };
</script>
