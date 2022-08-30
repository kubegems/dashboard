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
  <v-container class="alert-history" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ProjectEnvSelectCascade v-model="env" first reverse :tenant="tenant" />

          <BaseDatetimePicker v-model="date" clearable :default-value="180" :offset-y="0" @change="onDatetimeChange" />
          <div />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <HistorySearch v-model="histroyParams" :cluster="cluster" @search="onSearch" />
    </v-card>
    <v-card class="mt-3 pa-4" flat>
      <v-data-table
        class="kubegems__table-row-pointer"
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
      >
        <template #[`item.name`]="{ item }">
          {{ item.AlertInfo.Name }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.AlertInfo.Namespace }}
        </template>
        <template #[`item.message`]="{ item }">
          {{ item.Message }}
        </template>
        <template #[`item.type`]="{ item }">
          <span v-if="item.AlertInfo.Labels.gems_alert_resource && item.AlertInfo.Labels.gems_alert_rule">
            {{ `${item.AlertInfo.Labels.gems_alert_resource}.${item.AlertInfo.Labels.gems_alert_rule}` }}
          </span>
          <span v-else-if="item.AlertInfo.Labels.gems_alert_from === 'logging'">
            {{ `${item.AlertInfo.Labels.gems_alert_from}` }}</span
          >
          <span v-else> {{ `raw promql` }}</span>
        </template>
        <template #[`item.severity`]="{ item }">
          <v-chip v-if="item.AlertInfo.Labels.severity === 'error'" color="error" small>
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
          <v-chip
            v-else-if="item.AlertInfo.Labels.severity === 'critical'"
            color="deep-purple"
            small
            text-color="white"
          >
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
          <v-chip v-else color="warning" x-small>
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
        </template>
        <template #[`item.startsAt`]="{ item }">
          {{ $moment(item.StartsAt).format('lll') }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ $moment(item.CreatedAt).format('lll') }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.AlertInfo.SilenceCreator ? $t('tip.yes') : '-' }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="pa-4" :colspan="headers.length">
            <pre class="pre">{{ item.AlertInfo.Labels }}</pre>
          </td>
        </template>
        <template #[`item.action`]="{ item }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2" flat>
              <v-btn
                v-if="item.AlertInfo.SilenceCreator"
                block
                color="success"
                small
                text
                @click.stop="onRemoveBlacklist(item)"
              >
                {{ $t('operate.remove_blacklist') }}
              </v-btn>
              <v-btn v-else block color="error" small text @click.stop="onAddBacklist(item)">
                {{ $t('operate.in_blacklist') }}
              </v-btn>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="getHistoryList"
      />
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import HistorySearch from './components/HistorySearch';
  import { deletePrometheusBlacklist, getPrometheusAlertSearch, postAddPrometheusBlacklist } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deleteEmpty } from '@/utils/helpers';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'AlertHistroy',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelectCascade,
      HistorySearch,
    },
    mixins: [BaseSelect],
    data() {
      return {
        items: [],
        pageCount: 0,
        cluster: undefined,
        histroyParams: {
          alertname: null,
          scope: null,
          resource: null,
          rule: null,
          status: null,
        },
        params: {
          cluster: null,
          labelpairs: undefined,
          start: null,
          end: null,
          page: 1,
          size: 10,
        },
        date: [],
        tenant: null,
        env: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      // filters() {
      //   return [
      //     { items: [], text: this.$t('filter.name'), value: 'name' },
      //     { items: [], text: this.$t('filter.resource'), value: 'name' },
      //   ];
      // },
      // levels() {
      //   return [
      //     { text: 'firing', value: 'firing', color: 'error' },
      //     { text: 'resolved', value: 'resolved', color: 'primary' },
      //   ];
      // },
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          {
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            cellClass: 'kubegems__table-nowrap-cell',
            width: 80,
          },
          {
            text: this.$t('tip.alert_type'),
            value: 'type',
            align: 'start',
            width: 100,
            cellClass: 'kubegems__table-nowrap-cell',
          },
          { text: this.$t('table.message'), value: 'message', align: 'start' },
          { text: this.$t('table.severity'), value: 'severity', align: 'start' },
          {
            text: this.$t('table.start_at'),
            value: 'startsAt',
            align: 'start',
            cellClass: 'kubegems__table-nowrap-cell',
          },
          {
            text: this.$t('table.trigger_at'),
            value: 'createdAt',
            align: 'start',
            cellClass: 'kubegems__table-nowrap-cell',
          },
          { text: this.$t('table.blacklist'), value: 'silenceCreator', align: 'center', width: 80 },
          { text: '', value: 'action', align: 'center', width: 20 },
          { text: '', value: 'data-table-expand', align: 'end' },
        ];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.params.cluster = newValue.clusterName;
            this.params.environment = newValue.environmentName;
            this.cluster = newValue.clusterName;
            this.onDatetimeChange();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_tenant'),
            color: 'warning',
          });
          return;
        }
        this.tenant = this.Tenant();
      });
    },
    methods: {
      async getHistoryList() {
        const params = deleteEmpty({
          ...this.params,
          ...this.histroyParams,
          start: this.date[0] ? this.$moment(this.date[0]).utc().format() : undefined,
          end: this.date[1] ? this.$moment(this.date[1]).utc().format() : undefined,
        });

        const data = await getPrometheusAlertSearch(this.tenant.ID, params);
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.items = data.List || [];
      },
      onSearch() {
        this.params.page = 1;
        this.getHistoryList();
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.getHistoryList();
      },
      onAddBacklist(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.in_blacklist'),
          content: {
            text: this.$t('tip.confirm_in_blacklist'),
            type: 'confirm',
          },
          doFunc: async () => {
            await postAddPrometheusBlacklist({ Fingerprint: item.Fingerprint });
            this.getHistoryList();
          },
        });
      },
      onRemoveBlacklist(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.remove_blacklist'),
          content: {
            text: this.$t('tip.confirm_remove_blacklist'),
            type: 'confirm',
          },
          doFunc: async () => {
            await deletePrometheusBlacklist(item.Fingerprint);
            this.getHistoryList();
          },
        });
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
