<template>
  <v-row>
    <v-col
      cols="4"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="230"
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
        height="230"
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
        height="230"
        :options="storageOptions"
        :series="storageSeries"
      />
    </v-col>

    <v-col
      v-if="nvidia"
      cols="4"
      class="py-0"
    >
      <VueApexCharts
        type="radialBar"
        height="230"
        :options="nvidiaOptions"
        :series="nvidiaSeries"
      />
    </v-col>

    <template v-if="tke">
      <v-col
        cols="4"
        class="py-0"
      >
        <VueApexCharts
          type="radialBar"
          height="230"
          :options="tkeOptions"
          :series="tkeSeries"
        />
      </v-col>
      <v-col
        cols="4"
        class="py-0"
      >
        <VueApexCharts
          type="radialBar"
          height="230"
          :options="tkeMemoryOptions"
          :series="tkeMemorySeries"
        />
      </v-col>
    </template>
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
    nvidia: {
      type: Boolean,
      default: () => false,
    },
    tke: {
      type: Boolean,
      default: () => false,
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
    nvidiaSeries() {
      return this.quota
        ? this.quota.UsedNvidiaGpu === 0
          ? [0]
          : [(this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100]
        : [0]
    },
    nvidiaOptions() {
      return generateRadialBarChartOptions(
        'nvidia gpu',
        ['nvidia gpu'],
        this.quota ? this.quota.NvidiaGpu : 0,
        'gpu',
      )
    },
    tkeSeries() {
      return this.quota
        ? this.quota.UsedTkeGpu === 0
          ? [0]
          : [(this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100]
        : [0]
    },
    tkeOptions() {
      return generateRadialBarChartOptions(
        'tke gpu',
        ['tke gpu'],
        this.quota ? this.quota.TkeGpu : 0,
        '',
      )
    },
    tkeMemorySeries() {
      return this.quota
        ? this.quota.UsedTkeMemory === 0
          ? [0]
          : [(this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100]
        : [0]
    },
    tkeMemoryOptions() {
      return generateRadialBarChartOptions(
        'tke 显存',
        ['tke 显存'],
        this.quota ? this.quota.TkeMemory : 0,
        '',
      )
    },
  },
}
</script>
