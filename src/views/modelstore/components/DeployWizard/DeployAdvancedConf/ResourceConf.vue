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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="资源部署" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="4">
          <v-text-field v-model.number="obj.replicas" label="实例数" :rules="objRules.replicasRules" type="number" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="obj.server.resources.limits.cpu" label="分配CPU" :rules="objRules.limitsCpuRule" />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="obj.server.resources.limits.memory"
            label="分配内存"
            :rules="objRules.limitsMemoryRule"
          />
        </v-col>
        <v-col v-if="gpuData.NvidiaGpu || gpuData.TkeGpu || gpuData.TkeMemory" cols="4">
          <v-switch v-model="gpu" class="ml-1" label="分配GPU" />
        </v-col>
      </v-row>
    </v-card-text>
    <template v-if="gpu">
      <v-tabs v-model="tab" height="30" @change="onTabChange">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <template v-if="gpuData.NvidiaGpu">
        <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="nvidia.com/gpu" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="obj.server.resources.limits['limits.nvidia.com/gpu']"
                label="分配gpu"
                :rules="objRules.nvidiaGpuRule"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text">
                    可使用 {{ gpuData.ApplyNvidiaGpu || 0 }}/总共 {{ gpuData.NvidiaGpu || 0 }}
                  </span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </template>

      <template v-if="gpuData.TkeGpu || gpuData.TkeMemory">
        <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="tencent.com/vcuda" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="obj.server.resources.limits['tencent.com/vcuda-core']"
                label="分配显卡"
                :rules="objRules.vcudaGpuRule"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text">
                    可使用 {{ gpuData.ApplyTkeGpu / 100 || 0 }} 核心/总共 {{ gpuData.TkeGpu / 100 || 0 }} 核心
                  </span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="obj.server.resources.limits['tencent.com/vcuda-memory']"
                label="分配显存"
                :rules="objRules.vcudaMemoryRule"
                type="number"
              >
                <template #append>
                  <span class="text-body-2 kubegems__text">
                    可使用 {{ (gpuData.ApplyTkeMemory * 256) / 1024 || 0 }} Gi/总共
                    {{ (gpuData.TkeMemory * 256) / 1024 || 0 }} Gi
                  </span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </template>
    </template>
  </v-form>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger } from '@/utils/rules';

  export default {
    name: 'ResourceConf',
    mixins: [BaseResource],
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        gpu: false,
        tab: 0,
        gpuData: {},
        obj: {
          server: {
            resources: {
              limits: {
                cpu: 2,
                memory: '4Gi',
              },
            },
          },
          replicas: 1,
        },
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      tabItems() {
        const items = [];
        if (this.gpuData.NvidiaGpu) {
          items.push({ text: 'nvidia', value: 'nvidia' });
        }
        if (this.gpuData.TkeGpu || this.gpuData.TkeMemory) {
          items.push({ text: 'tke', value: 'tke' });
        }
        return items;
      },
      objRules() {
        return {
          replicasRules: [positiveInteger],
          limitsCpuRule: [(v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || '格式错误(示例:1m,1)'],
          limitsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || '格式错误(示例:1Mi,1Gi)',
          ],
          nvidiaGpuRule: [
            positiveInteger,
            (v) => parseFloat(v) >= 0 || '格式错误(>=0)',
            (v) => parseFloat(v) <= parseFloat(this.gpuData.ApplyNvidiaGpu || 0) || '超出最大限制',
          ],
          vcudaGpuRule: [
            (v) => parseFloat(v) >= 0 || '格式错误(>=0)',
            (v) => parseFloat(v) <= parseFloat(this.gpuData.ApplyTkeGpu || 0) / 100 || '超出最大限制',
          ],
          vcudaMemoryRule: [
            (v) => parseFloat(v) >= 0 || '格式错误(>=0)',
            (v) => parseFloat(v) <= (parseFloat(this.gpuData.ApplyTkeMemory || 0) * 256) / 1024 || '超出最大限制',
          ],
        };
      },
    },
    watch: {
      base: {
        handler: async function (newValue) {
          if (newValue?.cluster) {
            await this.getGpu();
            if (this.gpuData.NvidiaGpu) {
              this.obj.server.resources.limits['limits.nvidia.com/gpu'] = 0;
            }
            if (this.gpuData.TkeGpu || this.gpuData.TkeMemory) {
              this.obj.server.resources.limits['tencent.com/vcuda-core'] = 0;
              this.obj.server.resources.limits['tencent.com/vcuda-memory'] = 0;
            }
          }
        },
        deep: true,
        immediate: true,
      },
      spec: {
        handler(newValue) {
          if (newValue) {
            this.obj.server.resources = deepCopy(newValue.server.resources);
            this.obj.replicas = newValue.replicas;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onTabChange() {
        if (this.gpuData.NvidiaGpu) {
          this.obj.resources.limits['limits.nvidia.com/gpu'] = 0;
          delete this.obj.server.resources.limits['tencent.com/vcuda-core'];
          delete this.obj.server.resources.limits['tencent.com/vcuda-memory'];
        }
        if (this.gpuData.TkeGpu || this.gpuData.TkeMemory) {
          this.obj.server.resources.limits['tencent.com/vcuda-core'] = 0;
          this.obj.server.resources.limits['tencent.com/vcuda-memory'] = 0;
          delete this.obj.server.resources.limits['limits.nvidia.com/gpu'];
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        const data = deepCopy(this.obj);
        if (data.server.resources.limits['tencent.com/vcuda-core']) {
          data.server.resources.limits['tencent.com/vcuda-core'] =
            data.server.resources.limits['tencent.com/vcuda-core'] * 100;
        }
        if (data.server.resources.limits['tencent.com/vcuda-memory']) {
          data.server.resources.limits['tencent.com/vcuda-memory'] =
            (data.server.resources.limits['tencent.com/vcuda-memory'] * 1024) / 256;
        }
        return data;
      },
      reset() {
        this.$refs.form.resetValidation();
      },
      async getGpu() {
        const data = await this.m_resource_tenantResourceQuota(this.base?.cluster, this.Tenant().TenantName);
        this.gpuData = data;
      },
    },
  };
</script>
