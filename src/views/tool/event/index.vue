<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right align-center">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker
              ref="datetimePicker"
              v-model="date"
              :default-value="30"
              default-value-for-query
              value-change-to-query
              query-start-time-key="start"
              query-end-time-key="end"
              @change="onDatetimeChange(undefined)"
            />
            <v-btn
              text
              small
              class="primary--text"
              @click="refresh"
            >
              <v-icon
                left
                small
              >
                fas fa-redo
              </v-icon>
              刷新
            </v-btn>
          </v-sheet>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card flat>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '消息', value: 'message' }"
          @refresh="filterList"
        />
      </v-card-title>
      <v-data-table
        class="mx-4 kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        :items="items"
        no-data-text="暂无数据"
        hide-default-footer
        single-expand
        show-expand
        item-key="index"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        @page-count="pageCount = $event"
        @click:row="onRowClick"
      >
        <template #[`item.reason`]="{ item }">
          {{ item.stream.reason }}
        </template>
        <template #[`item.type`]="{ item }">
          <v-chip
            :color="item.stream.type === 'Normal' ? 'success' : 'warning'"
            small
            class="font-weight-medium chip-width"
          >
            <span>{{ item.stream.type }}</span>
          </v-chip>
        </template>
        <template #[`item.count`]="{ item }">
          {{ item.stream.count }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{
            item.stream.metadata_namespace
              ? item.stream.metadata_namespace
              : ''
          }}
        </template>
        <template #[`item.name`]="{ item }">
          {{ item.stream.metadata_name ? item.stream.metadata_name : '' }}
        </template>
        <template #[`item.component`]="{ item }">
          {{
            item.stream.source_component ? item.stream.source_component : ''
          }}
        </template>
        <template #[`item.host`]="{ item }">
          {{ item.stream.source_host ? item.stream.source_host : '' }}
        </template>
        <template #[`item.firstAt`]="{ item }">
          {{
            item.stream.firstTimestamp
              ? $moment(item.stream.firstTimestamp).format('lll')
              : item.stream.metadata_creationTimestamp
                ? $moment(item.stream.metadata_creationTimestamp).format('lll')
                : ''
          }}
        </template>
        <template #[`item.lastAt`]="{ item }">
          {{
            item.stream.lastTimestamp
              ? $moment(item.stream.lastTimestamp).format('lll')
              : item.stream.metadata_creationTimestamp
                ? $moment(item.stream.metadata_creationTimestamp).format('lll')
                : ''
          }}
        </template>
        <template #[`item.message`]="{ item }">
          {{
            item.stream.message.length > 100
              ? item.stream.message.substr(0, 100) + '......'
              : item.stream.message
          }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            class="text-left"
          >
            <pre class="kubegems__word-all-break">{{ item.stream.message }}</pre>
          </td>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pageCount >= 1"
        v-model="page"
        :front-page="true"
        :page-count="pageCount"
        :size="itemsPerPage"
        @loaddata="onDatetimeChange"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
    <!-- </v-card> -->
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getEventListFromLoki } from '@/api'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'Event',
  mixins: [BaseFilter, BaseSelect],
  data: () => ({
    items: [],
    headers: [
      { text: '来源组件', value: 'component', align: 'start', width: 150 },
      { text: '来源主机', value: 'host', align: 'start', width: 250 },
      { text: '服务', value: 'name', align: 'start', width: 200 },
      { text: '命名空间', value: 'namespace', align: 'start', width: 150 },
      { text: '类型', value: 'type', align: 'start', width: 150 },
      { text: 'Reason', value: 'reason', align: 'start', width: 100 },
      { text: '消息', value: 'message', align: 'start', width: 200 },
      { text: '次数', value: 'count', align: 'start', width: 50 },
      { text: '首次发生时间', value: 'firstAt', align: 'start', width: 150 },
      { text: '最近发生时间', value: 'lastAt', align: 'start', width: 150 },
      { text: '', value: 'data-table-expand' },
    ],
    dataLength: 0,
    date: [],
    params: {
      limit: 500,
      clustername: undefined,
      start: null,
      end: null,
    },
    page: 1,
    itemsPerPage: 10,
    pageCount: 0,
    filters: [
      { text: '集群', value: 'clustername', items: [] },
      { text: '消息', value: 'message', items: [] },
      {
        text: 'Reason',
        value: 'reason',
        items: [
          { text: 'Evicted', value: 'Evicted', parent: 'reason' },
          { text: 'Scheduled', value: 'Scheduled', parent: 'reason' },
          {
            text: 'SuccessfulCreate',
            value: 'SuccessfulCreate',
            parent: 'reason',
          },
          {
            text: 'SuccessfulDelete',
            value: 'SuccessfulDelete',
            parent: 'reason',
          },
          {
            text: 'FailedDaemonPod',
            value: 'FailedDaemonPod',
            parent: 'reason',
          },
          {
            text: 'ImageGCFailed',
            value: 'ImageGCFailed',
            parent: 'reason',
          },
          {
            text: 'FreeDiskSpaceFailed',
            value: 'FreeDiskSpaceFailed',
            parent: 'reason',
          },
          {
            text: 'NodeHasNoDiskPressure',
            value: 'NodeHasNoDiskPressure',
            parent: 'reason',
          },
          {
            text: 'Started',
            value: 'Started',
            parent: 'reason',
          },
          {
            text: 'Unhealthy',
            value: 'Unhealthy',
            parent: 'reason',
          },
          {
            text: 'FailedGetResourceMetric',
            value: 'FailedGetResourceMetric',
            parent: 'reason',
          },
          {
            text: 'FailedComputeMetricsReplicas',
            value: 'FailedComputeMetricsReplicas',
            parent: 'reason',
          },
          {
            text: 'Killing',
            value: 'Killing',
            parent: 'reason',
          },
          {
            text: 'FailedCreate',
            value: 'FailedCreate',
            parent: 'reason',
          },
        ],
      },
    ],
  }),
  computed: {
    ...mapState(['JWT', 'Admin', 'Scale', 'AdminViewport']),
    ...mapGetters(['Cluster', 'Tenant']),
  },
  async mounted() {
    this.$nextTick(async () => {
      await this.generateSelectData()
      this.onDatetimeChange()
    })
  },
  methods: {
    getTenantIDByName(name) {
      if (this.m_select_tenantItems.length > 0) {
        const tenant = this.m_select_tenantItems.find((tenantObj) => {
          return tenantObj.text === name
        })
        return tenant ? tenant.value : null
      } else {
        return null
      }
    },
    async generateSelectData() {
      await this.m_select_tenantSelectData()
      const noClusterName = !this.$route.query.clustername
      if (this.AdminViewport) {
        await this.m_select_clusterSelectData(null)
      } else {
        await this.m_select_clusterSelectData(
          this.getTenantIDByName(this.Tenant().TenantName),
        )
      }
      if (this.m_select_clusterItems.length > 0) {
        const clusterFilterItem = this.m_select_clusterItems.map((clusterObj) => {
          return {
            text: clusterObj.text,
            value: clusterObj.text,
            parent: 'clustername',
          }
        })
        this.filters.find((filter) => {
          return filter.value === 'clustername'
        }).items = clusterFilterItem
        if (noClusterName) {
          this.params.clustername = this.m_select_clusterItems[0].text
          this.$router.replace({
            query: { ...this.$route.query, ...this.params },
          })
        }
      }
    },
    async onDatetimeChange() {
      if (this.JWT) {
        if (!(this.Tenant().ID > 0 || this.Admin)) {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或加入租户`,
            color: 'warning',
          })
          return
        }
      }
      Object.assign(this.params, convertStrToNum(this.$route.query))
      this.params.start = Date.parse(this.$moment(this.date[0]).utc().format())
      this.params.end = Date.parse(this.$moment(this.date[1]).utc().format())
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.eventList()
    },
    filterList(params) {
      const defaultparams = {
        limit: 500,
        clustername: undefined,
        start: null,
        end: null,
      }
      // 用当前路径参数覆盖默认参数
      for (const key in defaultparams) {
        if (this.params[key]) {
          defaultparams[key] = this.params[key]
        }
      }
      // 将选择的参数合并到默认参数
      Object.assign(defaultparams, params)
      this.params = defaultparams
      if (params['clustername']) {
        this.params.clustername = params['clustername']
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '请选择集群',
          color: 'warning',
        })
        this.params.clustername = null
      }
      if (this.Admin && !params['tenant']) {
        this.$set(this.params, 'tenant', null)
      }
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.eventList()
    },
    refresh() {
      this.$refs.datetimePicker.refresh()
      this.onDatetimeChange()
    },
    async eventList(loadMore = false) {
      if (!this.params.clustername) {
        this.items = []
        return
      }
      // 点击更多
      this.$set(this.params, 'tenant', this.Tenant().TenantName)
      // 点击工具箱
      if (this.AdminViewport) {
        this.$delete(this.params, 'tenant')
      }

      let timer = null
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        if (loadMore) {
          // TODO 获取新的起始时间
        }
        this.items = []
        let query = `{container="gems-eventer"}|json|__error__=""`
        if (this.params.tenant) {
          await this.m_select_environmentSelectData(
            this.getTenantIDByName(this.params.tenant),
          )
          const ns = []
          if (this.m_select_environmentItems.length === 0) {
            this.items = []
            return
          }
          this.m_select_environmentItems.forEach((e) => {
            ns.push(`^${e.value}$`)
          })
          query += `|line_format "{{.metadata_namespace}}"|~"${ns.join('|')}"`
        }
        if (this.params.message) {
          query += `|line_format "{{.message}}"|~ \`${this.params.message}\``
        }
        if (this.params.reason) {
          query += `|line_format "{{.reason}}"|~ \`${this.params.reason}\``
        }
        if (!this.Admin && !this.params.tenant) {
          return
        }
        const data = await getEventListFromLoki(this.params.clustername, {
          query: query,
          limit: this.params.limit,
          start: `${this.params.start}000000`,
          end: `${this.params.end}000000`,
          direction: 'backward',
          noprocessing: false,
        })
        this.dataLength = data ? data.length : 0
        const itemIndex = this.items.length
        if (data) {
          data.forEach((event, index) => {
            const tmp = {
              index: itemIndex + index,
              ...event,
            }
            this.items.push(tmp)
          })
        }
        this.items.sort((a, b) => {
          return parseInt(b.values[0]) - parseInt(a.values[0])
        })
      }, 0)
    },
    onRowClick(item, { expand, isExpanded }) {
      expand(!isExpanded)
    },
    onPageSizeChange(size) {
      this.page = 1
      this.itemsPerPage = size
    },
    onPageIndexChange(page) {
      this.page = page
    },
  },
}
</script>

<style lang="scss" scoped>
.chip-width {
  width: 70px;
  display: block;
  text-align: center;
}
</style>
