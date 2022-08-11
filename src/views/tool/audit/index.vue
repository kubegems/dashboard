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
              @change="onDatetimeChange(undefined)"
            />
            <v-btn class="primary--text" small text @click="refresh">
              <v-icon left small> mdi-refresh </v-icon>
              {{ $root.$t('operate.refresh') }}
            </v-btn>
          </v-sheet>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter :default="{ items: [], text: '检索', value: 'search' }" :filters="filters" @refresh="filterList" />
      </v-card-title>
      <v-data-table
        class="mx-4 kubegems__table-row-pointer"
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
        @item-expanded="toYaml"
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
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
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
            <pre class="kubegems__word-all-break px-2">{{ yaml }}</pre>
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
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from './i18n';
  import { getAuditList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseSelect from '@/mixins/select';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'Audit',
    i18n: {
      messages: messages,
    },
    mixins: [BaseFilter, BaseSelect],
    data: () => ({
      items: [],
      pageCount: 0,
      date: [],
      params: {
        page: 1,
        size: 20,
        // todo
        CreatedAt_gte: null,
        CreatedAt_lte: null,
        order: '-CreatedAt',
      },
      yaml: '',
      userItems: [],
    }),
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport']),
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.trigger_time'), value: 'createdAt', align: 'start', width: 220 },
          { text: this.$t('table.tenant'), value: 'tenant', align: 'start', width: 100 },
          { text: this.$t('table.account'), value: 'username', align: 'start', width: 100 },
          { text: this.$t('table.operate'), value: 'action', align: 'start', width: 100 },
          { text: 'Kind', value: 'module', align: 'start', width: 250 },
          { text: this.$t('table.object'), value: 'name', align: 'start', width: 300 },
          { text: this.$t('table.label'), value: 'labels', align: 'start' },
          { text: 'ClientIP', value: 'clientIP', align: 'start', width: 150 },
          { text: this.$t('table.status'), value: 'success', align: 'start', width: 100 },
          { text: '', value: 'data-table-expand' },
        ];
      },
      filters() {
        const userItems = [];
        this.userItems.forEach((user) => {
          userItems.push({
            text: user.text,
            value: user.text,
            parent: 'Username',
          });
        });
        return [
          { text: this.$t('filter.search'), value: 'search', items: [] },
          {
            text: this.$t('filter.account'),
            value: 'Username',
            items: userItems,
          },
          {
            text: this.$t('filter.status'),
            value: 'Success',
            items: [
              { text: this.$root.$t('status.success'), value: 'true', parent: 'Success' },
              { text: this.$root.$t('status.failure'), value: 'false', parent: 'Success' },
            ],
          },
          {
            text: this.$t('filter.action'),
            value: 'Action',
            items: [
              { text: this.$root.$t('operate.create'), value: '创建', parent: 'Action' },
              { text: this.$root.$t('operate.delete'), value: '删除', parent: 'Action' },
              { text: this.$root.$t('operate.update'), value: '更新', parent: 'Action' },
              { text: this.$root.$t('operate.shell'), value: '执行命令', parent: 'Action' },
              { text: this.$root.$t('operate.login'), value: '登录', parent: 'Action' },
              { text: this.$root.$t('operate.enable'), value: '启用', parent: 'Action' },
              { text: this.$root.$t('operate.disable'), value: '禁用', parent: 'Action' },
            ],
          },
        ];
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.generateSelectData();
        this.onDatetimeChange();
      });
    },
    methods: {
      async auditList() {
        // 点击更多
        this.$set(this.params, 'Tenant', this.Tenant().TenantName);
        if (this.AdminViewport) {
          this.$delete(this.params, 'Tenant');
        }
        const data = await getAuditList(this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      async generateSelectData() {
        if (this.AdminViewport) {
          await this.m_select_userSelectData();
          this.userItems = this.m_select_userItems;
        } else {
          await this.m_select_tenantUserSelectData();
          this.userItems = this.m_select_tenantUserItems;
        }
      },
      async onDatetimeChange() {
        Object.assign(this.params, convertStrToNum(this.$route.query));
        this.params.CreatedAt_gte = this.$moment(this.date[0]).format();
        this.params.CreatedAt_lte = this.$moment(this.date[1]).format();
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.params.page = 1;
        this.auditList();
      },
      filterList(params) {
        const defaultparams = {
          page: 1,
          size: 20,
          CreatedAt_gte: null,
          CreatedAt_lte: null,
          order: '-CreatedAt',
        };
        for (const key in defaultparams) {
          if (this.params[key]) {
            defaultparams[key] = this.params[key];
          }
        }
        Object.assign(defaultparams, params);
        this.params = defaultparams;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.params.page = 1;
        this.auditList();
      },
      refresh() {
        this.$refs.datetimePicker.refresh();
        this.onDatetimeChange();
      },
      toYaml({ item, value }) {
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
