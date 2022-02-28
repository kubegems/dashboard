<template>
  <v-flex class="px-2">
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
            id="load"
            title="负载"
            :metrics="load"
            label="name"
            type=""
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="cpu"
            title="CPU使用率"
            :metrics="cpu"
            label="host"
            type="%"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            title="内存使用率"
            :metrics="memory"
            label="host"
            type="%"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="network"
            title="网络带宽"
            :metrics="network"
            label="name"
            type="network"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="disk"
            title="磁盘剩余容量"
            :metrics="disk"
            label="host"
            type="storage"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="diskiops"
            title="磁盘IOPS"
            :metrics="diskiops"
            label="name"
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
  NODE_LOAD1_PROMQL,
  NODE_LOAD5_PROMQL,
  NODE_LOAD15_PROMQL,
  NODE_CPU_USAGE_PROMQL,
  NODE_MEMORY_USAGE_PROMQL,
  NODE_NETWORK_IN_PROMQL,
  NODE_NETWORK_OUT_PROMQL,
  NODE_DISK_AVAILABLE_SIZE_PROMQL,
  NODE_DISK_WRITE_IOPS_PROMQL,
  NODE_DISK_READ_IOPS_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'NodeMonitor',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    load: [],
    cpu: [],
    memory: [],
    network: [],
    disk: [],
    diskiops: [],
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
      this.nodeLoadRange()
      this.nodeCPUUsage()
      this.nodeMemoryUsage()
      this.nodeNetworkUsage()
      this.nodeDiskSize()
      this.nodeDiskIOPS()
    },
    async nodeLoadRange() {
      const data1 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_LOAD1_PROMQL.replaceAll('$1', this.item.metadata.name),
        }),
      )
      if (data1) data1[0].metric['name'] = '1分钟负载'
      const data2 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_LOAD5_PROMQL.replaceAll('$1', this.item.metadata.name),
        }),
      )
      if (data2) data2[0].metric['name'] = '5分钟负载'
      const data3 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_LOAD15_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data3) data3[0].metric['name'] = '15分钟负载'
      let data = []
      if (data1) data = data.concat(data1)
      if (data2) data = data.concat(data2)
      if (data3) data = data.concat(data3)
      this.load = data
    },
    async nodeCPUUsage() {
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_CPU_USAGE_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data) this.cpu = data
    },
    async nodeMemoryUsage() {
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_MEMORY_USAGE_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data) this.memory = data
    },
    async nodeNetworkUsage() {
      const data1 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_NETWORK_IN_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data1) data1[0].metric['name'] = '入口流量'
      const data2 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_NETWORK_OUT_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data2) data2[0].metric['name'] = '出口流量'
      let data = []
      if (data1) data = data.concat(data1)
      if (data2) data = data.concat(data2)
      this.network = data
    },
    async nodeDiskSize() {
      const data = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_DISK_AVAILABLE_SIZE_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data) this.disk = data
    },
    async nodeDiskIOPS() {
      const data1 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_DISK_WRITE_IOPS_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data1) data1[0].metric['name'] = '写入IOPS'
      const data2 = await matrix(
        this.ThisCluster,
        Object.assign(this.params, {
          query: NODE_DISK_READ_IOPS_PROMQL.replaceAll(
            '$1',
            this.item.metadata.name,
          ),
        }),
      )
      if (data2) data2[0].metric['name'] = '读取IOPS'
      let data = []
      if (data1) data = data.concat(data1)
      if (data2) data = data.concat(data2)
      this.diskiops = data
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[1]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>
