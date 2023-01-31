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
  <v-card class="pa-2" flat>
    <v-card-title class="pa-0">
      <v-chip-group v-model="action" class="ml-2 align-center" column @change="actionStatusChange">
        <v-chip
          v-for="(item, index) in actionItems"
          :key="index"
          class="font-weight-medium"
          :color="item.color"
          label
          :outlined="action !== index"
          small
          :text-color="`${action !== index ? item.color : 'white'}`"
        >
          {{ item.text }}
        </v-chip>
      </v-chip-group>
    </v-card-title>
    <v-data-table
      class="mx-2"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="ID"
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="pagination.page"
      show-expand
      single-expand
      @click:row="rowClick"
      @item-expanded="convertYaml"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.CreatedAt ? moment(item.CreatedAt).format('lll') : '' }}
      </template>
      <template #[`item.clientIP`]="{ item }">
        {{ item.ClientIP }}
      </template>
      <template #[`item.tenant`]="{ item }">
        {{ item.Tenant }}
      </template>
      <template #[`item.action`]="{ item }">
        {{ item.Action }}
      </template>
      <template #[`item.module`]="{ item }">
        {{ item.Module }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.Name }}
      </template>
      <template #[`item.success`]="{ item }">
        <v-icon v-if="item.Success" color="success" small> mdi-check-circle </v-icon>
        <v-icon v-else color="error" small> mdi-close-circle </v-icon>
      </template>
      <template #expanded-item="{ headers }">
        <td :colspan="headers.length">
          <pre class="kubegems__word-all-break">{{ yamlStr }}</pre>
        </td>
      </template>
      <template #[`item.labels`]="{ item }">
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
</template>

<script lang="ts" setup>
  import yaml from 'js-yaml';
  import moment from 'moment';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import { useAuditPagination } from '@/composition/audit';
  import { useGlobalI18n } from '@/i18n';
  import { Audit } from '@/types/audit';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const headers = [
    { text: i18nLocal.t('audit.table.trigger_time'), value: 'createdAt', align: 'start', width: 220 },
    { text: i18nLocal.t('audit.table.tenant'), value: 'tenant', align: 'start', width: 100 },
    { text: i18nLocal.t('audit.table.operate'), value: 'action', align: 'start', width: 100 },
    { text: 'Kind', value: 'module', align: 'start', width: 250 },
    { text: i18nLocal.t('audit.table.object'), value: 'name', align: 'start', width: 300 },
    { text: i18nLocal.t('audit.table.label'), value: 'labels', align: 'start' },
    { text: 'ClientIP', value: 'clientIP', align: 'start', width: 150 },
    { text: i18nLocal.t('audit.table.status'), value: 'success', align: 'start', width: 100 },
    { text: '', value: 'data-table-expand' },
  ];

  const action = ref<number>(undefined);
  const actionItems = [
    { text: i18n.t('operate.create'), value: '创建', color: 'primary' },
    { text: i18n.t('operate.delete'), value: '删除', color: 'error' },
    { text: i18n.t('operate.update'), value: '更新', color: 'warning' },
    { text: i18n.t('operate.shell'), value: '执行命令', color: 'grey' },
    { text: i18n.t('operate.login'), value: '登录', color: 'success' },
    { text: i18n.t('operate.enable'), value: '启用', color: 'success' },
    { text: i18n.t('operate.disable'), value: '禁用', color: 'error' },
  ];

  const actionStatusChange = (): void => {
    getAuditList();
  };

  let pagination: Pagination<Audit> = reactive<Pagination<Audit>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getAuditList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Audit> = await useAuditPagination(new Audit(), params.page, params.size);
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

  onMounted(() => {
    getAuditList();
  });
</script>
