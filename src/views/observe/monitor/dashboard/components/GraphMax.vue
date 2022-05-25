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
        :unit="graph.promqlGenerator?graph.promqlGenerator.unit:null"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        :no-data-offset-y="-24"
      />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getMetricsQueryrange } from '@/api'

export default {
  name: 'GraphMax',
  props: {
    environment: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    dialog: false,
    graph: {},
    namespace: '',
    metrics: [],
    timeinterval: null,
  }),
  computed: {
    ...mapState(['JWT', 'Scale']),
    height() {
      return window.innerHeight - 64 * this.Scale - 100
    },
  },
  destroyed() {
    this.clearInterval()
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(graph, namespace) {
      this.graph = graph
      this.namespace = namespace
      this.loadMetrics()
    },
    async loadMetrics() {
      this.clearInterval()
      this.getMetrics()
      this.timeinterval = setInterval(() => {
        this.getMetrics()
      }, 1000 * 30)
    },
    dispose() {
      this.graph = {}
      this.metrics = []
      this.clearInterval()
    },
    clearInterval() {
      if (this.timeinterval) clearInterval(this.timeinterval)
    },
    async getMetrics() {
      const params = this.graph.promqlGenerator ? this.graph.promqlGenerator : {
        expr: this.graph.expr,
      }
      const data = await getMetricsQueryrange(
        this.environment.clusterName,
        this.namespace,
        params,
      )
      this.metrics = data
    },
  },
}
</script>
