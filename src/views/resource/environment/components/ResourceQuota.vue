<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-card>
    <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.resource_allocated')" />
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col class="py-0" cols="3">
          <VueApexCharts height="230" :options="cpuOptions" :series="cpuSeries" type="radialBar" />
        </v-col>
        <v-col class="py-0" cols="3">
          <VueApexCharts height="230" :options="memoryOptions" :series="memorySeries" type="radialBar" />
        </v-col>
        <v-col class="py-0" cols="3">
          <VueApexCharts height="230" :options="storageOptions" :series="storageSeries" type="radialBar" />
        </v-col>
        <v-col class="py-0" cols="3">
          <VueApexCharts height="230" :options="podOptions" :series="podSeries" type="radialBar" />
        </v-col>

        <v-col v-if="nvidia && showMore" class="py-0" cols="3">
          <VueApexCharts height="230" :options="nvidiaGpuOptions" :series="nvidiaGpuSeries" type="radialBar" />
        </v-col>
        <template v-if="tke && showMore">
          <v-col class="py-0" cols="3">
            <VueApexCharts height="230" :options="tkeGpuOptions" :series="tkeGpuSeries" type="radialBar" />
          </v-col>
          <v-col class="py-0" cols="3">
            <VueApexCharts height="230" :options="tkeMemoryOptions" :series="tkeMemorySeries" type="radialBar" />
          </v-col>
        </template>
      </v-row>

      <div v-if="tke || nvidia" class="text-center">
        <v-btn color="primary" small text @click="showMore = !showMore">
          {{ showMore ? `${$t('tip.hide')} GPU` : `${$t('tip.hide')} GPU` }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getEnvironmentQuota } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { generateRadialBarChartOptions } from '@/utils/chart';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ResourceQuota',
    i18n: {
      messages: messages,
    },
    components: {
      VueApexCharts,
    },
    mixins: [BaseResource],
    data() {
      return {
        quota: null,
        nvidia: false,
        tke: false,
        showMore: false,
      };
    },
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Environment', 'Project']),
      cpuSeries() {
        return this.quota ? [this.quota.Cpu === 0 ? 0 : (this.quota.UsedCpu / this.quota.Cpu) * 100] : [0];
      },
      cpuOptions() {
        return generateRadialBarChartOptions(
          this.$root.$t('resource.cpu'),
          [this.$root.$t('resource.cpu')],
          this.quota ? this.quota.Cpu : 0,
          'core',
        );
      },
      memorySeries() {
        return this.quota ? [this.quota.Memory === 0 ? 0 : (this.quota.UsedMemory / this.quota.Memory) * 100] : [0];
      },
      memoryOptions() {
        return generateRadialBarChartOptions(
          this.$root.$t('resource.memory'),
          [this.$root.$t('resource.memory')],
          this.quota ? this.quota.Memory : 0,
          'Gi',
        );
      },
      storageSeries() {
        return this.quota ? [this.quota.Storage === 0 ? 0 : (this.quota.UsedStorage / this.quota.Storage) * 100] : [0];
      },
      storageOptions() {
        return generateRadialBarChartOptions(
          this.$root.$t('resource.storage'),
          [this.$root.$t('resource.storage')],
          this.quota ? this.quota.Storage : 0,
          'Gi',
        );
      },
      podSeries() {
        return this.quota ? [this.quota.Pod === 0 ? 0 : (this.quota.UsedPod / this.quota.Pod) * 100] : [0];
      },
      podOptions() {
        return generateRadialBarChartOptions(
          this.$root.$t('resource.pod'),
          [this.$root.$t('resource.pod')],
          this.quota ? this.quota.Pod : 0,
          '',
        );
      },

      nvidiaGpuSeries() {
        return this.quota
          ? [this.quota.NvidiaGpu === 0 ? 0 : (this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100]
          : [0];
      },
      nvidiaGpuOptions() {
        return generateRadialBarChartOptions(
          `Nvidia ${this.$root.$t('resource.gpu')}`,
          [`Nvidia ${this.$root.$t('resource.gpu')}`],
          this.quota ? this.quota.NvidiaGpu : 0,
          'gpu',
        );
      },

      tkeGpuSeries() {
        return this.quota ? [this.quota.TkeGpu === 0 ? 0 : (this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100] : [0];
      },
      tkeGpuOptions() {
        return generateRadialBarChartOptions(
          `Tke ${this.$root.$t('resource.gpu')}`,
          [`Tke ${this.$root.$t('resource.gpu')}`],
          this.quota ? this.quota.TkeGpu : 0,
          '',
        );
      },

      tkeMemorySeries() {
        return this.quota
          ? [this.quota.TkeMemory === 0 ? 0 : (this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100]
          : [0];
      },
      tkeMemoryOptions() {
        return generateRadialBarChartOptions(
          `Tke ${this.$root.$t('resource.video_memory')}`,
          [`Tke ${this.$root.$t('resource.video_memory')}`],
          this.quota ? this.quota.TkeMemory : 0,
          '',
        );
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.environmentQuota();
      });
    },
    methods: {
      async environmentQuota() {
        const data = await getEnvironmentQuota(this.Project().ID, this.Environment().ID, {
          noprocessing: true,
        });
        if (data.quota.status.hard) {
          this.quota = {
            Cpu: data.quota.status.hard['limits.cpu'] ? parseFloat(sizeOfCpu(data.quota.status.hard['limits.cpu'])) : 0,
            Memory: data.quota.status.hard['limits.memory']
              ? parseFloat(sizeOfStorage(data.quota.status.hard['limits.memory']))
              : 0,
            Storage: data.quota.status.hard['requests.storage']
              ? parseFloat(sizeOfStorage(data.quota.status.hard['requests.storage']))
              : 0,
            Pod: data.quota.status.hard['count/pods'] ? parseInt(data.quota.status.hard['count/pods']) : 5120,
            UsedCpu: data.quota.status.used['limits.cpu']
              ? parseFloat(sizeOfCpu(data.quota.status.used['limits.cpu']))
              : 0,
            UsedMemory: data.quota.status.used['limits.memory']
              ? parseFloat(sizeOfStorage(data.quota.status.used['limits.memory']))
              : 0,
            UsedStorage: data.quota.status.used['requests.storage']
              ? parseFloat(sizeOfStorage(data.quota.status.used['requests.storage']))
              : 0,
            UsedPod: data.quota.status.used.pods ? parseFloat(data.quota.status.used.pods) : 0,

            NvidiaGpu: data.quota.status.hard['limits.nvidia.com/gpu']
              ? parseFloat(data.quota.status.hard['limits.nvidia.com/gpu'])
              : 0,
            UsedNvidiaGpu: data.quota.status.used['limits.nvidia.com/gpu']
              ? parseFloat(data.quota.status.used['limits.nvidia.com/gpu'])
              : 0,

            TkeGpu: data.quota.status.hard['tencent.com/vcuda-core']
              ? parseFloat(data.quota.status.hard['tencent.com/vcuda-core'])
              : 0,
            UsedTkeGpu: data.quota.status.used['tencent.com/vcuda-core']
              ? parseFloat(data.quota.status.used['tencent.com/vcuda-core'])
              : 0,

            TkeMemory: data.quota.status.hard['tencent.com/vcuda-memory']
              ? parseFloat(data.quota.status.hard['tencent.com/vcuda-memory'])
              : 0,
            UsedTkeMemory: data.quota.status.used['tencent.com/vcuda-memory']
              ? parseFloat(data.quota.status.used['tencent.com/vcuda-memory'])
              : 0,
          };
          this.nvidia =
            Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'limits.nvidia.com/gpu') &&
            parseInt(data.quota.status.hard['limits.nvidia.com/gpu']) > 0;
          this.tke =
            (Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'tencent.com/vcuda-core') &&
              parseInt(data.quota.status.hard['tencent.com/vcuda-core']) > 0) ||
            (Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'tencent.com/vcuda-memory') &&
              parseInt(data.quota.status.hard['tencent.com/vcuda-memory']) > 0);
        } else {
          this.quota = {
            Cpu: 0,
            Memory: 0,
            Storage: 0,
            Pod: 0,
            UsedCpu: 0,
            UsedMemory: 0,
            UsedStorage: 0,
            UsedPod: 0,
            NvidiaGpu: 0,
            UsedNvidiaGpu: 0,
            TkeGpu: 0,
            UsedTkeGpu: 0,
            TkeMemory: 0,
            UsedTkeMemory: 0,
          };
        }
        this.$emit('ready');
      },
    },
  };
</script>
