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
      :items="items"
      hide-default-footer
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无告警"
      single-expand
      show-expand
      item-key="index"
      @page-count="tab === 0 ? (pageCount = $event) : null"
      @click:row="onRowClick"
    >
      <template #[`item.message`]="{ item }">
        {{ tab === 0 ? item.Annotations.message : item.Message }}
      </template>
      <template #[`item.severity`]="{ item }">
        <v-chip
          :color="
            item.Labels.severity === 'critical' ? 'deep-purple' : item.Labels.severity === 'error' ? 'red' : 'warning'
          "
          small
          class="font-weight-medium white--text severity-chip"
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
            small
            class="ma-1 white--text"
            color="success"
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
      @loaddata="init"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import { getPrometheusRuleDetail, getPrometheusAlertHistory, getLogAlertRuleDetail } from '@/api';
  import BaseAlert from '../mixins/alert';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AlertList',
    mixins: [BaseResource, BaseAlert],
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
        tabItems: [
          { text: '实时告警', value: 'AlertNow' },
          { text: '历史告警', value: 'AlertHistory' },
        ],
        timeParams: {},
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: '消息', value: 'message', align: 'start' },
          { text: '级别', value: 'severity', align: 'start', width: 100 },
          { text: '状态', value: 'status', align: 'start', width: 100 },
          { text: '首次触发时间', value: 'activeAt', align: 'start', width: 200 },
          { text: '', value: 'data-table-expand' },
        ];
        if (this.tab === 0) {
          items.splice(4, 0, {
            text: '触发值',
            value: 'value',
            align: 'start',
          });
        }
        if (this.tab === 1) {
          items.splice(4, 0, {
            text: '结束时间',
            value: 'endsAt',
            align: 'start',
            width: 200,
          });
          items.splice(5, 0, {
            text: '上次告警时间',
            value: 'createdAt',
            align: 'start',
            width: 200,
          });
          items.splice(6, 0, {
            text: '告警数量',
            value: 'count',
            align: 'start',
          });
        }
        return items;
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
      // eslint-disable-next-line vue/no-unused-properties
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
