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
    <v-row class="mt-1">
      <v-col cols="3">
        <v-card>
          <v-card-text>
            <v-sheet class="mt-5">
              <BaseRadialBarChart
                class="my-3"
                :cutout="70"
                :default-val="quota ? maxCpu : 0"
                :extend-height="180"
                :metrics="cpuSeries"
                :theme-conifg="config.theme"
                :title="$root.$t('resource.cpu')"
                tooltip-external
                :total="quota ? maxCpu : 0"
                unit="core"
              />
            </v-sheet>
            <v-sheet>
              <v-sheet v-if="showTenant">
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                  {{ quota ? sizeOfCpu(quota.tenantAllocated['limits.cpu']).toFixed(1) : 0 }}
                  core
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar
                  class="mr-2"
                  size="10"
                  :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                >
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$t('tip.physics')]) }}
                  {{ quota ? sizeOfCpu(quota.capacity['limits.cpu']).toFixed(1) : 0 }}
                  core
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.warning }">
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
            <v-sheet class="mt-5">
              <BaseRadialBarChart
                class="my-3"
                :cutout="70"
                :default-val="quota ? maxMemory : 0"
                :extend-height="180"
                :metrics="memorySeries"
                :theme-conifg="config.theme"
                :title="$root.$t('resource.memory')"
                tooltip-external
                :total="quota ? maxMemory : 0"
                unit="Gi"
              />
            </v-sheet>
            <v-sheet>
              <v-sheet v-if="showTenant">
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                  {{ quota ? sizeOfStorage(quota.tenantAllocated['limits.memory']).toFixed(1) : 0 }}
                  Gi
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar
                  class="mr-2"
                  size="10"
                  :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                >
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$t('tip.physics')]) }}
                  {{ quota ? sizeOfStorage(quota.capacity['limits.memory']).toFixed(1) : 0 }}
                  Gi
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.warning }">
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
            <v-sheet class="mt-5">
              <BaseRadialBarChart
                class="my-3"
                :cutout="75"
                :default-val="quota ? maxStorage : 0"
                :extend-height="180"
                :metrics="storageSeries"
                :theme-conifg="config.theme"
                :title="$root.$t('resource.storage')"
                tooltip-external
                :total="quota ? maxStorage : 0"
                unit="Gi"
              />
            </v-sheet>
            <v-sheet>
              <v-sheet v-if="showTenant">
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                  {{ quota ? sizeOfStorage(quota.tenantAllocated['limits.storage']).toFixed(1) : 0 }}
                  Gi
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar
                  class="mr-2"
                  size="10"
                  :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                >
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.total', [$t('tip.physics')]) }}
                  {{ quota ? sizeOfStorage(quota.capacity['limits.ephemeral-storage']).toFixed(1) : 0 }}
                  Gi
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar class="mr-2" size="0" :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.grey }">
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
            <v-sheet class="mt-5">
              <BaseRadialBarChart
                class="my-3"
                :default-val="quota ? parseFloat(quota.capacity['limits.pods']) : 0"
                :extend-height="180"
                :metrics="podSeries"
                :theme-conifg="config.theme"
                :title="$root.$t('resource.pod')"
                unit=""
              />
            </v-sheet>
            <v-sheet>
              <v-sheet>
                <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span>
                  {{ $t('tip.sum') }}
                  {{ quota ? quota.capacity['limits.pods'] : 0 }}
                </span>
              </v-sheet>
              <v-sheet>
                <v-avatar class="mr-2" size="0" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span />
              </v-sheet>
              <v-sheet v-if="showTenant">
                <v-avatar class="mr-2" size="0" :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.grey }">
                  <span class="white--text text-h5" />
                </v-avatar>
                <span />
              </v-sheet>
            </v-sheet>
            <div class="kubegems__clear-float" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-expand-transition>
        <v-row class="mx-0 mb-1">
          <v-col v-if="nvidia && showMore" cols="3">
            <v-card>
              <v-card-text>
                <v-sheet class="mt-5">
                  <BaseRadialBarChart
                    class="my-3"
                    :cutout="75"
                    :default-val="quota ? maxNvidia : 0"
                    :extend-height="180"
                    :metrics="nvidiaSeries"
                    :theme-conifg="config.theme"
                    :title="`Nvidia ${$root.$t('resource.gpu')}`"
                    tooltip-external
                    :total="quota ? maxNvidia : 0"
                    unit=""
                  />
                </v-sheet>
                <v-sheet>
                  <v-sheet v-if="showTenant">
                    <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                      <span class="white--text text-h5" />
                    </v-avatar>
                    <span>
                      {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                      {{ quota ? parseInt(quota.tenantAllocated['limits.nvidia.com/gpu']).toFixed(1) : 0 }}
                    </span>
                  </v-sheet>
                  <v-sheet>
                    <v-avatar
                      class="mr-2"
                      size="10"
                      :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                    >
                      <span class="white--text text-h5" />
                    </v-avatar>
                    <span>
                      {{ $t('tip.total', [$t('tip.physics')]) }}
                      {{ quota ? parseInt(quota.capacity['limits.nvidia.com/gpu']).toFixed(1) : 0 }}
                    </span>
                  </v-sheet>
                  <v-sheet>
                    <v-avatar class="mr-2" size="0" :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.grey }">
                      <span class="white--text text-h5" />
                    </v-avatar>
                    <span />
                  </v-sheet>
                </v-sheet>
                <div class="kubegems__clear-float" />
              </v-card-text>
            </v-card>
          </v-col>
          <template v-if="tke && showMore">
            <v-col cols="3">
              <v-card>
                <v-card-text>
                  <v-sheet class="mt-5">
                    <BaseRadialBarChart
                      class="my-3"
                      :cutout="75"
                      :default-val="quota ? maxTkeGpu : 0"
                      :extend-height="180"
                      :metrics="tkeGpuSeries"
                      :theme-conifg="config.theme"
                      :title="`Tke ${$root.$t('resource.gpu')}`"
                      tooltip-external
                      :total="quota ? maxTkeGpu : 0"
                      unit=""
                    />
                  </v-sheet>
                  <v-sheet>
                    <v-sheet v-if="showTenant">
                      <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                        <span class="white--text text-h5" />
                      </v-avatar>
                      <span>
                        {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                        {{
                          quota
                            ? (parseFloat(quota.tenantAllocated['limits.tencent.com/vcuda-core'] || 0) / 100).toFixed(1)
                            : 0
                        }}
                      </span>
                    </v-sheet>
                    <v-sheet>
                      <v-avatar
                        class="mr-2"
                        size="10"
                        :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                      >
                        <span class="white--text text-h5" />
                      </v-avatar>
                      <span>
                        {{ $t('tip.total', [$t('tip.physics')]) }}
                        {{
                          quota
                            ? (parseFloat(quota.capacity['limits.tencent.com/vcuda-core'] || 0) / 100).toFixed(1)
                            : 0
                        }}
                      </span>
                    </v-sheet>
                    <v-sheet>
                      <v-avatar
                        class="mr-2"
                        size="0"
                        :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.grey }"
                      >
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
                  <v-sheet class="mt-5">
                    <BaseRadialBarChart
                      class="my-3"
                      :cutout="75"
                      :default-val="quota ? maxTkeMemory : 0"
                      :extend-height="180"
                      :metrics="tkeMemorySeries"
                      :theme-conifg="config.theme"
                      :title="`Tke ${$root.$t('resource.video_memory')}`"
                      tooltip-external
                      :total="quota ? maxTkeMemory : 0"
                      unit="Gi"
                    />
                  </v-sheet>
                  <v-sheet>
                    <v-sheet v-if="showTenant">
                      <v-avatar class="mr-2" size="10" :style="{ backgroundColor: config.theme.THEME_COLOR.success }">
                        <span class="white--text text-h5" />
                      </v-avatar>
                      <span>
                        {{ $t('tip.total', [$root.$t('resource.tenant')]) }}
                        {{
                          quota
                            ? (
                                (parseFloat(quota.tenantAllocated['limits.tencent.com/vcuda-memory'] || 0) * 256) /
                                1024
                              ).toFixed(1)
                            : 0
                        }}
                        Gi
                      </span>
                    </v-sheet>
                    <v-sheet>
                      <v-avatar
                        class="mr-2"
                        size="10"
                        :style="{ backgroundColor: ThemeColor || config.theme.THEME_COLOR.primary }"
                      >
                        <span class="white--text text-h5" />
                      </v-avatar>
                      <span>
                        {{ $t('tip.total', [$t('tip.physics')]) }}
                        {{
                          quota
                            ? (
                                (parseFloat(quota.capacity['limits.tencent.com/vcuda-memory'] || 0) * 256) /
                                1024
                              ).toFixed(1)
                            : 0
                        }}
                        Gi
                      </span>
                    </v-sheet>
                    <v-sheet>
                      <v-avatar
                        class="mr-2"
                        size="0"
                        :style="{ backgroundColor: config.theme.THEME_COLOR_EXTEND.grey }"
                      >
                        <span class="white--text text-h5" />
                      </v-avatar>
                      <span />
                    </v-sheet>
                  </v-sheet>
                  <div class="kubegems__clear-float" />
                </v-card-text>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-expand-transition>
    </v-row>

    <div v-if="tke || nvidia" class="text-center mt-2">
      <v-btn color="primary" small text @click="showMore = !showMore">
        {{ showMore ? `${$root.$t('tip.hide')} GPU` : `${$root.$t('tip.show')} GPU` }}
      </v-btn>
    </div>
  </div>
