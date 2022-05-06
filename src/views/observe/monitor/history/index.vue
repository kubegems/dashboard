<template>
  <v-container
    fluid
    class="alert-history"
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect v-model="tenant" />
      </template>
    </BaseBreadcrumb>
    <v-card>
      <div class="d-flex justify-space-between pa-3">
        <ClusterSelect
          ref="ClusterSelect"
          v-model="params.cluster"
          :auto-select-first="!AdminViewport"
          :clearable="AdminViewport"
          tenant
          :tid="tenant ? tenant.ID : 0"
          @change="onClusterChange"
        />
        <BaseDatetimePicker
          v-model="date"
          :default-value="180"
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
        item-key="ID"
        disable-sort
        @click:row="onRowClick"
      >
        <template #[`item.name`]="{ item }">
          {{ item.AlertInfo.Labels.gems_alertname }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.AlertInfo.Labels.gems_namespace }}
        </template>
        <template #[`item.message`]="{ item }">
          {{ item.Message }}
        </template>
        <template #[`item.count`]="{ item }">
          {{ item.Count }}
        </template>
        <template #[`item.type`]="{ item }">
          <span
            v-if="
              item.AlertInfo.Labels.gems_alert_resource && item.AlertInfo.Labels.gems_alert_rule
            "
          >
            {{
              `${item.AlertInfo.Labels.gems_alert_resource}.${item.AlertInfo.Labels.gems_alert_rule}`
            }}
          </span>
          <span v-else>-</span>
        </template>
        <template #[`item.severity`]="{ item }">
          <v-chip
            v-if="item.AlertInfo.Labels.severity === 'error'"
            color="error"
            small
          >
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
          <v-chip
            v-else-if="item.AlertInfo.Labels.severity === 'critical'"
            color="deep-purple"
            text-color="white"
            small
          >
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
          <v-chip
            v-else
            color="warning"
            x-small
          >
            {{ item.AlertInfo.Labels.severity }}
          </v-chip>
        </template>
        <template #[`item.startsAt`]="{ item }">
          {{ $moment(item.StartsAt).format("yyyy/MM/DD hh:mm:ss") }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ $moment(item.CreatedAt).format("yyyy/MM/DD hh:mm:ss") }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.AlertInfo.SilenceCreator ? "是" : "-" }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            class="pa-4"
          >
            <pre class="pre">{{ item.AlertInfo.Labels }}</pre>
          </td>
        </template>
        <template #[`item.action`]="{ item }">
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
                v-if="item.AlertInfo.SilenceCreator"
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
import { mapGetters, mapState } from 'vuex'
import {
  getPrometheusAletrsSearch,
  postAddPrometheusBlacklist,
  deletePrometheusBlacklist,
} from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import TenantSelect from '@/views/observe/components/TenantSelect'
import HistorySearch from './components/HistorySearch'
import BaseSelect from '@/mixins/select'
import { deleteEmpty } from '@/utils/helpers'

export default {
  name: 'AlertHistroy',
  components: {
    ClusterSelect,
    HistorySearch,
    TenantSelect,
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
      { text: '告警次数', value: 'count', align: 'start', width: 90 },
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
      tenant: null,
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  watch: {
    tenant: {
      handler(newValue) {
        if (newValue) {
          this.getHistoryList()
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.tenant = this.Tenant()
      }
    })
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

      // if (!this.AdminViewport && !params.namespace) {
      //   this.$store.commit('SET_SNACKBAR', {
      //     text: '请选择项目和环境',
      //     color: 'warning',
      //   })
      //   return
      // }

      const data = await getPrometheusAletrsSearch(this.tenant.ID, params)
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
