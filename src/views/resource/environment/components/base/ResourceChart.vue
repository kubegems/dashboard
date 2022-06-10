<template>
  <div>
    <v-row>
      <v-col cols="3" class="py-0">
        <VueApexCharts type="radialBar" height="250" :options="cpuOptions" :series="cpuSeries" />
      </v-col>
      <v-col cols="3" class="py-0">
        <VueApexCharts type="radialBar" height="250" :options="memoryOptions" :series="memorySeries" />
      </v-col>
      <v-col cols="3" class="py-0">
        <VueApexCharts type="radialBar" height="250" :options="storageOptions" :series="storageSeries" />
      </v-col>
      <v-col cols="3" class="py-0">
        <VueApexCharts type="radialBar" height="250" :options="podOptions" :series="podSeries" />
      </v-col>

      <v-col v-if="nvidia && showMore" cols="3" class="py-0">
        <VueApexCharts type="radialBar" height="250" :options="nvidiaGpuOptions" :series="nvidiaGpuSeries" />
      </v-col>

      <template v-if="tke && showMore">
        <v-col cols="3" class="py-0">
          <VueApexCharts type="radialBar" height="250" :options="tkeGpuOptions" :series="tkeGpuSeries" />
        </v-col>
        <v-col cols="3" class="py-0">
          <VueApexCharts type="radialBar" height="250" :options="tkeMemoryOptions" :series="tkeMemorySeries" />
        </v-col>
      </template>
    </v-row>

    <div v-if="tke || nvidia" class="mb-2 text-center">
      <v-btn text small color="primary" @click="showMore = !showMore">
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
