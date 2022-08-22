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
  <BaseDialog
    v-model="dialog"
    icon="mdi-ruler"
    :title="$root.$t('operate.update_c', [$root.$t('resource.prometheus_rule')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :generator="generator"
        :item="item"
        :mode="mode"
        :step="step"
        :title="`${mode === 'metrics' ? 'PrometheusRule' : 'LogRule'}`"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="updatePrometheusRule"
      >
        {{ $root.$t('operate.confirm') }}
      </v-btn>
      <v-btn v-if="step >= 0 && step < totalStep - 1" class="float-right mx-2" color="primary" text @click="nextStep">
        {{ $root.$t('operate.next') }}
      </v-btn>
      <v-btn v-if="step > 0 && step <= totalStep - 1" class="float-right mx-2" color="primary" text @click="lastStep">
        {{ $root.$t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import PrometheusRuleBaseForm from './PrometheusRuleBaseForm';
  import { putUpdateLogAlertRule, putUpdatePrometheusRule } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdatePrometheusRule',
    i18n: {
      messages: messages,
    },
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
      generator: undefined,
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
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
      async init(item) {
        this.$nextTick(() => {
          this.item = deepCopy(item);
          // 提前加载命名空间
          this.$refs[this.formComponent].setData(this.item);
          this.$refs[this.formComponent].setLabelpairs(this.item.labelpairs);
          this.generator = this.item.promqlGenerator;
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
              text: this.$t('tip.add_alert_severity'),
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
