<template>
  <v-card class="pa-4">
    <div class="d-flex justify-space-between align-center">
      <ProjectSelect
        v-model="project"
        :tenant="tenant"
      />
      <Duration
        v-model="params.duration"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="items"
      item-key="value"
      disable-sort
      hide-default-footer
      no-data-text="暂无数据"
      no-results-text="暂无匹配租户"
      class="px-2 mt-4"
      :page.sync="params.page"
      :items-per-page="params.size"
    >
      <template #[`item.labels`]="{ item }">
        <BaseCollapseChips
          :chips="item.labels || {}"
          single-line
          icon="mdi-label"
        />
      </template>
      <template #[`item.alertLiving`]="{ item }">
        {{ item.errorAlertCount + item.criticalAlertCount }}
        <BaseTipChips
          v-if="item.criticalAlertCount || item.errorAlertCount"
          :chips="{ error:item.errorAlertCount, critical:item.criticalAlertCount }"
          single-line
          :icon="item.criticalAlertCount > 0 ? 'mdi-fire-alert' : 'mdi-alert-circle'"
          :color="item.criticalAlertCount > 0 ? 'error' : 'warning'"
        />
      </template>
      <template #[`item.alertRuleCount`]="{ item }">
        {{ item.alertRuleCount }}
        <BaseTipChips
          :chips="item.alertResourceMap || {}"
          single-line
          icon="mdi-information"
        />
      </template>
      <template #[`item.status`]="{ item }">
        <StatusTag
          :m="item.monitoring"
          :l="item.logging"
          :s="item.serviceMesh"
        />
      </template>
      <template #[`item.eventCount`]="{ item }">
        {{ item.eventCount }}
        <v-icon
          color="primary"
          @click="onShowEvents(item)"
        >
          mdi-chart-pie
        </v-icon>
      </template>
    </v-data-table>

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :front-page="true"
      :page-count="pageCount"
      :size="params.size"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />

    <K8sEvents
      ref="k8sEvents"
      :env="env"
    />
  </v-card>
</template>

<script>
import { getEnvironmentObservability } from '@/api'
import ProjectSelect from './ProjectSelect'
import StatusTag from './StatusTag'
import K8sEvents from './K8sEvents'
import Duration from './Duration'
import BaseSelect from '@/mixins/select'

export default {
  name: 'OverviewList',
  components: {
    ProjectSelect,
    StatusTag,
    K8sEvents,
    Duration,
  },
  mixins: [BaseSelect],
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
  data () {
    this.headers = [
      { text: '环境', value: 'environmentName', align: 'start' },
      { text: '标签', value: 'labels', align: 'start' },
      { text: '状态', value: 'status', align: 'start', width: 250 },
      { text: '容器重启(次)', value: 'containerRestartTotal', align: 'start' },
      { text: 'CPU', value: 'cpu', align: 'start' },
      { text: 'Mem', value: 'memory', align: 'start' },
      { text: '指标采集器', value: 'monitorCollectorCount', align: 'start' },
      { text: '告警规则', value: 'alertRuleCount', align: 'start', width: 80 },
      { text: '实时告警', value: 'alertLiving', align: 'start' },
      { text: '日志采集器', value: 'loggingCollectorCount', align: 'start' },
      { text: '错误日志', value: 'errorLogCount', align: 'start' },
      { text: '日志速率', value: 'logRate', align: 'start' },
      { text: '事件', value: 'eventCount', align: 'start' },
    ]

    return {
      params: {
        duration: '1h',
        page: 1,
        size: 10,
      },
      project: undefined,
      items: [],
      pageCount: 0,
      env: null,
    }
  },
  watch: {
    project: {
      async handler() {
        if (this.project) {
          this.items = []
          await this.m_select_projectEnvironmentSelectData(this.project)
          this.m_select_projectEnvironmentItems.forEach(env => {
            this.environmentObservability(env.value)
          })
        }
      },
      deep: true,
    },
    'params.duration': {
      handler() {
        this.items = []
        this.m_select_projectEnvironmentItems.forEach(env => {
          this.environmentObservability(env.value)
        })
      },
    },
  },
  methods: {
    async environmentObservability (envId) {
      const data = await getEnvironmentObservability(envId, { duration: this.params.duration })
      this.items.push(data)
      this.pageCount = parseInt(this.items.length / this.params.size + 1)
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onShowEvents (item) {
      this.env = item
      this.$refs.k8sEvents.open()
    },
  },
}
</script>
