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
    <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.last_day_resource_used')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <v-menu
            v-model="topMenu"
            bottom
            left
            nudge-bottom="5px"
            offset-y
            origin="top center"
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-btn class="primary--text font-weight-medium" color="white" dark depressed small v-on="on">
                {{ podUsedMode }}
                <v-icon v-if="topMenu" right> mdi-chevron-up </v-icon>
                <v-icon v-else right> mdi-chevron-down </v-icon>
              </v-btn>
            </template>
            <v-data-iterator
              hide-default-footer
              :items="[{ text: $t('tip.resource_used'), values: environmentPodUsageSelect }]"
            >
              <template #no-data>
                <v-card>
                  <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat>
                  <v-list dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>{{ $t('tip.resource_used') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(select, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center mx-2"
                      link
                      :style="{ color: select.value === podUsageMode ? `#1e88e5 !important` : `` }"
                      @click="setPodUsageMode(select)"
                    >
                      <v-list-item-content>
                        <span>{{ select.text }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </v-sheet>
      </template>
    </BaseSubTitle>
    <v-card-text>
      <template v-if="Plugins && Plugins['monitoring']">
        <v-flex v-if="topN.length === 0" class="text-body-2" :style="{ position: 'relative', height: '400px' }">
          <span class="kubegems__full-center kubegems__text"> {{ $root.$t('data.no_data') }} </span>
        </v-flex>
        <v-flex v-for="(item, index) in topN" :key="index" class="text-body-2 mt-3 mb-3">
          <v-flex class="float-left resource__unit" :style="{ width: `80%` }">
            <v-icon color="success" small>mdi-cube</v-icon>
            {{ item.metric.pod }}
          </v-flex>
          <span class="float-right text-body-2 primary--text font-weight-medium resource__unit">
            <span v-if="podUsageMode.indexOf('cpu') > -1">
              {{ beautifyCpuUnit(sizeOfCpu(parseFloat(item.value[1]), 'n') * 1000 * 1000 * 1000) }}
            </span>
            <span v-else>
              {{ beautifyStorageUnit(sizeOfStorage(parseInt(item.value[1]), 'B')) }}
            </span>
          </span>
          <v-flex class="kubegems__clear-float" />
          <v-divider class="my-3" />
        </v-flex>
      </template>
      <template v-else>
        <div class="text-body-2" :style="{ position: 'relative', height: '400px' }">
          <span class="kubegems__full-center kubegems__text"> {{ $root.$t('plugin.missing', ['monitoring']) }} </span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';
  import {
    TOP_15_POD_CPU_AVG_PROMQL,
    TOP_15_POD_CPU_MAX_PROMQL,
    TOP_15_POD_MEMORY_AVG_PROMQL,
    TOP_15_POD_MEMORY_MAX_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'TopNResourceUsage',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    data() {
      return {
        topMenu: false,
        podUsageMode: 'cpuavg',
        topN: [],
      };
    },
    computed: {
      ...mapState(['Plugins']),
      ...mapGetters(['Environment']),
      podUsedMode() {
        const cn = this.environmentPodUsageSelect.find((e) => {
          return e.value === this.podUsageMode;
        });
        if (cn) {
          return cn.text;
        }
        return '';
      },
      environmentPodUsageSelect() {
        return [
          { text: this.$t('tip.cpu_avg_used'), value: 'cpuavg' },
          { text: this.$t('tip.cpu_max_used'), value: 'cpumax' },
          { text: this.$t('tip.memory_avg_used'), value: 'memoryavg' },
          { text: this.$t('tip.memory_max_used'), value: 'memorymax' },
        ];
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.topNPodResourceUsage();
      });
    },
    methods: {
      beautifyCpuUnit: beautifyCpuUnit,
      beautifyStorageUnit: beautifyStorageUnit,
      sizeOfCpu: sizeOfCpu,
      sizeOfStorage: sizeOfStorage,
      setPodUsageMode(select) {
        if (select.value !== this.podUsageMode) {
          this.podUsageMode = select.value;
          this.topNPodResourceUsage();
        }
      },
      async topNPodResourceUsage() {
        this.topN = [];
        let promql = '';
        if (this.podUsageMode === 'cpuavg') {
          promql = TOP_15_POD_CPU_AVG_PROMQL;
        } else if (this.podUsageMode === 'cpumax') {
          promql = TOP_15_POD_CPU_MAX_PROMQL;
        } else if (this.podUsageMode === 'memoryavg') {
          promql = TOP_15_POD_MEMORY_AVG_PROMQL;
        } else if (this.podUsageMode === 'memorymax') {
          promql = TOP_15_POD_MEMORY_MAX_PROMQL;
        }
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: promql.replaceAll('$1', this.Environment().Namespace),
          noprocessing: true,
        });
        this.topN = data;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .resource {
    &__unit {
      line-height: 24px;
    }
  }
</style>
