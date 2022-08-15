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
  <v-flex>
    <v-row>
      <v-col class="pb-0 pt-6" cols="3">
        <v-text-field
          v-model="obj.ResourceQuota['limits.cpu']"
          :label="$t('tip.limit_value', [$root.$t('resource.cpu')])"
          :rules="resourceQuotaRules['limits.cpu']"
          type="number"
        >
          <template #append>
            <span class="text-body-2 kubegems__text">core</span>
          </template>
        </v-text-field>
      </v-col>
      <v-col class="pb-0 pt-6" cols="3">
        <v-text-field
          v-model="obj.ResourceQuota['limits.memory']"
          :label="$t('tip.limit_value', [$root.$t('resource.memory')])"
          :rules="resourceQuotaRules['limits.memory']"
          type="number"
        >
          <template #append>
            <span class="text-body-2 kubegems__text">Gi</span>
          </template>
        </v-text-field>
      </v-col>
      <v-col class="pb-0 pt-6" cols="3">
        <v-text-field
          v-model="obj.ResourceQuota['requests.storage']"
          :label="$t('tip.limit_value', [$root.$t('resource.storage')])"
          :rules="resourceQuotaRules['requests.storage']"
          type="number"
        >
          <template #append>
            <span class="text-body-2 kubegems__text">Gi</span>
          </template>
        </v-text-field>
      </v-col>
      <v-col class="pb-0 pt-6" cols="3">
        <v-text-field
          v-model="obj.ResourceQuota['count/pods']"
          :label="$t('tip.limit_value', [$root.$t('resource.pod')])"
          :rules="resourceQuotaRules['count/pods']"
          type="number"
        >
          <template #append>
            <span class="text-body-2 kubegems__text" />
          </template>
        </v-text-field>
      </v-col>

      <v-col v-if="nvidia" class="py-0" cols="3">
        <v-text-field
          v-model="obj.ResourceQuota['limits.nvidia.com/gpu']"
          :label="`Nvidia ${$t('tip.limit_value', [$root.$t('resource.gpu')])}`"
          :rules="resourceQuotaRules['limits.nvidia.com/gpu']"
          type="number"
        >
          <template #append>
            <span class="text-body-2 kubegems__text">Gpu</span>
          </template>
        </v-text-field>
      </v-col>

      <template v-if="tke">
        <v-col class="py-0" cols="3">
          <v-text-field
            v-model="obj.ResourceQuota['tencent.com/vcuda-core']"
            :label="`Tke ${$t('tip.limit_value', [$root.$t('resource.gpu')])}`"
            :rules="resourceQuotaRules['tencent.com/vcuda-core']"
            type="number"
          >
            <template #append>
              <span class="text-body-2 kubegems__text">
                {{ parseInt(obj.ResourceQuota['tencent.com/vcuda-core'] || 0) / 100 }}Gpu
              </span>
            </template>
          </v-text-field>
        </v-col>

        <v-col class="py-0" cols="3">
          <v-text-field
            v-model="obj.ResourceQuota['tencent.com/vcuda-memory']"
            :label="`Tke ${$t('tip.limit_value', [$root.$t('resource.video_memory')])}`"
            :rules="resourceQuotaRules['tencent.com/vcuda-memory']"
            type="number"
          >
            <template #append>
              <span class="text-body-2 kubegems__text">
                {{ (parseInt(obj.ResourceQuota['tencent.com/vcuda-memory'] || 0) * 256) / 1024 }}Gi
              </span>
            </template>
          </v-text-field>
        </v-col>
      </template>
    </v-row>
  </v-flex>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';
  import { positiveInteger } from '@/utils/rules';

  export default {
    name: 'ResourceQuota',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Object,
        default: () => null,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      statistics: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        obj: {
          ResourceQuota: {
            'requests.cpu': 0,
            'limits.cpu': 0,
            'requests.memory': 0,
            'limits.memory': 0,
            'requests.storage': 0,
            'count/pods': 100,
          },
        },
        apply: {
          ApplyCpu: 10000,
          ApplyMemory: 10000,
          ApplyStorage: 10000,
          ApplyPod: 5120,
          ApplyNvidiaGpu: 0,
          ApplyTkeGpu: 0,
          ApplyTkeMemory: 0,
        },
        now: {
          'requests.cpu': 0,
          'limits.cpu': 0,
          'requests.memory': 0,
          'limits.memory': 0,
          'requests.storage': 0,
          'count/pods': 5120,
          'limits.nvidia.com/gpu': 0,
          'tencent.com/vcuda-core': 0,
          'tencent.com/vcuda-memory': 0,
        },
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
      resourceQuotaRules() {
        return {
          'limits.cpu': [
            (v) => parseFloat(v) > 0 || this.$t('form.limit_min_rule'),
            positiveInteger,
            (v) => parseFloat(v) <= this.apply.ApplyCpu + this.now['limits.cpu'] || this.$t('form.limit_max_rule'),
          ],
          'limits.memory': [
            (v) => parseFloat(v) > 0 || this.$t('form.limit_min_rule'),
            positiveInteger,
            (v) =>
              parseFloat(v) <= this.apply.ApplyMemory + this.now['limits.memory'] || this.$t('form.limit_max_rule'),
          ],
          'requests.storage': [
            (v) => parseFloat(v) > 0 || this.$t('form.limit_min_rule'),
            positiveInteger,
            (v) =>
              parseFloat(v) <= this.apply.ApplyStorage + this.now['requests.storage'] || this.$t('form.limit_max_rule'),
          ],
          'count/pods': [
            (v) => parseFloat(v) > 0 || this.$t('form.limit_min_rule'),
            positiveInteger,
            (v) =>
              parseFloat(v) <=
                this.apply.ApplyPod + (this.now['count/pods'] ? parseInt(this.now['count/pods']) : 5120) ||
              this.$t('form.limit_max_rule'),
          ],
          'limits.nvidia.com/gpu': [
            positiveInteger,
            (v) =>
              parseFloat(v) <= this.apply.ApplyNvidiaGpu + (this.now['limits.nvidia.com/gpu'] || 0) ||
              this.$t('form.limit_max_rule'),
          ],
          'tencent.com/vcuda-core': [
            positiveInteger,
            (v) =>
              parseFloat(v) <= this.apply.ApplyTkeGpu + (this.now['tencent.com/vcuda-core'] || 0) ||
              this.$t('form.limit_max_rule'),
          ],
          'tencent.com/vcuda-memory': [
            positiveInteger,
            (v) =>
              parseFloat(v) <= this.apply.ApplyTkeMemory + (this.now['tencent.com/vcuda-memory'] || 0) ||
              this.$t('form.limit_max_rule'),
          ],
        };
      },
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            if (!this.obj.ResourceQuota['count/pods']) {
              this.obj.ResourceQuota['count/pods'] = 5120;
            }
            this.removeUnit();
            if (this.edit) {
              this.now = deepCopy(this.obj.ResourceQuota);
            }
          }
        },
        deep: true,
        immediate: true,
      },
      statistics: {
        handler(newValue) {
          if (newValue) {
            this.apply = deepCopy(newValue);
            if (!this.edit) {
              if (newValue.NvidiaGpu) {
                this.obj.ResourceQuota['limits.nvidia.com/gpu'] = 0;
              } else {
                delete this.obj.ResourceQuota['limits.nvidia.com/gpu'];
              }
              if (newValue.TkeGpu || newValue.TkeMemory) {
                this.obj.ResourceQuota['tencent.com/vcuda-core'] = 0;
                this.obj.ResourceQuota['tencent.com/vcuda-memory'] = 0;
              } else {
                delete this.obj.ResourceQuota['tencent.com/vcuda-core'];
                delete this.obj.ResourceQuota['tencent.com/vcuda-memory'];
              }
            } else {
              if (newValue.NvidiaGpu && !this.obj.ResourceQuota['limits.nvidia.com/gpu']) {
                this.obj.ResourceQuota['limits.nvidia.com/gpu'] = 0;
              }
              if (newValue.TkeGpu && !this.obj.ResourceQuota['tencent.com/vcuda-core']) {
                this.obj.ResourceQuota['tencent.com/vcuda-core'] = 0;
              }
              if (newValue.TkeMemory && !this.obj.ResourceQuota['tencent.com/vcuda-memory']) {
                this.obj.ResourceQuota['tencent.com/vcuda-memory'] = 0;
              }
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      generateUnit() {
        const resourceQuota = deepCopy(this.obj.ResourceQuota);
        resourceQuota['requests.cpu'] = `${sizeOfCpu(resourceQuota['limits.cpu'])}`;
        resourceQuota['limits.cpu'] = `${sizeOfCpu(resourceQuota['limits.cpu'])}`;
        resourceQuota['requests.memory'] = `${sizeOfStorage(`${resourceQuota['limits.memory']}Gi`)}Gi`;
        resourceQuota['limits.memory'] = `${sizeOfStorage(`${resourceQuota['limits.memory']}Gi`)}Gi`;
        resourceQuota['requests.storage'] = `${sizeOfStorage(`${resourceQuota['requests.storage']}Gi`)}Gi`;
        if (resourceQuota['tencent.com/vcuda-core']) {
          resourceQuota['tencent.com/vcuda-core'] = `${resourceQuota['tencent.com/vcuda-core']}`;
        }
        if (resourceQuota['tencent.com/vcuda-memory']) {
          resourceQuota['tencent.com/vcuda-memory'] = `${resourceQuota['tencent.com/vcuda-memory']}`;
        }
        return resourceQuota;
      },
      removeUnit() {
        const resourceQuota = deepCopy(this.obj.ResourceQuota);
        resourceQuota['requests.cpu'] = sizeOfCpu(resourceQuota['requests.cpu']);
        resourceQuota['limits.cpu'] = sizeOfCpu(resourceQuota['limits.cpu']);
        resourceQuota['requests.memory'] = sizeOfStorage(resourceQuota['requests.memory']);
        resourceQuota['limits.memory'] = sizeOfStorage(resourceQuota['limits.memory']);
        resourceQuota['requests.storage'] = sizeOfStorage(resourceQuota['requests.storage']);
        if (resourceQuota['limits.nvidia.com/gpu']) {
          resourceQuota['limits.nvidia.com/gpu'] = parseInt(resourceQuota['limits.nvidia.com/gpu']);
        }
        if (resourceQuota['tencent.com/vcuda-core']) {
          resourceQuota['tencent.com/vcuda-core'] = parseInt(resourceQuota['tencent.com/vcuda-core']);
        }
        if (resourceQuota['tencent.com/vcuda-memory']) {
          resourceQuota['tencent.com/vcuda-memory'] = parseInt(resourceQuota['tencent.com/vcuda-memory']);
        }
        this.obj.ResourceQuota = resourceQuota;
      },
    },
  };
</script>
