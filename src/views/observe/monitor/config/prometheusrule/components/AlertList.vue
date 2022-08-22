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
    <v-tabs v-model="tab" :height="30" @change="onTabChange">
      <v-tab v-for="item in tabItems" :key="item.text">
        {{ item.text }}
      </v-tab>
    </v-tabs>
    <v-data-table
      class="kubegems__table-row-pointer"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="index"
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
      show-expand
      single-expand
      @click:row="onRowClick"
      @page-count="tab === 0 ? (pageCount = $event) : null"
    >
      <template #[`item.message`]="{ item }">
        {{ tab === 0 ? item.Annotations.message : item.Message }}
      </template>
      <template #[`item.severity`]="{ item }">
        <v-chip
          class="font-weight-medium white--text severity-chip"
          :color="
            item.Labels.severity === 'critical' ? 'deep-purple' : item.Labels.severity === 'error' ? 'red' : 'warning'
          "
          small
        >
          <span>
            {{ item.Labels.severity }}
          </span>
        </v-chip>
      </template>
      <template #[`item.status`]="{ item }">
        {{ tab === 0 ? item.State : item.Status }}
      </template>
      <template #[`item.count`]="{ item }">
        {{ item.Count }}
      </template>
      <template #[`item.activeAt`]="{ item }">
        {{
          tab === 0
            ? item.activeAt
              ? $moment(item.activeAt).format('lll')
              : ''
            : item.StartsAt
            ? $moment(item.StartsAt).format('lll')
            : ''
        }}
      </template>
      <template v-if="tab === 1" #[`item.endsAt`]="{ item }">
        {{ item.EndsAt ? $moment(item.EndsAt).format('lll') : '' }}
      </template>
      <template v-if="tab === 1" #[`item.createdAt`]="{ item }">
        {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
      </template>
      <template v-if="tab === 0" #[`item.value`]="{ item }">
        {{ item.Annotations ? parseFloat(item.Annotations.value) : '' }}
      </template>
      <template #expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-chip
            v-for="(value, key) in item ? (tab === 0 ? item.Labels : item.Labels) : {}"
            :key="key"
            class="ma-1 white--text"
            color="success"
            small
          >
            <strong class="mx-1"> {{ key }} </strong>
            {{ value }}
          </v-chip>
        </td>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :front-page="tab === 0 ? true : false"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="init"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import BaseAlert from '../mixins/alert';
  import { getLogAlertRuleDetail, getPrometheusAlertHistory, getPrometheusRuleDetail } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AlertList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseAlert, BaseResource],
    props: {
      mode: {
        type: String,
        default: () => 'monitor',
      },
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
          noprocessing: true,
        },
        tab: this.$route.query.createAt ? 1 : 0,
        timeParams: {},
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: this.$t('table.message'), value: 'message', align: 'start' },
          { text: this.$t('table.severity'), value: 'severity', align: 'start', width: 100 },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 100 },
          { text: this.$t('table.first_at'), value: 'activeAt', align: 'start', width: 200 },
          { text: '', value: 'data-table-expand' },
        ];
        if (this.tab === 0) {
          items.splice(4, 0, {
            text: this.$t('table.trigger_val'),
            value: 'value',
            align: 'start',
          });
        }
        if (this.tab === 1) {
          items.splice(4, 0, {
            text: this.$t('table.end_at'),
            value: 'endsAt',
            align: 'start',
            width: 200,
          });
          items.splice(5, 0, {
            text: this.$t('table.last_alert_at'),
            value: 'createdAt',
            align: 'start',
            width: 200,
          });
          items.splice(6, 0, {
            text: this.$t('table.alert_count'),
            value: 'count',
            align: 'start',
          });
        }
        return items;
      },
      tabItems() {
        return [
          { text: this.$t('tab.living_alert'), value: 'AlertNow' },
          { text: this.$t('tab.history_alert'), value: 'AlertHistory' },
        ];
      },
    },
    methods: {
      init() {
        this.$nextTick(() => {
          this.tab === 0
            ? this.mode === 'monitor'
              ? this.prometheusRuleDetail()
              : this.alertRuleDetail()
            : this.prometheusAlertHistory();
        });
      },
      onTabChange() {
        this.pageCount = 0;
        this.params.page = 1;
        this.params.size = 10;
        this.items = [];
        this.init();
      },
      async prometheusRuleDetail() {
        this.items = [];
        const data = await getPrometheusRuleDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          { noprocessing: true, isAdmin: this.AdminViewport },
        );
        if (data) {
          this.items = (data.realTimeAlerts || []).map((item, index) => ({
            ...item,
            index,
          }));
        }
      },
      async alertRuleDetail() {
        this.items = [];
        const data = await getLogAlertRuleDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          { noprocessing: true, isAdmin: this.AdminViewport },
        );
        if (data) {
          this.items = (data.realTimeAlerts || []).map((item, index) => ({
            ...item,
            index,
          }));
        }
      },
      async prometheusAlertHistory() {
        const data = await getPrometheusAlertHistory(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          Object.assign(this.params, {
            ...this.timeParams,
            status: 'resolved',
          }),
        );
        if (data.List) {
          this.pageCount = Math.ceil(data.Total / this.params.size);
          this.params.page = data.CurrentPage;
          this.items = data.List.map((item, index) => {
            return { index: index, ...item };
          });
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
      setParams(data) {
        this.timeParams = data;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .severity-chip {
    width: 60px;
    justify-content: center;
  }
</style>
