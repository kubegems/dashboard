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
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :metrics="cpuSeries"
          :title="$root.$t('resource.cpu')"
          :total="quota ? quota.Cpu : 0"
          unit="core"
          :val="quota ? quota.UsedCpu : 0"
        />
      </v-col>
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :metrics="memorySeries"
          :title="$root.$t('resource.memory')"
          :total="quota ? quota.Memory : 0"
          unit="Gi"
          :val="quota ? quota.UsedMemory : 0"
        />
      </v-col>
      <v-col class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :metrics="storageSeries"
          :title="$root.$t('resource.storage')"
          :total="quota ? quota.Storage : 0"
          unit="Gi"
          :val="quota ? quota.UsedStorage : 0"
        />
      </v-col>

      <v-col v-if="nvidia && showMore" class="py-0" cols="4">
        <BaseRadialBarChart
          class="my-3"
          :metrics="nvidiaSeries"
          :title="`Nvidia ${$root.$t('resource.gpu')}`"
          :total="quota ? quota.NvidiaGpu : 0"
          unit="gpu"
          :val="quota ? quota.UsedNvidiaGpu : 0"
        />
      </v-col>

      <template v-if="tke && showMore">
        <v-col class="py-0" cols="4">
          <BaseRadialBarChart
            class="my-3"
            :metrics="tkeSeries"
            :title="`Tke ${$root.$t('resource.gpu')}`"
            :total="quota ? quota.TkeGpu : 0"
            unit=""
            :val="quota ? quota.UsedTkeGpu : 0"
          />
        </v-col>
        <v-col class="py-0" cols="4">
          <BaseRadialBarChart
            class="my-3"
            :metrics="tkeMemorySeries"
            :title="`Tke ${$root.$t('resource.video_memory')}`"
            :total="quota ? quota.TkeMemory : 0"
            unit=""
            :val="quota ? quota.UsedTkeMemory : 0"
          />
        </v-col>
      </template>
    </v-row>

    <div v-if="tke || nvidia" class="text-center mt-3">
      <v-btn color="primary" small text @click="showMore = !showMore">
        {{ showMore ? `${$root.$t('tip.hide')} GPU` : `${$root.$t('tip.show')} GPU` }}
      </v-btn>
    </div>
  </div>
</template>
<script>
  import messages from '../../../i18n';

  export default {
    name: 'ResourceChart',
    i18n: {
      messages: messages,
    },
    props: {
      nvidia: {
        type: Boolean,
        default: () => false,
      },
      quota: {
        type: Object,
        default: () => null,
      },
      tke: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        showMore: false,
      };
    },
    computed: {
      cpuSeries() {
        return this.quota
          ? this.quota.UsedCpu === 0
            ? [[0, 100]]
            : [[(this.quota.UsedCpu / this.quota.Cpu) * 100, 100 - (this.quota.UsedCpu / this.quota.Cpu) * 100]]
          : [[0, 100]];
      },

      memorySeries() {
        return this.quota
          ? this.quota.UsedMemory === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.UsedMemory / this.quota.Memory) * 100,
                  100 - (this.quota.UsedMemory / this.quota.Memory) * 100,
                ],
              ]
          : [[0, 100]];
      },
      storageSeries() {
        return this.quota
          ? this.quota.UsedStorage === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.UsedStorage / this.quota.Storage) * 100,
                  100 - (this.quota.UsedStorage / this.quota.Storage) * 100,
                ],
              ]
          : [[0, 100]];
      },
      nvidiaSeries() {
        return this.quota
          ? this.quota.UsedNvidiaGpu === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100,
                  100 - (this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100,
                ],
              ]
          : [[0, 100]];
      },
      tkeSeries() {
        return this.quota
          ? this.quota.UsedTkeGpu === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100,
                  100 - (this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100,
                ],
              ]
          : [[0, 100]];
      },
      tkeMemorySeries() {
        return this.quota
          ? this.quota.UsedTkeMemory === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100,
                  100 - (this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100,
                ],
              ]
          : [[0, 100]];
      },
    },
  };
</script>
