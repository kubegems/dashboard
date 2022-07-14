<template>
  <div>
    <v-row>
      <v-col class="py-0" cols="3">
        <VueApexCharts height="250" :options="cpuOptions" :series="cpuSeries" type="radialBar" />
      </v-col>
      <v-col class="py-0" cols="3">
        <VueApexCharts height="250" :options="memoryOptions" :series="memorySeries" type="radialBar" />
      </v-col>
      <v-col class="py-0" cols="3">
        <VueApexCharts height="250" :options="storageOptions" :series="storageSeries" type="radialBar" />
      </v-col>
      <v-col class="py-0" cols="3">
        <VueApexCharts height="250" :options="podOptions" :series="podSeries" type="radialBar" />
      </v-col>

      <v-col v-if="nvidia && showMore" class="py-0" cols="3">
        <VueApexCharts height="250" :options="nvidiaGpuOptions" :series="nvidiaGpuSeries" type="radialBar" />
      </v-col>

      <template v-if="tke && showMore">
        <v-col class="py-0" cols="3">
          <VueApexCharts height="250" :options="tkeGpuOptions" :series="tkeGpuSeries" type="radialBar" />
        </v-col>
        <v-col class="py-0" cols="3">
          <VueApexCharts height="250" :options="tkeMemoryOptions" :series="tkeMemorySeries" type="radialBar" />
        </v-col>
      </template>
    </v-row>

    <div v-if="tke || nvidia" class="mb-2 text-center">
      <v-btn color="primary" small text @click="showMore = !showMore">
        {{ showMore ? '折叠GPU' : '显示GPU' }}
      </v-btn>
    </div>
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';

  import { generateRadialBarChartOptions } from '@/utils/chart';

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
    data() {
      return {
        showMore: false,
      };
    },
    computed: {
      nvidia() {
        if (this.statistics) {
          return Object.prototype.hasOwnProperty.call(this.statistics, 'NvidiaGpu');
        }
        return false;
      },
      tke() {
        if (this.statistics) {
          return (
            Object.prototype.hasOwnProperty.call(this.statistics, 'TkeGpu') ||
            Object.prototype.hasOwnProperty.call(this.statistics, 'TkeMemory')
          );
        }
        return false;
      },
      cpuSeries() {
        return this.statistics
          ? this.statistics.AllocatedCpu === 0
            ? [0]
            : [(this.statistics.AllocatedCpu / this.statistics.Cpu) * 100]
          : [0];
      },
      cpuOptions() {
        return generateRadialBarChartOptions('CPU', ['CPU'], this.statistics ? this.statistics.Cpu : 0, 'core');
      },
      memorySeries() {
        return this.statistics
          ? this.statistics.AllocatedMemory === 0
            ? [0]
            : [(this.statistics.AllocatedMemory / this.statistics.Memory) * 100]
          : [0];
      },
      memoryOptions() {
        return generateRadialBarChartOptions('内存', ['内存'], this.statistics ? this.statistics.Memory : 0, 'Gi');
      },
      storageSeries() {
        return this.statistics
          ? this.statistics.AllocatedStorage === 0
            ? [0]
            : [(this.statistics.AllocatedStorage / this.statistics.Storage) * 100]
          : [0];
      },
      storageOptions() {
        return generateRadialBarChartOptions('存储', ['存储'], this.statistics ? this.statistics.Storage : 0, 'Gi');
      },
      podSeries() {
        return this.statistics
          ? this.statistics.AllocatedPod === 0
            ? [0]
            : [(this.statistics.AllocatedPod / this.statistics.Pod) * 100]
          : [0];
      },
      podOptions() {
        return generateRadialBarChartOptions('容器组', ['容器组'], this.statistics ? this.statistics.Pod : 0, '');
      },

      nvidiaGpuSeries() {
        return this.statistics
          ? this.statistics.AllocatedNvidiaGpu === 0
            ? [0]
            : [(this.statistics.AllocatedNvidiaGpu / this.statistics.NvidiaGpu) * 100]
          : [0];
      },
      nvidiaGpuOptions() {
        return generateRadialBarChartOptions(
          'Nvidia CPU',
          ['Nvidia CPU'],
          this.statistics ? this.statistics.NvidiaGpu : 0,
          'gpu',
        );
      },

      tkeGpuSeries() {
        return this.statistics
          ? this.statistics.AllocatedTkeGpu === 0
            ? [0]
            : [(this.statistics.AllocatedTkeGpu / this.statistics.TkeGpu) * 100]
          : [0];
      },
      tkeGpuOptions() {
        return generateRadialBarChartOptions('Tke CPU', ['Tke CPU'], this.statistics ? this.statistics.TkeGpu : 0, '');
      },

      tkeMemorySeries() {
        return this.statistics
          ? this.statistics.AllocatedTkeMemory === 0
            ? [0]
            : [(this.statistics.AllocatedTkeMemory / this.statistics.TkeMemory) * 100]
          : [0];
      },
      tkeMemoryOptions() {
        return generateRadialBarChartOptions(
          'Tke显存',
          ['Tke显存'],
          this.statistics ? this.statistics.TkeMemory : 0,
          '',
        );
      },
    },
  };
</script>
