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
        <v-flex class="kubegems__full-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker
              ref="datetimePicker"
              v-model="date"
              :default-value="30"
              default-value-for-query
              query-end-time-key="CreatedAt_lte"
              query-start-time-key="CreatedAt_gte"
              value-change-to-query
              value-format="yyyy-MM-ddThh:mm:ss"
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
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.search'), value: 'search' }" :filters="filters" />
      </v-card-title>
      <v-data-table
        class="mx-4 kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="ID"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-expand
        single-expand
        @click:row="rowClick"
        @item-expanded="convertYaml"
      >
        <template #item.createdAt="{ item }">
          {{ item.CreatedAt ? moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #item.clientIP="{ item }">
          {{ item.ClientIP }}
        </template>
        <template #item.tenant="{ item }">
          {{ item.Tenant }}
        </template>
        <template #item.username="{ item }">
          {{ item.Username }}
        </template>
        <template #item.action="{ item }">
          {{ item.Action }}
        </template>
        <template #item.module="{ item }">
          {{ item.Module }}
        </template>
        <template #item.name="{ item }">
          {{ item.Name }}
        </template>
        <template #item.success="{ item }">
          <v-icon v-if="item.Success" color="success" small> mdi-check-circle </v-icon>
          <v-icon v-else color="error" small> mdi-close-circle </v-icon>
        </template>
        <template #expanded-item="{ headers }">
          <td :colspan="headers.length">
            <pre class="kubegems__word-all-break px-2">{{ yamlStr }}</pre>
          </td>
        </template>
        <template #item.labels="{ item }">
          <v-chip
            v-for="(value, key) in item ? item.Labels : {}"
            :key="key"
            class="ma-1"
            color="success"
            small
            text-color="white"
          >
            <strong class="mx-1"> {{ key }} </strong>
            {{ value }}
          </v-chip>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getAuditList"
      />
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import yaml from 'js-yaml';
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from './i18n';
  import { useAuditPagination } from '@/composition/audit';
  import { useTenantUserList } from '@/composition/tenant';
  import { useUserList } from '@/composition/user';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import store from '@/store';
  import { Audit } from '@/types/audit';
  import { Tenant } from '@/types/tenant';
  import { User } from '@/types/user';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const date = ref([]);
  const datetimeChanged = (): void => {
    pagination.page = 1;
    getAuditList();
  };

  const datetimePicker = ref(null);
  const refresh = () => {
    datetimePicker.value.refresh(true);
  };

  const headers = [
    { text: i18nLocal.t('table.trigger_time'), value: 'createdAt', align: 'start', width: 220 },
    { text: i18nLocal.t('table.tenant'), value: 'tenant', align: 'start', width: 100 },
    { text: i18nLocal.t('table.account'), value: 'username', align: 'start', width: 100 },
    { text: i18nLocal.t('table.operate'), value: 'action', align: 'start', width: 100 },
    { text: 'Kind', value: 'module', align: 'start', width: 250 },
    { text: i18nLocal.t('table.object'), value: 'name', align: 'start', width: 300 },
    { text: i18nLocal.t('table.label'), value: 'labels', align: 'start' },
    { text: 'ClientIP', value: 'clientIP', align: 'start', width: 150 },
    { text: i18nLocal.t('table.status'), value: 'success', align: 'start', width: 100 },
    { text: '', value: 'data-table-expand' },
  ];

  let pagination: Pagination<Audit> = reactive<Pagination<Audit>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      Tenant: null,
      Username: null,
      Action: null,
      Success: null,
      CreatedAt_gte: null,
      CreatedAt_lte: null,
      search: '',
    },
  });

  const getAuditList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    params.request = Object.assign(params.request, useQuery().value);
    params.request.CreatedAt_gte = moment(params.request.CreatedAt_gte).utc().format();
    params.request.CreatedAt_lte = moment(params.request.CreatedAt_lte).utc().format();
    params.request.Tenant = store.getters.Tenant().TenantName;
    if (store.state.AdminViewport) {
      params.request.Tenant = null;
    }
    const data: Pagination<Audit> = await useAuditPagination(new Audit(), params.page, params.size, params.request);
    pagination = Object.assign(pagination, data);
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

  const yamlStr = ref<string>('');
  const convertYaml = ({ item, value }): void => {
    if (value) {
      if (item.RawData.request) {
        try {
          item.RawData.request = JSON.parse(item.RawData.request);
        } catch {
          //
        }
      }
      if (item.RawData.response) {
        try {
          item.RawData.response = JSON.parse(item.RawData.response);
        } catch {
          //
        }
      }
      yamlStr.value = yaml.dump(item.RawData);
    }
  };

  const userItems = ref([]);
  const filters: ComputedRef<any[]> = computed(() => {
    return [
      { text: i18nLocal.t('filter.search'), value: 'search', items: [] },
      {
        text: i18nLocal.t('filter.account'),
        value: 'Username',
        items: userItems.value,
      },
      {
        text: i18nLocal.t('filter.status'),
        value: 'Success',
        items: [
          { text: i18n.t('status.success'), value: 'true', parent: 'Success' },
          { text: i18n.t('status.failure'), value: 'false', parent: 'Success' },
        ],
      },
      {
        text: i18nLocal.t('filter.action'),
        value: 'Action',
        items: [
          { text: i18n.t('operate.create'), value: i18n.t('operate.create'), parent: 'Action' },
          { text: i18n.t('operate.delete'), value: i18n.t('operate.delete'), parent: 'Action' },
          { text: i18n.t('operate.update'), value: i18n.t('operate.update'), parent: 'Action' },
          { text: i18n.t('operate.shell'), value: i18n.t('operate.shell'), parent: 'Action' },
          { text: i18n.t('operate.login'), value: i18n.t('operate.login'), parent: 'Action' },
          { text: i18n.t('operate.enable'), value: i18n.t('operate.enable'), parent: 'Action' },
          { text: i18n.t('operate.disable'), value: i18n.t('operate.disable'), parent: 'Action' },
        ],
      },
    ];
  });
  const generateFilter = async (): Promise<void> => {
    let data: User[];
    if (store.state.AdminViewport) {
      data = await useUserList(new User());
    } else {
      data = await useTenantUserList(new Tenant({ ID: store.getters.Tenant().ID }));
    }
    userItems.value = data.map((u) => {
      return { text: u.Username, value: u.Username, parent: 'Username' };
    });
  };
  const query = useQuery();
  watch(
    () => query.value.search,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.request.search = newValue;
        getAuditList();
      } else {
        pagination.request.search = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.Username,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.request.Username = newValue;
        getAuditList();
      } else {
        pagination.request.Username = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.Success,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.request.Success = newValue;
        getAuditList();
      } else {
        pagination.request.Success = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.Action,
    async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        pagination.request.Action = newValue;
        getAuditList();
      } else {
        pagination.request.Action = '';
      }
    },
    {
      deep: true,
    },
  );

  onMounted(() => {
    generateFilter();
    datetimeChanged();
  });
</script>
