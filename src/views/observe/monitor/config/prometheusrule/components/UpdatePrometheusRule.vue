<template>
  <BaseDialog v-model="dialog" :width="1000" title="更新告警规则" icon="mdi-ruler" @reset="reset">
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :step="step"
        :edit="true"
        :mode="mode"
        :title="`${mode === 'metrics' ? 'PrometheusRule' : 'LogRule'}`"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="updatePrometheusRule"
      >
        确定
      </v-btn>
      <v-btn v-if="step >= 0 && step < totalStep - 1" class="float-right mx-2" color="primary" text @click="nextStep">
        下一步
      </v-btn>
      <v-btn v-if="step > 0 && step <= totalStep - 1" class="float-right mx-2" color="primary" text @click="lastStep">
        上一步
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import PrometheusRuleBaseForm from './PrometheusRuleBaseForm';
  import { putUpdatePrometheusRule, putUpdateLogAlertRule } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdatePrometheusRule',
    components: {
      PrometheusRuleBaseForm,
    },
    mixins: [BaseResource],
    props: {
      mode: {
        type: String,
        default: () => 'monitor',
      },
    },
    data: () => ({
      dialog: false,
      formComponent: 'PrometheusRuleBaseForm',
      item: null,
      step: 0,
      totalStep: 2,
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async updatePrometheusRule() {
        if (this.$refs[this.formComponent].validate()) {
          const obj = deepCopy(this.$refs[this.formComponent].getData());

          if (this.mode === 'monitor') {
            // 移除labelpairs中的空值
            for (const key in obj.labelpairs) {
              if (!obj.labelpairs[key]) {
                delete obj.labelpairs[key];
              }
            }

            await putUpdatePrometheusRule(this.$route.query.cluster, this.$route.query.namespace, obj.name, obj);
          } else if (this.mode === 'logging') {
            await putUpdateLogAlertRule(this.$route.query.cluster, this.$route.query.namespace, obj.name, obj);
          }

          this.reset();
          this.$emit('refresh');
        }
      },
      // 点击编辑后调用
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        this.$nextTick(() => {
          this.item = deepCopy(item);
          // 提前加载命名空间
          this.$refs[this.formComponent].setData(this.item);
          this.$refs[this.formComponent].setLabelpairs(this.item.labelpairs);
        });
      },

      lastStep() {
        if (this.step > 0) {
          const data = this.$refs[this.formComponent].getData();
          this.step -= 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].back(data);
          });
        }
      },
      nextStep() {
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (!data.alertLevels || (data.alertLevels && data.alertLevels.length === 0)) {
            this.$store.commit('SET_SNACKBAR', {
              text: '请添加告警级别',
              color: 'warning',
            });
            return;
          }
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      reset() {
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'PrometheusRuleBaseForm';
        this.item = {};
        this.dialog = false;
      },
    },
  };
</script>
