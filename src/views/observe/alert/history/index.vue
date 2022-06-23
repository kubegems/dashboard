<template>
  <v-container class="alert-history" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ProjectEnvSelect :tenant="tenant" @refreshEnvironemnt="refreshEnvironemnt" />
          <BaseDatetimePicker v-model="date" clearable :default-value="180" :offset-y="4" @change="onDatetimeChange" />
          <div />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <HistorySearch v-model="histroyParams" :cluster="cluster" @search="onSearch" />
    </v-card>
    <v-card class="mt-3 pa-4">
      <v-data-table
        class="kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="ID"
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
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
          <span v-else>-</span>
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
          {{ $moment(item.StartsAt).format('yyyy/MM/DD hh:mm:ss') }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ $moment(item.CreatedAt).format('yyyy/MM/DD hh:mm:ss') }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.AlertInfo.SilenceCreator ? '是' : '-' }}
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
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2">
              <v-btn
                v-if="item.AlertInfo.SilenceCreator"
                block
                color="success"
                small
                text
                @click.stop="onRemoveBlacklist(item)"
              >
                移除黑名单
              </v-btn>
              <v-btn v-else block color="error" small text @click.stop="onAddBacklist(item)"> 加入黑名单 </v-btn>
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

  import HistorySearch from './components/HistorySearch';
  import { deletePrometheusBlacklist, getPrometheusAlertSearch, postAddPrometheusBlacklist } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deleteEmpty } from '@/utils/helpers';
  import ProjectEnvSelect from '@/views/observe/components/ProjectEnvSelect';

  export default {
    name: 'AlertHistroy',
    components: {
      ProjectEnvSelect,
      HistorySearch,
    },
    mixins: [BaseSelect],
    data() {
      this.filters = [
        { items: [], text: '名称', value: 'name' },
        { items: [], text: '资源', value: 'name' },
      ];

      this.levels = [
        { text: 'firing', value: 'firing', color: 'error' },
        { text: 'resolved', value: 'resolved', color: 'primary' },
      ];

      this.headers = [
        { text: '告警名称', value: 'name', align: 'start' },
        {
          text: '命名空间',
          value: 'namespace',
          align: 'start',
          cellClass: 'kubegems__table-nowrap-cell',
        },
        {
          text: '告警类型',
          value: 'type',
          align: 'start',
          width: 100,
          cellClass: 'kubegems__table-nowrap-cell',
        },
        { text: '详情', value: 'message', align: 'start' },
        { text: '级别', value: 'severity', align: 'start' },
        {
          text: '上次开始时间',
          value: 'startsAt',
          align: 'start',
          cellClass: 'kubegems__table-nowrap-cell',
        },
        {
          text: '上次触发事件',
          value: 'createdAt',
          align: 'start',
          cellClass: 'kubegems__table-nowrap-cell',
        },
        { text: '黑名单', value: 'silenceCreator', align: 'center', width: 80 },
        { text: '', value: 'action', align: 'center', width: 20 },
        { text: '', value: 'data-table-expand', align: 'end' },
      ];

      return {
        items: [],
        pageCount: 0,
        cluster: undefined,
        histroyParams: {
          alertname: null,
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
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: '暂未选择租户',
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
      refreshEnvironemnt(env) {
        this.params.cluster = env.clusterName;
        this.params.environment = env.environmentName;
        this.cluster = env.clusterName;
        this.onDatetimeChange();
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
          title: '告警黑名单',
          content: {
            text: '是否确认将此条告警信息加入告警黑名单中？',
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
          title: '告警黑名单',
          content: {
            text: '是否确认将此条告警信息从告警黑名单中移除？',
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
