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
  <v-row>
    <v-col cols="2" :style="{ marginTop: '50px', position: 'relative' }">
      <label>{{ i18nLocal.t('tip.duration') }}</label>
      <v-row class="pa-3">
        <v-col class="py-0" cols="12">
          <label>min</label>
          <v-text-field
            v-model="pagination.minDuration"
            dense
            flat
            hide-details
            :label="$t('form.name')"
            required
            solo
          />
        </v-col>
        <v-col class="py-0" cols="12">
          <label>max</label>
          <v-text-field
            v-model="pagination.maxDuration"
            dense
            flat
            hide-details
            :label="$t('form.name')"
            required
            solo
          />
        </v-col>
      </v-row>
      <label>{{ i18nLocal.t('tip.limit') }}</label>
      <v-row class="pa-3">
        <v-col class="py-0" cols="12">
          <label>limit</label>
          <v-text-field
            v-model.number="pagination.limit"
            dense
            flat
            hide-details
            :label="$t('form.name')"
            required
            solo
          />
        </v-col>
      </v-row>
      <v-btn class="mt-2 float-right mr-4" color="primary" small @click="query">{{ i18nLocal.t('tip.query') }}</v-btn>
      <v-divider class="divider" vertical />
    </v-col>
    <v-col cols="10">
      <v-data-table
        class="mx-1"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      />

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getTrace"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { nextTick, reactive, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import { useTracePagination } from '@/composition/telemetry';
  import { useGlobalI18n } from '@/i18n';
  import { Telemetry } from '@/types/opentelemetry';

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
          getTrace();
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
          getTrace();
        });
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.start_end'), value: 'startEnd', align: 'start' },
    { text: 'TraceId', value: 'traceID', align: 'start' },
    { text: 'Operation', value: 'operation', align: 'start' },
    { text: i18nLocal.t('table.duration'), value: 'duration', align: 'start' },
  ];

  let pagination: Pagination<Telemetry> = reactive<Pagination<Telemetry>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    start: '',
    end: '',
    maxDuration: '100ms',
    minDuration: '0ms',
    limit: 100,
  });
  const getTrace = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Telemetry> = await useTracePagination(
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

  const query = (): void => {
    getTrace();
  };
</script>

<style lang="scss" scoped>
  .divider {
    position: absolute;
    right: 0;
    top: 20px;
    min-height: 88%;
  }
</style>
