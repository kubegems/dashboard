<template>
  <v-flex class="px-2">
    <v-card-title class="py-1">
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
            id="cpu"
            title="CPU使用量"
            :metrics="cpu"
            type="cpu"
            label="pod"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            title="内存使用量"
            :metrics="memory"
            type="memory"
            label="pod"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkin"
            title="网络入口流量"
            :metrics="networkin"
            type="network"
            label="pod"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkout"
            title="网络出口流量"
            :metrics="networkout"
            type="network"
            label="pod"
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
  WORKLOAD_CPU_USAGE_CORE_PROMQL,
  WORKLOAD_MEMORY_USAGE_BYTE_PROMQL,
  WORKLOAD_NETWORK_IN_PROMQL,
  WORKLOAD_NETWORK_OUT_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'WorkloadMonitor',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    cpu: [],
    memory: [],
    networkin: [],
    networkout: [],
    date: [],
    params: {
      start: '',
      end: '',
      noprocessing: true,
    },
    timeinterval: null,
  }),
  computed: {
    ...mapState(['Scale']),
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
      this.workloadCPUUsage()
      this.workloadMemoryUsage()
      this.workloadNetworkIn()
      this.workloadNetworkOut()
    },
    async workloadCPUUsage() {
      const query = WORKLOAD_CPU_USAGE_CORE_PROMQL
        .replaceAll('$1', `${this.item.kind}:${this.item.metadata.name}`)
        .replaceAll('$2', this.item.metadata.namespace)
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, { query: query }),
      )
      if (data) this.cpu = data
    },
    async workloadMemoryUsage() {
      const query = WORKLOAD_MEMORY_USAGE_BYTE_PROMQL
        .replaceAll('$1', `${this.item.kind}:${this.item.metadata.name}`)
        .replaceAll('$2', this.item.metadata.namespace)
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, { query: query }),
      )
      if (data) this.memory = data
    },
    async workloadNetworkIn() {
      const query = WORKLOAD_NETWORK_IN_PROMQL
        .replaceAll('$1', `${this.item.kind}:${this.item.metadata.name}`)
        .replaceAll('$2', this.item.metadata.namespace)
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, { query: query }),
      )
      if (data) this.networkin = data
    },
    async workloadNetworkOut() {
      const query = WORKLOAD_NETWORK_OUT_PROMQL
        .replaceAll('$1', `${this.item.kind}:${this.item.metadata.name}`)
        .replaceAll('$2', this.item.metadata.namespace)
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, { query: query }),
      )
      if (data) this.networkout = data
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[1]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>
