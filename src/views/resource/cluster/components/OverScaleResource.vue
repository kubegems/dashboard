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
  <BaseDialog v-model="dialog" icon="mdi-scale" :title="$t('tip.resource_oversold')" :width="1000" @reset="reset">
    <template #content>
      <BaseSubTitle :title="`${$root.$t('resource.cluster')} ${item ? item.ClusterName : ''}`" />
      <v-card-text class="px-0 pb-0 mt-2">
        <v-row>
          <v-col class="py-0" cols="4">
            <VueApexCharts height="250" :options="cpuOptions" :series="cpuSeries" type="radialBar" />
          </v-col>
          <v-col class="py-0" cols="4">
            <VueApexCharts height="250" :options="memoryOptions" :series="memorySeries" type="radialBar" />
          </v-col>
          <v-col class="py-0" cols="4">
            <VueApexCharts height="250" :options="storageOptions" :series="storageSeries" type="radialBar" />
          </v-col>
        </v-row>
      </v-card-text>

      <BaseSubTitle :title="$t('tip.resource_oversold')" />
      <v-form ref="form" v-model="valid" class="mt-4 mx-1" lazy-validation @submit.prevent>
        <v-row>
          <v-col class="px-2 py-0" cols="4">
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                {{ $t('tip.oversold', [$root.$t('resource.cpu')]) }}
                <span class="text-subtitle-2 primary--text"> {{ overResource.cpu.toFixed(1) }} core </span>
                {{ $t('tip.all', [$root.$t('resource.cpu')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.Cpu.toFixed(1) : 0 }}
                  core
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.OversoldConfig.cpu"
                class="my-0"
                :label="$t('tip.oversold_precent', [$root.$t('resource.cpu')])"
                required
                :rules="objRules.CpuRules"
                type="number"
                @keyup="onOversoldInput('cpu')"
              />
            </v-sheet>
          </v-col>
          <v-col class="px-2 py-0" cols="4">
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                {{ $t('tip.oversold', [$root.$t('resource.memory')]) }}
                <span class="text-subtitle-2 primary--text"> {{ overResource.memory.toFixed(1) }} Gi </span>
                {{ $t('tip.all', [$root.$t('resource.memory')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.Memory.toFixed(1) : 0 }}
                  Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.OversoldConfig.memory"
                class="my-0"
                :label="$t('tip.oversold_precent', [$root.$t('resource.memory')])"
                required
                :rules="objRules.MemoryRules"
                type="number"
                @keyup="onOversoldInput('memory')"
              />
            </v-sheet>
          </v-col>
          <v-col class="px-2 py-0" cols="4">
            <v-sheet class="pa-2">
              <v-flex class="text-subtitle-1">
                {{ $t('tip.oversold', [$root.$t('resource.storage')]) }}
                <span class="text-subtitle-2 primary--text"> {{ overResource.storage.toFixed(1) }} Gi </span>
                {{ $t('tip.all', [$root.$t('resource.storage')]) }}
                <span class="text-subtitle-2 primary--text">
                  {{ quota ? quota.Storage.toFixed(1) : 0 }}
                  Gi
                </span>
              </v-flex>
              <v-text-field
                v-model="obj.OversoldConfig.storage"
                class="my-0"
                :label="$t('tip.oversold_precent', [$root.$t('resource.storage')])"
                required
                :rules="objRules.StorageRules"
                type="number"
                @keyup="onOversoldInput('storage')"
              />
            </v-sheet>
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="oversoldClusterResource">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getClusterQuota, putUpdateCluster } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { generateRadialBarChartOptions } from '@/utils/chart';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'OverScaleResource',
    i18n: {
      messages: messages,
    },
    components: {
      VueApexCharts,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      item: null,
      quota: null,
      overResource: {
        cpu: 0,
        memory: 0,
        storage: 0,
      },
      obj: {
        OversoldConfig: {
          cpu: 1,
          memory: 1,
          storage: 1,
        },
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          CpuRules: [
            required,
            (v) => !!new RegExp('^\\d+\\.?\\d?$').test(v) || this.$t('form.format_rule'),
            (v) => parseInt(v) >= 1 || this.$t('form.limit_min_rule'),
            (v) => parseInt(v) <= 20 || this.$t('form.limit_max_rule'),
          ],
          MemoryRules: [
            required,
            (v) => !!new RegExp('^\\d+\\.?\\d?$').test(v) || this.$t('form.format_rule'),
            (v) => parseInt(v) >= 1 || this.$t('form.limit_min_rule'),
            (v) => parseInt(v) <= 20 || this.$t('form.limit_max_rule'),
          ],
          StorageRules: [
            required,
            (v) => !!new RegExp('^\\d+\\.?\\d?$').test(v) || this.$t('form.format_rule'),
            (v) => parseInt(v) >= 1 || this.$t('form.limit_min_rule'),
            (v) => parseInt(v) <= 20 || this.$t('form.limit_max_rule'),
          ],
        };
      },
      cpuSeries() {
        return this.quota
          ? [(this.quota.Cpu / this.quota.AllocatedCpu) * 100, (this.quota.UsedCpu / this.quota.AllocatedCpu) * 100]
          : [0, 0];
      },
      cpuOptions() {
        return generateRadialBarChartOptions(
          this.$t('tip.oversold', [this.$root.$t('resource.cpu')]),
          [this.$t('tip.all', [this.$root.$t('resource.cpu')]), this.$t('tip.used', [this.$root.$t('resource.cpu')])],
          this.quota ? this.quota.AllocatedCpu : 0,
          'core',
          true,
        );
      },
      memorySeries() {
        return this.quota
          ? [
              (this.quota.Memory / this.quota.AllocatedMemory) * 100,
              (this.quota.UsedMemory / this.quota.AllocatedMemory) * 100,
            ]
          : [0, 0];
      },
      memoryOptions() {
        return generateRadialBarChartOptions(
          this.$t('tip.oversold', [this.$root.$t('resource.memory')]),
          [
            this.$t('tip.all', [this.$root.$t('resource.memory')]),
            this.$t('tip.used', [this.$root.$t('resource.memory')]),
          ],
          this.quota ? this.quota.AllocatedMemory : 0,
          'Gi',
          true,
        );
      },
      storageSeries() {
        return this.quota
          ? [
              (this.quota.Storage / this.quota.AllocatedStorage) * 100,
              (this.quota.UsedStorage / this.quota.AllocatedStorage) * 100,
            ]
          : [0, 0];
      },
      storageOptions() {
        return generateRadialBarChartOptions(
          this.$t('tip.oversold', [this.$root.$t('resource.storage')]),
          [
            this.$t('tip.all', [this.$root.$t('resource.storage')]),
            this.$t('tip.used', [this.$root.$t('resource.storage')]),
          ],
          this.quota ? this.quota.AllocatedStorage : 0,
          'Gi',
          true,
        );
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async oversoldClusterResource() {
        if (this.$refs.form.validate(true)) {
          this.obj.OversoldConfig = {
            cpu: parseFloat(this.obj.OversoldConfig.cpu),
            memory: parseFloat(this.obj.OversoldConfig.memory),
            storage: parseFloat(this.obj.OversoldConfig.storage),
          };
          await putUpdateCluster(this.item.ID, {
            OversoldConfig: this.obj.OversoldConfig,
          });
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        this.item = deepCopy(item);
        if (this.item.OversoldConfig) {
          this.obj.OversoldConfig = this.item.OversoldConfig;
        }
        this.clusterQuota();
      },
      async clusterQuota() {
        const data = await getClusterQuota(this.item.ID);
        this.quota = {
          Cpu: sizeOfCpu(data.resources.capacity['cpu']),
          UsedCpu: sizeOfCpu(data.resources.used['cpu']),
          AllocatedCpu: sizeOfCpu(data.resources.capacity['cpu']) * this.obj.OversoldConfig.cpu,
          Memory: sizeOfStorage(data.resources.capacity['memory']),
          UsedMemory: sizeOfStorage(data.resources.used['memory']),
          AllocatedMemory: sizeOfStorage(data.resources.capacity['memory']) * this.obj.OversoldConfig.memory,
          Storage: sizeOfStorage(data.resources.capacity['ephemeral-storage']),
          UsedStorage: sizeOfStorage(data.resources.used['ephemeral-storage']),
          AllocatedStorage:
            sizeOfStorage(data.resources.capacity['ephemeral-storage']) * this.obj.OversoldConfig.storage,
        };
        this.overResource = {
          cpu: this.quota.Cpu * this.obj.OversoldConfig.cpu,
          memory: this.quota.Memory * this.obj.OversoldConfig.memory,
          storage: this.quota.Storage * this.obj.OversoldConfig.storage,
        };
      },
      onOversoldInput(type) {
        if (type === 'cpu') {
          if (!isNaN(this.obj.OversoldConfig.cpu) && this.obj.OversoldConfig.cpu !== '' && this.quota.Cpu) {
            this.$set(this.overResource, 'cpu', this.quota.Cpu * this.obj.OversoldConfig.cpu);
            this.quota.AllocatedCpu = this.quota.Cpu * this.obj.OversoldConfig.cpu;
          }
        } else if (type === 'memory') {
          if (!isNaN(this.obj.OversoldConfig.memory) && this.obj.OversoldConfig.memory !== '' && this.quota.Memory) {
            this.$set(this.overResource, 'memory', this.quota.Memory * this.obj.OversoldConfig.memory);
            this.quota.AllocatedMemory = this.quota.Memory * this.obj.OversoldConfig.memory;
          }
        } else if (type === 'storage') {
          if (!isNaN(this.obj.OversoldConfig.storage) && this.obj.OversoldConfig.storage !== '' && this.quota.Storage) {
            this.$set(this.overResource, 'storage', this.quota.Storage * this.obj.OversoldConfig.storage);
            this.quota.AllocatedStorage = this.quota.Storage * this.obj.OversoldConfig.storage;
          }
        }
      },
      reset() {
        this.dialog = false;
        this.obj = {
          OversoldConfig: {
            cpu: 1,
            memory: 1,
            storage: 1,
          },
        };
      },
    },
  };
</script>