</template>

<script>
  import config from '@kubegems/libs/constants/global';
  import { sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';

  export default {
    name: 'ResourceChart',
    i18n: {
      messages: messages,
    },
    props: {
      cluster: {
        type: Object,
        default: () => ({
          OversoldConfig: {
            cpu: 1,
            memory: 1,
            storage: 1,
          },
        }),
      },
      quota: {
        type: Object,
        default: () => ({
          capacity: {},
          tenantAllocated: {},
          used: {},
        }),
      },
      showTenant: {
        type: Boolean,
        default: () => true,
      },
    },
    data() {
      this.config = config;

      return {
        showMore: false,
      };
    },
    computed: {
      ...mapState(['JWT', 'ThemeColor']),
      ...mapGetters(['Cluster']),
      maxCpu() {
        return this.cluster
          ? sizeOfCpu(this.quota.capacity['limits.cpu']) * this.cluster.OversoldConfig.cpu
          : sizeOfCpu(this.quota.capacity['limits.cpu']);
      },
      maxMemory() {
        return this.cluster
          ? sizeOfStorage(this.quota.capacity['limits.memory']) * this.cluster.OversoldConfig.memory
          : sizeOfStorage(this.quota.capacity['limits.memory']);
      },
      maxStorage() {
        return sizeOfStorage(this.quota.capacity['limits.ephemeral-storage']) >
          sizeOfStorage(this.quota.tenantAllocated['limits.storage'])
          ? sizeOfStorage(this.quota.capacity['limits.ephemeral-storage'])
          : sizeOfStorage(this.quota.tenantAllocated['limits.storage']);
      },
      nvidia() {
        return Object.prototype.hasOwnProperty.call(this.quota?.capacity || {}, 'limits.nvidia.com/gpu');
      },
      tke() {
        return (
          Object.prototype.hasOwnProperty.call(this.quota?.capacity || {}, 'limits.tencent.com/vcuda-core') ||
          Object.prototype.hasOwnProperty.call(this.quota?.capacity || {}, 'limits.tencent.com/vcuda-memory')
        );
      },
      maxNvidia() {
        return parseInt(this.quota?.capacity?.['limits.nvidia.com/gpu'] || 0);
      },
      maxTkeGpu() {
        return parseFloat(this.quota?.capacity?.['limits.tencent.com/vcuda-core'] || 0) / 100;
      },
      maxTkeMemory() {
        return (parseFloat(this.quota?.capacity?.['limits.tencent.com/vcuda-memory'] || 0) * 256) / 1024;
      },
      cpuSeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (sizeOfCpu(this.quota.tenantAllocated['limits.cpu']) / this.maxCpu) * 100,
                  100 - (sizeOfCpu(this.quota.tenantAllocated['limits.cpu']) / this.maxCpu) * 100,
                ],
                [
                  (sizeOfCpu(this.quota.capacity['limits.cpu']) / this.maxCpu) * 100,
                  100 - (sizeOfCpu(this.quota.capacity['limits.cpu']) / this.maxCpu) * 100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota
            ? [
                [
                  (sizeOfCpu(this.quota.capacity['limits.cpu']) / this.maxCpu) * 100,
                  100 - (sizeOfCpu(this.quota.capacity['limits.cpu']) / this.maxCpu) * 100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        }
      },

      memorySeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (sizeOfStorage(this.quota.tenantAllocated['limits.memory']) / this.maxMemory) * 100,
                  100 - (sizeOfStorage(this.quota.tenantAllocated['limits.memory']) / this.maxMemory) * 100,
                ],
                [
                  (sizeOfStorage(this.quota.capacity['limits.memory']) / this.maxMemory) * 100,
                  100 - (sizeOfStorage(this.quota.capacity['limits.memory']) / this.maxMemory) * 100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota
            ? [
                [
                  (sizeOfStorage(this.quota.capacity['limits.memory']) / this.maxMemory) * 100,
                  100 - (sizeOfStorage(this.quota.capacity['limits.memory']) / this.maxMemory) * 100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        }
      },

      storageSeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (sizeOfStorage(this.quota.tenantAllocated['limits.storage']) / this.maxStorage) * 100,
                  100 - (sizeOfStorage(this.quota.tenantAllocated['limits.storage']) / this.maxStorage) * 100,
                ],
                [
                  (sizeOfStorage(this.quota.capacity['limits.ephemeral-storage']) / this.maxStorage) * 100,
                  100 - (sizeOfStorage(this.quota.capacity['limits.ephemeral-storage']) / this.maxStorage) * 100,
                ],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota
            ? [
                [
                  (sizeOfStorage(this.quota.capacity['limits.ephemeral-storage']) / this.maxStorage) * 100,
                  100 - (sizeOfStorage(this.quota.capacity['limits.ephemeral-storage']) / this.maxStorage) * 100,
                ],
              ]
            : [[0, 100]];
        }
      },

      podSeries() {
        return this.quota
          ? this.quota.capacity['limits.pods'] === 0
            ? [[0, 100]]
            : [
                [
                  (this.quota.capacity['limits.pods'] / this.quota.capacity['limits.pods']) * 100,
                  100 - (this.quota.capacity['limits.pods'] / this.quota.capacity['limits.pods']) * 100,
                ],
              ]
          : [[0, 100]];
      },

      nvidiaSeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (parseInt(this.quota.tenantAllocated['limits.nvidia.com/gpu']) / this.maxNvidia) * 100,
                  100 - (parseInt(this.quota.tenantAllocated['limits.nvidia.com/gpu']) / this.maxNvidia) * 100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota ? [[100, 0]] : [[0, 100]];
        }
      },

      tkeGpuSeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (parseFloat(this.quota.tenantAllocated['limits.tencent.com/vcuda-core'] || 0) /
                    this.maxTkeGpu /
                    100) *
                    100,
                  100 -
                    (parseFloat(this.quota.tenantAllocated['limits.tencent.com/vcuda-core'] || 0) /
                      this.maxTkeGpu /
                      100) *
                      100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota ? [[100, 0]] : [[0, 100]];
        }
      },

      tkeMemorySeries() {
        if (this.showTenant) {
          return this.quota
            ? [
                [
                  (((parseFloat(this.quota.tenantAllocated['limits.tencent.com/vcuda-memory'] || 0) /
                    this.maxTkeMemory) *
                    256) /
                    1024) *
                    100,
                  100 -
                    (((parseFloat(this.quota.tenantAllocated['limits.tencent.com/vcuda-memory'] || 0) /
                      this.maxTkeMemory) *
                      256) /
                      1024) *
                      100,
                ],
                [100, 0],
              ]
            : [
                [0, 100],
                [0, 100],
              ];
        } else {
          return this.quota ? [[100, 0]] : [[0, 100]];
        }
      },
    },
    methods: {
      sizeOfCpu: sizeOfCpu,
      sizeOfStorage: sizeOfStorage,
    },
  };
</script>
