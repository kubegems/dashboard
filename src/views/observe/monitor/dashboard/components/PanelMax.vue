<template>
  <BaseFullScreenDialog
    v-model="dialog"
    :title="`监控面板--${graph.name}`"
    icon="fas fa-chart-area"
    @dispose="dispose"
  >
    <template #content>
      <BaseApexAreaChart
        id="max"
        title=""
        :metrics="metrics"
        :extend-height="height"
        label="pod"
        type=""
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getMetricsQueryrange } from '@/api'

export default {
  name: 'PanelMax',
  props: {
    environment: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    dialog: false,
    graph: {},
    metrics: [],
  }),
  computed: {
    ...mapState(['JWT', 'Scale']),
    height() {
      return window.innerHeight - 64 * this.Scale - 100
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(graph) {
      this.graph = graph
      this.getMetrics()
    },
    dispose() {
      this.graph = {}
      this.metrics = []
    },
    async getMetrics() {
      const params = this.graph.promqlGenerator ? this.graph.promqlGenerator : {
        expr: this.graph.expr,
      }
      const data = await getMetricsQueryrange(
        this.environment.clusterName,
        this.environment.namespace,
        Object.assign(params),
      )
      this.metrics = data
    },
  },
}
</script>
