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
          <BaseRadialBarChart
            id="env_cpu"
            class="my-3"
            :metrics="cpuSeries"
            :title="$root.$t('resource.cpu')"
            :total="quota ? quota.Cpu : 0"
            unit="core"
            :val="quota ? quota.UsedCpu : 0"
          />
        </v-col>
        <v-col class="py-0" cols="3">
          <BaseRadialBarChart
            id="env_memory"
            class="my-3"
            :metrics="memorySeries"
            :title="$root.$t('resource.memory')"
            :total="quota ? quota.Memory : 0"
            unit="Gi"
            :val="quota ? quota.UsedMemory : 0"
          />
        </v-col>
        <v-col class="py-0" cols="3">
          <BaseRadialBarChart
            id="env_storage"
            class="my-3"
            :metrics="storageSeries"
            :title="$root.$t('resource.storage')"
            :total="quota ? quota.Storage : 0"
            unit="Gi"
            :val="quota ? quota.UsedStorage : 0"
          />
        </v-col>
        <v-col class="py-0" cols="3">
          <BaseRadialBarChart
            id="env_pod"
            class="my-3"
            :metrics="podSeries"
            :title="$root.$t('resource.pod')"
            :total="quota ? quota.Pod : 0"
            unit=""
            :val="quota ? quota.UsedPod : 0"
          />
        </v-col>
      </v-row>

      <v-expand-transition>
        <v-row>
          <v-col v-if="nvidia && showMore" class="py-0" cols="3">
            <BaseRadialBarChart
              id="env_nvidia_gpu"
              class="my-3"
              :metrics="nvidiaGpuSeries"
              :title="`Nvidia ${$root.$t('resource.gpu')}`"
              :total="quota ? quota.NvidiaGpu : 0"
              unit="gpu"
              :val="quota ? quota.UsedNvidiaGpu : 0"
            />
          </v-col>
          <template v-if="tke && showMore">
            <v-col class="py-0" cols="3">
              <BaseRadialBarChart
                id="env_tke_gpu"
                class="my-3"
                :metrics="tkeGpuSeries"
                :title="`Tke ${$root.$t('resource.gpu')}`"
                :total="quota ? quota.TkeGpu : 0"
                unit=""
                :val="quota ? quota.UsedTkeGpu : 0"
              />
            </v-col>
            <v-col class="py-0" cols="3">
              <BaseRadialBarChart
                id="env_tke_memory"
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
      </v-expand-transition>

      <div v-if="tke || nvidia" class="text-center">
        <v-btn color="primary" small text @click="showMore = !showMore">
          {{ showMore ? `${$t('tip.hide')} GPU` : `${$t('tip.show')} GPU` }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getEnvironmentQuota } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { sizeOfCpu, sizeOfStorage, sizeOfTke } from '@/utils/helpers';

  export default {
    name: 'ResourceQuota',
    i18n: {
      messages: messages,
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
        return this.quota
          ? [
              [
                this.quota.Cpu === 0 ? 0 : (this.quota.UsedCpu / this.quota.Cpu) * 100,
                100 - (this.quota.UsedCpu / this.quota.Cpu) * 100,
              ],
            ]
          : [[0, 100]];
      },
      memorySeries() {
        return this.quota
          ? [
              [
                this.quota.Memory === 0 ? 0 : (this.quota.UsedMemory / this.quota.Memory) * 100,
                100 - (this.quota.UsedMemory / this.quota.Memory) * 100,
              ],
            ]
          : [[0, 100]];
      },
      storageSeries() {
        return this.quota
          ? [
              [
                this.quota.Storage === 0 ? 0 : (this.quota.UsedStorage / this.quota.Storage) * 100,
                100 - (this.quota.UsedStorage / this.quota.Storage) * 100,
              ],
            ]
          : [[0, 100]];
      },
      podSeries() {
        return this.quota
          ? [
              [
                this.quota.Pod === 0 ? 0 : (this.quota.UsedPod / this.quota.Pod) * 100,
                100 - (this.quota.Pod === 0 ? 0 : (this.quota.UsedPod / this.quota.Pod) * 100),
              ],
            ]
          : [[0, 100]];
      },

      nvidiaGpuSeries() {
        return this.quota
          ? [
              [
                this.quota.NvidiaGpu === 0 ? 0 : (this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100,
                100 - (this.quota.UsedNvidiaGpu / this.quota.NvidiaGpu) * 100,
              ],
            ]
          : [[0, 100]];
      },

      tkeGpuSeries() {
        return this.quota
          ? [
              [
                this.quota.TkeGpu === 0 ? 0 : (this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100,
                100 - (this.quota.UsedTkeGpu / this.quota.TkeGpu) * 100,
              ],
            ]
          : [[0, 100]];
      },
      tkeMemorySeries() {
        return this.quota
          ? [
              [
                this.quota.TkeMemory === 0 ? 0 : (this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100,
                100 - (this.quota.UsedTkeMemory / this.quota.TkeMemory) * 100,
              ],
            ]
          : [[0, 100]];
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
            UsedNvidiaGpu: data.quota.status.used['requests.nvidia.com/gpu']
              ? parseFloat(data.quota.status.used['requests.nvidia.com/gpu'])
              : 0,

            TkeGpu: data.quota.status.hard['limits.tencent.com/vcuda-core']
              ? parseFloat(sizeOfTke(data.quota.status.hard['limits.tencent.com/vcuda-core']))
              : 0,
            UsedTkeGpu: data.quota.status.used['requests.tencent.com/vcuda-core']
              ? parseFloat(sizeOfTke(data.quota.status.used['requests.tencent.com/vcuda-core']))
              : 0,

            TkeMemory: data.quota.status.hard['limits.tencent.com/vcuda-memory']
              ? parseFloat(sizeOfTke(data.quota.status.hard['limits.tencent.com/vcuda-memory']))
              : 0,
            UsedTkeMemory: data.quota.status.used['requests.tencent.com/vcuda-memory']
              ? parseFloat(sizeOfTke(data.quota.status.used['requests.tencent.com/vcuda-memory']))
              : 0,
          };
          this.nvidia =
            Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'limits.nvidia.com/gpu') &&
            parseInt(data.quota.status.hard['limits.nvidia.com/gpu']) > 0;
          this.tke =
            (Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'limits.tencent.com/vcuda-core') &&
              parseInt(data.quota.status.hard['limits.tencent.com/vcuda-core']) > 0) ||
            (Object.prototype.hasOwnProperty.call(data.quota.status.hard, 'limits.tencent.com/vcuda-memory') &&
              parseInt(data.quota.status.hard['limits.tencent.com/vcuda-memory']) > 0);
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
