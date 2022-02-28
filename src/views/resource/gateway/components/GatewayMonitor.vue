<template>
  <v-flex>
    <v-card-title class="py-2">
      <v-flex>
        <v-flex class="float-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker2
              v-model="date"
              :default-value="30"
              @change="onDatetimeChange(undefined)"
            />
          </v-sheet>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="qps"
            title="QPS"
            :metrics="qps"
            label="pod"
            type=""
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="connection"
            title="连接数"
            :metrics="connections"
            label="pod"
            type=""
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { matrix } from '@/api'
import BaseResource from '@/mixins/resource'
import {
  GATEWAY_QPS_PROMQL,
  GATEWAY_CONNECTIONS_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'GatewayMonitor',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    selector: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    qps: [],
    connections: [],
    date: [],
    params: {
      start: '',
      end: '',
    },
    timeinterval: null,
  }),
  computed: {
    ...mapState(['Scale']),
  },
  watch: {
    item() {
      this.loadMetrics()
    },
  },
  destroyed() {
    if (this.timeinterval) clearInterval(this.timeinterval)
  },
  mounted() {
    this.$nextTick(() => {
      this.onDatetimeChange()
    })
  },
  methods: {
    async loadMetrics() {
      if (this.timeinterval) clearInterval(this.timeinterval)
      this.loadData()
      this.timeinterval = setInterval(() => {
        this.params.start = this.$moment(this.params.start)
          .utc()
          .add(30, 'seconds')
          .format()
        this.params.end = this.$moment(this.params.end)
          .utc()
          .add(30, 'seconds')
          .format()
        this.loadData()
      }, 1000 * 30)
    },
    async loadData() {
      this.gatewayQPS()
      this.gatewayConnections()
    },
    async gatewayQPS() {
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: GATEWAY_QPS_PROMQL.replaceAll(
            '$1',
            this.selector.ingressClassName,
          ),
          noprocessing: true,
        }),
      )
      if (data) this.qps = data
    },
    async gatewayConnections() {
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: GATEWAY_CONNECTIONS_PROMQL.replaceAll(
            '$1',
            this.selector.ingressClassName,
          ),
          noprocessing: true,
        }),
      )
      if (data) this.connections = data
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[1]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>
