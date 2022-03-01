<template>
  <v-card class="pa-4">
    <div class="d-flex justify-space-between align-center">
      <CmsSelect v-model="params.cms" />
      <BaseDatetimePicker2 v-model="params.date" />
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
    >
      <template #item.status>
        <StatusTag m />
      </template>
      <template #item.events>
        1 <v-icon @click="onShowEvents">mdi-chart-pie</v-icon>
      </template>
    </v-data-table>

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @loaddata="getOverviewList"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />

    <K8sEvents ref="k8sEvents" />
  </v-card>
</template>

<script>
import CmsSelect from './CmsSelect.vue'
import StatusTag from './StatusTag.vue'
import K8sEvents from './K8sEvents'

export default {
  name: 'OverviewList',
  components: {
    CmsSelect,
    StatusTag,
    K8sEvents,
  },
  data () {
    this.headers = [
      { text: '环境', value: 'environment', align: 'start' },
      { text: '标签', value: 'tag', align: 'start' },
      { text: '状态', value: 'status', align: 'start' },
      { text: '容灾重启(次)', value: 'restart', align: 'start' },
      { text: 'CPU', value: 'cpu', align: 'start' },
      { text: 'Mem', value: 'mem', align: 'start' },
      { text: '指标采集器', value: 'metrics', align: 'start' },
      { text: '告警规则', value: 'rules', align: 'start' },
      { text: '实时告警', value: 'alerting', align: 'start' },
      { text: '日志采集器', value: 'logFlow', align: 'start' },
      { text: '错误日志', value: 'log', align: 'start' },
      { text: '日志速率', value: 'rate', align: 'start' },
      { text: '事件', value: 'events', align: 'start' },
    ]

    return {
      params: {
        size: 10,
        page: 1,
        cms: undefined,
        date: [],
      },
      items: [{}],
      pageCount: 0,
    }
  },
  methods: {
    getOverviewList () {

    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onShowEvents () {
      console.log(1)
      this.$refs.k8sEvents.show()
    },
  },
}
</script>
