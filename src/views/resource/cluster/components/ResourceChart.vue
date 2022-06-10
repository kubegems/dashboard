<template>
  <v-row class="mt-1">
    <v-col cols="3">
      <v-card>
        <v-card-text>
          <v-sheet>
            <VueApexCharts type="radialBar" height="250" :options="cpuOptions" :series="cpuSeries" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #00bcd4" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                租户总量
                {{ quota ? sizeOfCpu(quota.tenantAllocated['limits.cpu']).toFixed(1) : 0 }}
                core
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #1e88e5" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                物理总量
                {{ quota ? sizeOfCpu(quota.capacity.cpu).toFixed(1) : 0 }}
                core
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #fb8c00" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                vCPU
                {{ quota ? maxCpu.toFixed(1) : 0 }}
                core
              </span>
            </v-sheet>
          </v-sheet>
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="3">
      <v-card>
        <v-card-text>
          <v-sheet>
            <VueApexCharts type="radialBar" height="250" :options="memoryOptions" :series="memorySeries" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #00bcd4" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                租户总量
                {{ quota ? sizeOfStorage(quota.tenantAllocated['limits.memory']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #1e88e5" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                物理总量
                {{ quota ? sizeOfStorage(quota.capacity.memory).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #fb8c00" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                v内存
                {{ quota ? maxMemory.toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
          </v-sheet>
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="3">
      <v-card>
        <v-card-text>
          <v-sheet>
            <VueApexCharts type="radialBar" height="250" :options="storageOptions" :series="storageSeries" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #00bcd4" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                租户总量
                {{ quota ? sizeOfStorage(quota.tenantAllocated['requests.storage']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #1e88e5" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                物理总量
                {{ quota ? sizeOfStorage(quota.capacity['ephemeral-storage']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #607d8b" class="mr-2" size="0">
                <span class="white--text text-h5" />
              </v-avatar>
              <span />
            </v-sheet>
          </v-sheet>
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="3">
      <v-card>
        <v-card-text>
          <v-sheet>
            <VueApexCharts type="radialBar" height="250" :options="podOptions" :series="podSeries" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #00bcd4" class="mr-2" size="10">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                总和
                {{ quota ? quota.capacity.pods : 0 }}
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #00bcd4" class="mr-2" size="0">
                <span class="white--text text-h5" />
              </v-avatar>
              <span />
            </v-sheet>
            <v-sheet>
              <v-avatar style="background-color: #607d8b" class="mr-2" size="0">
                <span class="white--text text-h5" />
              </v-avatar>
              <span />
            </v-sheet>
          </v-sheet>
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import VueApexCharts from 'vue-apexcharts';
  import { generateRadialBarChartOptions } from '@/utils/chart';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ResourceChart',
    components: {
      VueApexCharts,
    },
    props: {
      cluster: {
        type: Object,
        default: () => null,
      },
      quota: {
        type: Object,
        default: () => null,
      },
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Cluster']),
      maxCpu() {
        return this.cluster
          ? sizeOfCpu(this.quota.capacity.cpu) * this.cluster.OversoldConfig.cpu
          : sizeOfCpu(this.quota.capacity.cpu);
      },
      maxMemory() {
        return this.cluster
          ? sizeOfStorage(this.quota.capacity.memory) * this.cluster.OversoldConfig.memory
          : sizeOfStorage(this.quota.capacity.memory);
      },
      maxStorage() {
        return sizeOfStorage(this.quota.capacity['ephemeral-storage']) >
          sizeOfStorage(this.quota.tenantAllocated['requests.storage'])
          ? sizeOfStorage(this.quota.capacity['ephemeral-storage'])
          : sizeOfStorage(this.quota.tenantAllocated['requests.storage']);
      },
      cpuSeries() {
        return this.quota
          ? [
              (sizeOfCpu(this.quota.tenantAllocated['limits.cpu']) / this.maxCpu) * 100,
              (sizeOfCpu(this.quota.capacity.cpu) / this.maxCpu) * 100,
              100,
            ]
          : [0, 0, 0];
      },
      cpuOptions() {
        return generateRadialBarChartOptions(
          'CPU',
          ['租户总量', '物理总量', 'vCPU'],
          this.quota ? this.maxCpu : 0,
          'core',
          true,
        );
      },
      memorySeries() {
        return this.quota
          ? [
              (sizeOfStorage(this.quota.tenantAllocated['limits.memory']) / this.maxMemory) * 100,
              (sizeOfStorage(this.quota.capacity.memory) / this.maxMemory) * 100,
              100,
            ]
          : [0, 0, 0];
      },
      memoryOptions() {
        return generateRadialBarChartOptions(
          '内存',
          ['租户总量', '物理总量', 'v内存'],
          this.quota ? this.maxMemory : 0,
          'Gi',
          true,
        );
      },
      storageSeries() {
        return this.quota
          ? [
              (sizeOfStorage(this.quota.tenantAllocated['requests.storage']) / this.maxStorage) * 100,
              (sizeOfStorage(this.quota.capacity['ephemeral-storage']) / this.maxStorage) * 100,
            ]
          : [0, 0];
      },
      storageOptions() {
        return generateRadialBarChartOptions(
          '存储',
          ['租户总量', '物理总量'],
          this.quota ? this.maxStorage : 0,
          'Gi',
          true,
        );
      },
      podSeries() {
        return this.quota
          ? this.quota.capacity.pods === 0
            ? [0]
            : [(this.quota.capacity.pods / this.quota.capacity.pods) * 100]
          : [0];
      },
      podOptions() {
        return generateRadialBarChartOptions('容器组', ['总和'], this.quota ? this.quota.capacity.pods : 0, '', true);
      },
    },
    methods: {
      sizeOfCpu: sizeOfCpu,
      sizeOfStorage: sizeOfStorage,
    },
  };
</script>
