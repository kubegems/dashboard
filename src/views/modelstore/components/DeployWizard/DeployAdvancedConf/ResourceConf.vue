<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="资源部署" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="4">
          <v-text-field v-model.number="obj.replicas" label="实例数" :rules="objRules.replicasRules" type="number" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="obj.resources.limits.cpu" label="分配CPU" :rules="objRules.limitsCpuRule" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="obj.resources.limits.memory" label="分配内存" :rules="objRules.limitsMemoryRule" />
        </v-col>
        <v-col v-if="gpuData.NvidiaGpu || gpuData.TkeGpu || gpuData.TkeMemory" cols="4">
          <v-switch v-model="gpu" hide-details label="分配GPU" />
        </v-col>
      </v-row>
    </v-card-text>
    <template v-if="gpu">
      <template v-if="gpuData.NvidiaGpu">
        <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="nvidia.com/gpu" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="obj.resources.limits['limits.nvidia.com/gpu']"
                label="分配gpu"
                :rules="objRules.nvidiaGpuRule"
                :suffix="`${gpuData.ApplyNvidiaGpu || 0}(可使用)/${gpuData.NvidiaGpu || 0}(已分配)`"
                type="number"
              />
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
                v-model="obj.resources.limits['tencent.com/vcuda-core']"
                label="分配显卡"
                :rules="objRules.vcudaGpuRule"
                :suffix="`${gpuData.AllocatedTkeGpu / 100 || 0}(可使用)/${gpuData.TkeGpu / 100 || 0}(已分配)`"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="obj.resources.limits['tencent.com/vcuda-memory']"
                label="分配显存"
                :rules="objRules.vcudaMemoryRule"
                :suffix="`${(gpuData.AllocatedTkeMemory * 256) / 1024 || 0}Gi(可使用)/${
                  (gpuData.TkeMemory * 256) / 1024 || 0
                }Gi(已分配)`"
                type="number"
              />
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
        gpuData: {},
        obj: {
          resources: {
            limits: {
              cpu: 1,
              memory: '2Gi',
            },
          },
          replicas: 1,
        },
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      objRules() {
        return {
          replicasRules: [positiveInteger],
          limitsCpuRule: [(v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || '格式错误(示例:1m,1)'],
          limitsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || '格式错误(示例:1Mi,1Gi)',
          ],
          nvidiaGpuRule: [
            (v) => parseInt(v) >= 0 || '格式错误(>=0)',
            (v) => parseInt(v) > this.getData.ApplyNvidiaGpu || '超出最大可分配值',
          ],
          vcudaGpuRule: [
            (v) => parseInt(v) >= 0 || '格式错误(>=0)',
            (v) => parseInt(v) > this.getData.AllocatedTkeGpu / 100 || '超出最大可分配值',
          ],
          vcudaMemoryRule: [
            (v) => parseInt(v) >= 0 || '格式错误(>=0)',
            (v) => parseInt(v) > (this.gpuData.AllocatedTkeMemory * 256) / 1024 || '超出最大可分配值',
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
              this.obj.replicas.limits['limits.nvidia.com/gpu'] = 0;
            }
            if (this.gpuData.TkeGpu || this.gpuData.TkeMemory) {
              this.obj.replicas.limits['tencent.com/vcuda-core'] = 0;
              this.obj.replicas.limits['tencent.com/vcuda-memory'] = 0;
            }
          }
        },
        deep: true,
        immediate: true,
      },
      spec: {
        handler(newValue) {
          if (newValue) {
            this.obj.resources = deepCopy(newValue.resources);
            this.obj.replicas = newValue.replicas;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        if (this.obj.resources.limits['tencent.com/vcuda-core']) {
          this.obj.resources.limits['tencent.com/vcuda-core'] =
            this.obj.resources.limits['tencent.com/vcuda-core'] * 100;
        }
        if (this.obj.resources.limits['tencent.com/vcuda-memory']) {
          this.obj.resources.limits['tencent.com/vcuda-memory'] =
            (this.obj.resources.limits['tencent.com/vcuda-memory'] * 1024) / 256;
        }
        return this.obj;
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
