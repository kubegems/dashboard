<template>
  <v-flex>
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
            label="container"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            title="内存使用量"
            :metrics="memory"
            type="memory"
            label="container"
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
  CONTAINER_CPU_USAGE_PROMQL,
  CONTAINER_MEMORY_USAGE_PROMQL,
  POD_NETWORK_IN_PROMQL,
  POD_NETWORK_OUT_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'PodMonitor',
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
      this.podCPUUsage()
      this.podMemoryUsage()
      this.podNetworkIn()
      this.podNetworkOut()
    },
    async podCPUUsage() {
      const containers = []
      if (this.item) {
        this.item.spec.containers.forEach((container) => {
          containers.push(container.name)
        })
        const query = CONTAINER_CPU_USAGE_PROMQL
          .replaceAll('$1', containers.join('|'))
          .replaceAll('$2', this.item.metadata.name)
          .replaceAll('$3', this.item.metadata.namespace)
        const data = await matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query }),
        )
        if (data) this.cpu = data
      }
    },
    async podMemoryUsage() {
      const containers = []
      if (this.item) {
        this.item.spec.containers.forEach((container) => {
          containers.push(container.name)
        })
        const query = CONTAINER_MEMORY_USAGE_PROMQL
          .replaceAll('$1', containers.join('|'))
          .replaceAll('$2', this.item.metadata.name)
          .replaceAll('$3', this.item.metadata.namespace)
        const data = await matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query }),
        )
        if (data) this.memory = data
      }
    },
    async podNetworkIn() {
      if (this.item) {
        const query = POD_NETWORK_IN_PROMQL
          .replaceAll('$1', this.item.metadata.name)
          .replaceAll('$2', this.item.metadata.namespace)
        const data = await matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query }),
        )
        if (data) this.networkin = data
      }
    },
    async podNetworkOut() {
      if (this.item) {
        const query = POD_NETWORK_OUT_PROMQL
          .replaceAll('$1', this.item.metadata.name)
          .replaceAll('$2', this.item.metadata.namespace)
        const data = await matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query }),
        )
        if (data) this.networkout = data
      }
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[0]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>
