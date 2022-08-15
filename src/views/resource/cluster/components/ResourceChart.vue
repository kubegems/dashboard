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
  <v-row class="mt-1">
    <v-col cols="3">
      <v-card>
        <v-card-text>
          <v-sheet>
            <VueApexCharts height="250" :options="cpuOptions" :series="cpuSeries" type="radialBar" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#00bcd4` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                {{ quota ? sizeOfCpu(quota.tenantAllocated['limits.cpu']).toFixed(1) : 0 }}
                core
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#1e88e5` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$t('tip.physics')]) }}
                {{ quota ? sizeOfCpu(quota.capacity.cpu).toFixed(1) : 0 }}
                core
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#fb8c00` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $root.$t('resource.cpu_c', [$t('tip.virtual')]) }}
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
            <VueApexCharts height="250" :options="memoryOptions" :series="memorySeries" type="radialBar" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#00bcd4` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                {{ quota ? sizeOfStorage(quota.tenantAllocated['limits.memory']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#1e88e5` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$t('tip.physics')]) }}
                {{ quota ? sizeOfStorage(quota.capacity.memory).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#fb8c00` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $root.$t('resource.memory_c', [$t('tip.virtual')]) }}
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
            <VueApexCharts height="250" :options="storageOptions" :series="storageSeries" type="radialBar" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#00bcd4` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                {{ quota ? sizeOfStorage(quota.tenantAllocated['requests.storage']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#1e88e5` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.total', [$t('tip.physics')]) }}
                {{ quota ? sizeOfStorage(quota.capacity['ephemeral-storage']).toFixed(1) : 0 }}
                Gi
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="0" :style="{ backgroundcolor: `#607d8b` }">
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
            <VueApexCharts height="250" :options="podOptions" :series="podSeries" type="radialBar" />
          </v-sheet>
          <v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#00bcd4` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span>
                {{ $t('tip.sum') }}
                {{ quota ? quota.capacity.pods : 0 }}
              </span>
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="0" :style="{ backgroundcolor: `#00bcd4` }">
                <span class="white--text text-h5" />
              </v-avatar>
              <span />
            </v-sheet>
            <v-sheet>
              <v-avatar class="mr-2" size="0" :style="{ backgroundcolor: `#607d8b` }">
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
  import VueApexCharts from 'vue-apexcharts';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { generateRadialBarChartOptions } from '@/utils/chart';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ResourceChart',
    i18n: {
      messages: messages,
    },
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
          this.$root.$t('resource.cpu'),
          [
            this.$t('tip.total', [this.$root.$t('resource.tenant')]),
            this.$t('tip.total', [this.$t('tip.physics')]),
            this.$root.$t('resource.cpu_c', [this.$t('tip.virtual')]),
          ],
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
          this.$root.$t('resource.memory'),
          [
            this.$t('tip.total', [this.$root.$t('resource.tenant')]),
            this.$t('tip.total', [this.$t('tip.physics')]),
            this.$root.$t('resource.memory_c', [this.$t('tip.virtual')]),
          ],
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
          this.$root.$t('resource.storage'),
          [this.$t('tip.total', [this.$root.$t('resource.tenant')]), this.$t('tip.total', [this.$t('tip.physics')])],
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
        return generateRadialBarChartOptions(
          this.$root.$t('resource.pod'),
          [this.$t('tip.sum')],
          this.quota ? this.quota.capacity.pods : 0,
          '',
          true,
        );
      },
    },
    methods: {
      sizeOfCpu: sizeOfCpu,
      sizeOfStorage: sizeOfStorage,
    },
  };
</script>
