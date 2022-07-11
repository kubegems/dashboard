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
        <v-col cols="4">
          <v-switch v-model="gpu" hide-details label="分配GPU" />
        </v-col>
      </v-row>
    </v-card-text>
    <template v-if="gpu">
      <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="nvidia.com/gpu" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="4">
            <v-text-field label="分配gpu" />
          </v-col>
        </v-row>
      </v-card-text>

      <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="tencent.com/vcuda" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="4">
            <v-text-field label="分配显卡" />
          </v-col>
          <v-col cols="4">
            <v-text-field label="分配显存" />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger } from '@/utils/rules';

  export default {
    name: 'ResourceConf',
    props: {
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        gpu: false,
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
      objRules() {
        return {
          replicasRules: [positiveInteger],
          limitsCpuRule: [(v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || '格式错误(示例:1m,1)'],
          limitsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || '格式错误(示例:1Mi,1Gi)',
          ],
        };
      },
    },
    watch: {
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
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
