<template>
  <v-container
    fluid
    class="alert-history"
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <div class="d-flex justify-space-between pa-3">
        <ClusterSelect
          ref="ClusterSelect"
          v-model="params.cluster"
          :auto-select-first="!AdminViewport"
          :clearable="AdminViewport"
          @change="onClusterChange"
        />
        <BaseDatetimePicker2
          v-model="date"
          clearable
        />
      </div>
      <HistorySearch
        v-model="histroyParams"
        :cluster="clusterId"
        @search="onSearch"
      />
    </v-card>
    <v-card class="mt-4 pa-4">
      <v-data-table
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text=""
        hide-default-footer
        show-expand
        single-expand
        item-key="Fingerprint"
        disable-sort
        @click:row="onRowClick"
      >
        <template #[`item.Name`]="{ item }">
          {{ item.Labels.gems_alertname }}
        </template>
        <template #[`item.Namespace`]="{ item }">
          {{ item.Labels.gems_namespace }}
        </template>
        <template #[`item.Type`]="{ item }">
          <span v-if="item.Labels.gems_alert_resource && item.Labels.gems_alert_rule">
            {{ `${item.Labels.gems_alert_resource}.${item.Labels.gems_alert_rule}` }}
          </span>
          <span v-else>-</span>
        </template>
        <template #[`item.Severity`]="{ item }">
          <v-chip
            v-if="item.Labels.severity === 'error'"
            color="error"
            small
          >
            {{ item.Labels.severity }}
          </v-chip>
          <v-chip
            v-else-if="item.Labels.severity === 'critical'"
            color="deep-purple"
            text-color="white"
            small
          >
            {{ item.Labels.severity }}
          </v-chip>
          <v-chip
            v-else
            color="warning"
            x-small
          >
            {{ item.Labels.severity }}
          </v-chip>
        </template>
        <template #[`item.StartsAt`]="{ item }">
          {{ $moment(item.StartsAt).format('yyyy/MM/DD hh:mm:ss') }}
        </template>
        <template #[`item.CreatedAt`]="{ item }">
          {{ $moment(item.CreatedAt).format('yyyy/MM/DD hh:mm:ss') }}
        </template>
        <template #[`item.SilenceCreator`]="{ item }">
          {{ item.SilenceCreator ? '是' : '-' }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            class="pa-4"
          >
            <pre class="pre">{{ item.Labels }}</pre>
          </td>
        </template>
        <template #[`item.Action`]="{ item }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2">
              <v-btn
                v-if="item.SilenceCreator"
                color="success"
                text
                small
                block
                @click.stop="onRemoveBlacklist(item)"
              >
                移除黑名单
              </v-btn>
              <v-btn
                v-else
                color="error"
                text
                small
                block
                @click.stop="onAddBacklist(item)"
              >
                加入黑名单
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
        @loaddata="getHistoryList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getPrometheusAletrsSearch,
  postAddPrometheusBlacklist,
  deletePrometheusBlacklist,
} from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import HistorySearch from './components/HistorySearch'
import BaseSelect from '@/mixins/select'
import { deleteEmpty } from '@/utils/helpers'

export default {
  name: 'AlertHistroy',
  components: {
    ClusterSelect,
    HistorySearch,
  },
  mixins: [BaseSelect],
  data() {
    this.breadcrumb = {
      title: '告警历史',
      tip: '产生告警的历史信息汇总',
      icon: 'mdi-history',
    }

    this.filters = [
      { items: [], text: '名称', value: 'name' },
      { items: [], text: '资源', value: 'name' },
    ]

    this.levels = [
      { text: 'firing', value: 'firing', color: 'error' },
      { text: 'resolved', value: 'resolved', color: 'primary' },
    ]

    this.headers = [
      { text: '告警名称', value: 'Name', align: 'start' },
      {
        text: '命名空间',
        value: 'Namespace',
        align: 'start',
        cellClass: 'kubegems__table-nowrap-cell',
      },
      {
        text: '告警类型',
        value: 'Type',
        align: 'start',
        width: 100,
        cellClass: 'kubegems__table-nowrap-cell',
      },
      { text: '详情', value: 'Message', align: 'start' },
      { text: '级别', value: 'Severity', align: 'start' },
      { text: '告警次数', value: 'Count', align: 'start', width: 90 },
      {
        text: '上次开始时间',
        value: 'StartsAt',
        align: 'start',
        cellClass: 'kubegems__table-nowrap-cell',
      },
      {
        text: '上次触发事件',
        value: 'CreatedAt',
        align: 'start',
        cellClass: 'kubegems__table-nowrap-cell',
      },
      { text: '黑名单', value: 'SilenceCreator', align: 'center', width: 80 },
      { text: '', value: 'data-table-expand', align: 'end' },
      { text: '', value: 'Action', align: 'center', width: 40 },
    ]

    return {
      items: [],
      pageCount: 0,
      clusterId: undefined,
      histroyParams: {
        namespace: this.$route.query.namespace,
        alertname: this.$route.query.alertname,
        project: this.$route.query.project,
        resource: this.$route.query.resource,
        rule: this.$route.query.rule,
        status: this.$route.query.status,
      },
      params: {
        cluster: this.$route.query.cluster,
        labelpairs: undefined,
        start: this.$route.query.start,
        end: this.$route.query.end,
        page: 1,
        size: 10,
      },
      date: [],
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  mounted() {
    if (this.AdminViewport) this.getHistoryList()
  },
  methods: {
    async getHistoryList() {
      const params = deleteEmpty({
        ...this.params,
        ...this.histroyParams,
        start: this.date[0]
          ? this.$moment(this.date[0]).utc().format()
          : undefined,
        end: this.date[1]
          ? this.$moment(this.date[1]).utc().format()
          : undefined,
      })
      this.$router.replace({ query: { ...params } })
      delete params.project

      if (!this.AdminViewport && !params.namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请选择项目和环境',
          color: 'warning',
        })
        return
      }

      const data = await getPrometheusAletrsSearch(params)
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.items = data.List || []
    },
    onClusterChange() {
      this.clusterId = this.$refs.ClusterSelect.items.find(
        (cluster) => cluster.text === this.params.cluster,
      )?.value
    },
    onSearch() {
      this.params.page = 1
      this.getHistoryList()
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onAddBacklist(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '告警黑名单',
        content: {
          text: '是否确认将此条告警信息加入告警黑名单中？',
          type: 'confirm',
        },
        doFunc: async () => {
          await postAddPrometheusBlacklist({ Fingerprint: item.Fingerprint })
          this.getHistoryList()
        },
      })
    },
    onRemoveBlacklist(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '告警黑名单',
        content: {
          text: '是否确认将此条告警信息从告警黑名单中移除？',
          type: 'confirm',
        },
        doFunc: async () => {
          await deletePrometheusBlacklist(item.Fingerprint)
          this.getHistoryList()
        },
      })
    },
    onRowClick(item, { expand, isExpanded }) {
      expand(!isExpanded)
    },
  },
}
</script>
