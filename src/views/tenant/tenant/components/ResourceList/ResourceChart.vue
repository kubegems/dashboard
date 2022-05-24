<template>
  <v-row>
    <v-col
      cols="4"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="250"
        :options="cpuOptions"
        :series="cpuSeries"
      />
    </v-col>
    <v-col
      cols="4"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="250"
        :options="memoryOptions"
        :series="memorySeries"
      />
    </v-col>
    <v-col
      cols="4"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="250"
        :options="storageOptions"
        :series="storageSeries"
      />
    </v-col>
  </v-row>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import { generateRadialBarChartOptions } from '@/utils/chart'

export default {
  name: 'ResourceChart',
  components: {
    VueApexCharts,
  },
  props: {
    quota: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    cpuSeries() {
      return this.quota
        ? this.quota.UsedCpu === 0
          ? [0]
          : [(this.quota.UsedCpu / this.quota.Cpu) * 100]
        : [0]
    },
    cpuOptions() {
      return generateRadialBarChartOptions(
        'CPU',
        ['CPU'],
        this.quota ? this.quota.Cpu : 0,
        'core',
      )
    },
    memorySeries() {
      return this.quota
        ? this.quota.UsedMemory === 0
          ? [0]
          : [(this.quota.UsedMemory / this.quota.Memory) * 100]
        : [0]
    },
    memoryOptions() {
      return generateRadialBarChartOptions(
        '内存',
        ['内存'],
        this.quota ? this.quota.Memory : 0,
        'Gi',
      )
    },
    storageSeries() {
      return this.quota
        ? this.quota.UsedStorage === 0
          ? [0]
          : [(this.quota.UsedStorage / this.quota.Storage) * 100]
        : [0]
    },
    storageOptions() {
      return generateRadialBarChartOptions(
        '存储',
        ['存储'],
        this.quota ? this.quota.Storage : 0,
        'Gi',
      )
    },
  },
}
</script>
