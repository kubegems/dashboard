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
      <v-chip-group v-model="action" class="ml-2 align-center" column @change="onActionStatusChange">
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
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
      show-expand
      single-expand
      @click:row="onRowClick"
      @item-expanded="convertYaml"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
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
          <pre class="kubegems__word-all-break">{{ yaml }}</pre>
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
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="auditList"
    />
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getAuditList } from '@/api';

  export default {
    name: 'AuditList',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        action: null,
        yaml: '',
      };
    },
    computed: {
      ...mapState(['JWT', 'User']),
      params() {
        return {
          page: 1,
          size: 20,
          order: '-CreatedAt',
          Username: this.User.Username,
          Action: this.action || this.action === 0 ? this.actionItems[this.action].value : null,
        };
      },
      headers() {
        return [
          { text: this.$t('audit.table.trigger_time'), value: 'createdAt', align: 'start', width: 220 },
          { text: this.$t('audit.table.tenant'), value: 'tenant', align: 'start', width: 100 },
          { text: this.$t('audit.table.operate'), value: 'action', align: 'start', width: 100 },
          { text: 'Kind', value: 'module', align: 'start', width: 250 },
          { text: this.$t('audit.table.object'), value: 'name', align: 'start', width: 300 },
          { text: this.$t('audit.table.label'), value: 'labels', align: 'start' },
          { text: 'ClientIP', value: 'clientIP', align: 'start', width: 150 },
          { text: this.$t('audit.table.status'), value: 'success', align: 'start', width: 100 },
          { text: '', value: 'data-table-expand' },
        ];
      },
      actionItems() {
        return [
          { text: this.$root.$t('operate.create'), value: '创建', color: 'primary' },
          { text: this.$root.$t('operate.delete'), value: '删除', color: 'error' },
          { text: this.$root.$t('operate.update'), value: '更新', color: 'warning' },
          { text: this.$root.$t('operate.shell'), value: '执行命令', color: 'grey' },
          { text: this.$root.$t('operate.login'), value: '登录', color: 'success' },
          { text: this.$root.$t('operate.enable'), value: '启用', color: 'success' },
          { text: this.$root.$t('operate.disable'), value: '禁用', color: 'error' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.auditList();
      }
    },
    methods: {
      onActionStatusChange() {
        this.auditList();
      },
      async auditList(noprocess = false) {
        const data = await getAuditList(Object.assign(this.params, { noprocessing: noprocess }));
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      convertYaml({ item, value }) {
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
          this.yaml = this.$yamldump(item.RawData);
        }
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
