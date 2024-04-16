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
  <div>
    <v-row>
      <v-col class="py-0" cols="3">
        <BaseRadialBarChart
          class="my-3"
          :metrics="cpuSeries"
          :theme-conifg="config.theme"
          :title="$root.$t('resource.cpu')"
          :total="statistics ? statistics.Cpu : 0"
          unit="core"
          :val="statistics ? statistics.AllocatedCpu : 0"
        />
      </v-col>
      <v-col class="py-0" cols="3">
        <BaseRadialBarChart
          class="my-3"
          :metrics="memorySeries"
          :theme-conifg="config.theme"
          :title="$root.$t('resource.memory')"
          :total="statistics ? statistics.Memory : 0"
          unit="Gi"
          :val="statistics ? statistics.AllocatedMemory : 0"
        />
      </v-col>
      <v-col class="py-0" cols="3">
        <BaseRadialBarChart
          class="my-3"
          :metrics="storageSeries"
          :theme-conifg="config.theme"
          :title="$root.$t('resource.storage')"
          :total="statistics ? statistics.Storage : 0"
          unit="Gi"
          :val="statistics ? statistics.AllocatedStorage : 0"
        />
      </v-col>
      <v-col class="py-0" cols="3">
        <BaseRadialBarChart
          class="my-3"
          :metrics="podSeries"
          :theme-conifg="config.theme"
          :title="$root.$t('resource.pod')"
          :total="statistics ? statistics.Pod : 0"
          unit=""
          :val="statistics ? parseInt(statistics.AllocatedPod) : 0"
        />
      </v-col>
    </v-row>

    <v-expand-transition>
      <v-row>
        <v-col v-if="nvidia && showMore" class="py-0" cols="3">
          <BaseRadialBarChart
            class="my-3"
            :metrics="nvidiaGpuSeries"
            :theme-conifg="config.theme"
            :title="`Nvidia ${$root.$t('resource.gpu')}`"
            :total="statistics ? statistics.NvidiaGpu : 0"
            unit="gpu"
            :val="statistics ? statistics.AllocatedNvidiaGpu : 0"
          />
        </v-col>

        <template v-if="tke && showMore">
          <v-col class="py-0" cols="3">
            <BaseRadialBarChart
              class="my-3"
              :metrics="tkeGpuSeries"
              :theme-conifg="config.theme"
              :title="`Tke ${$root.$t('resource.gpu')}`"
              :total="statistics ? statistics.TkeGpu : 0"
              unit=""
              :val="statistics ? statistics.AllocatedTkeGpu : 0"
            />
          </v-col>
          <v-col class="py-0" cols="3">
            <BaseRadialBarChart
              class="my-3"
              :metrics="tkeMemorySeries"
              :theme-conifg="config.theme"
              :title="`Tke ${$root.$t('resource.video_memory')}`"
              :total="statistics ? statistics.TkeMemory : 0"
              unit=""
              :val="statistics ? statistics.AllocatedTkeMemory : 0"
            />
          </v-col>
        </template>
      </v-row>
    </v-expand-transition>

    <div v-if="tke || nvidia" class="mb-2 text-center">
      <v-btn color="primary" small text @click="showMore = !showMore">
        {{ showMore ? `${$t('tip.hide')} GPU` : `${$t('tip.show')} GPU` }}
      </v-btn>
    </div>
  </div>
</template>

<script>
  import config from '@kubegems/libs/constants/global';

  import messages from '../../i18n';

  export default {
    name: 'ResourceChart',
    i18n: {
      messages: messages,
    },
    props: {
      statistics: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      this.config = config;

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
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedCpu / this.statistics.Cpu) * 100,
                  100 - (this.statistics.AllocatedCpu / this.statistics.Cpu) * 100,
                ],
              ]
          : [[0, 100]];
      },
      memorySeries() {
        return this.statistics
          ? this.statistics.AllocatedMemory === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedMemory / this.statistics.Memory) * 100,
                  100 - (this.statistics.AllocatedMemory / this.statistics.Memory) * 100,
                ],
              ]
          : [[0, 100]];
      },
      storageSeries() {
        return this.statistics
          ? this.statistics.AllocatedStorage === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedStorage / this.statistics.Storage) * 100,
                  100 - (this.statistics.AllocatedStorage / this.statistics.Storage) * 100,
                ],
              ]
          : [[0, 100]];
      },
      podSeries() {
        return this.statistics
          ? this.statistics.AllocatedPod === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedPod / this.statistics.Pod) * 100,
                  100 - (this.statistics.AllocatedPod / this.statistics.Pod) * 100,
                ],
              ]
          : [[0, 100]];
      },

      nvidiaGpuSeries() {
        return this.statistics
          ? this.statistics.AllocatedNvidiaGpu === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedNvidiaGpu / this.statistics.NvidiaGpu) * 100,
                  100 - (this.statistics.AllocatedNvidiaGpu / this.statistics.NvidiaGpu) * 100,
                ],
              ]
          : [[0, 100]];
      },

      tkeGpuSeries() {
        return this.statistics
          ? this.statistics.AllocatedTkeGpu === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedTkeGpu / this.statistics.TkeGpu) * 100,
                  100 - (this.statistics.AllocatedTkeGpu / this.statistics.TkeGpu) * 100,
                ],
              ]
          : [[0, 100]];
      },

      tkeMemorySeries() {
        return this.statistics
          ? this.statistics.AllocatedTkeMemory === 0
            ? [[0, 100]]
            : [
                [
                  (this.statistics.AllocatedTkeMemory / this.statistics.TkeMemory) * 100,
                  100 - (this.statistics.AllocatedTkeMemory / this.statistics.TkeMemory) * 100,
                ],
              ]
          : [[0, 100]];
      },
    },
  };
</script>
