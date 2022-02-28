<template>
  <v-row>
    <v-col
      cols="3"
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
      cols="3"
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
      cols="3"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="250"
        :options="storageOptions"
        :series="storageSeries"
      />
    </v-col>
    <v-col
      cols="3"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="250"
        :options="podOptions"
        :series="podSeries"
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
    statistics: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    cpuSeries() {
      return this.statistics
        ? this.statistics.AllocatedCpu === 0
          ? [0]
          : [(this.statistics.AllocatedCpu / this.statistics.Cpu) * 100]
        : [0]
    },
    cpuOptions() {
      return generateRadialBarChartOptions(
        'CPU',
        ['CPU'],
        this.statistics ? this.statistics.Cpu : 0,
        'core',
      )
    },
    memorySeries() {
      return this.statistics
        ? this.statistics.AllocatedMemory === 0
          ? [0]
          : [(this.statistics.AllocatedMemory / this.statistics.Memory) * 100]
        : [0]
    },
    memoryOptions() {
      return generateRadialBarChartOptions(
        '内存',
        ['内存'],
        this.statistics ? this.statistics.Memory : 0,
        'Gi',
      )
    },
    storageSeries() {
      return this.statistics
        ? this.statistics.AllocatedStorage === 0
          ? [0]
          : [(this.statistics.AllocatedStorage / this.statistics.Storage) * 100]
        : [0]
    },
    storageOptions() {
      return generateRadialBarChartOptions(
        '存储',
        ['存储'],
        this.statistics ? this.statistics.Storage : 0,
        'Gi',
      )
    },
    podSeries() {
      return this.statistics
        ? this.statistics.AllocatedPod === 0
          ? [0]
          : [(this.statistics.AllocatedPod / this.statistics.Pod) * 100]
        : [0]
    },
    podOptions() {
      return generateRadialBarChartOptions(
        '容器组',
        ['容器组'],
        this.statistics ? this.statistics.Pod : 0,
        '',
      )
    },
  },
}
</script>
