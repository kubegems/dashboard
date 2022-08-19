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
  <v-form ref="form" v-model="valid" lazy-validation>
    <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.graph')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="mode"
            class="my-0"
            color="primary"
            hide-selected
            :items="modeItems"
            :label="$t('tip.mode')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.modeRule"
            @change="onModeChange"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <v-row>
        <!-- 资源 -->
        <template v-if="mode === 'template'">
          <v-col cols="6">
            <ResourceSelectCascade
              v-model="resource"
              :generator="generator"
              single-line
              :tenant="Tenant()"
              @setData="setData"
            />
          </v-col>
          <!-- 资源 -->

          <!-- 单位 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.promqlGenerator.unit"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_metrics_unitItems"
              :label="$t('tip.unit')"
              :no-data-text="$root.$t('data.no_data')"
              readonly
              :search-input.sync="m_metrics_unitText"
              @keydown.enter="m_metrics_createUnit"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </template>
        <template v-if="mode === 'ql'">
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('tip.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="obj.expr" auto-grow :label="$t('tip.query_ql')" :rules="objRules.exprRule" />
            <MetricsSuggestion
              :cluster="environment.clusterName"
              :expr="obj.expr"
              :left="20"
              :newline="118"
              :top="250"
              @insertMetrics="insertMetrics"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.unit"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_metrics_unitItems"
              :label="$t('tip.unit')"
              :no-data-text="$root.$t('data.no_data')"
              :search-input.sync="m_metrics_unitText"
              @keydown.enter="m_metrics_createUnit"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import MetricsSuggestion from '@/views/observe/monitor/metrics/components/MetricsSuggestion';
  import ResourceSelectCascade from '@/views/observe/monitor/metrics/components/ResourceSelectCascade';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'GraphBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      MetricsSuggestion,
      ResourceSelectCascade,
    },
    mixins: [Metrics],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      environment: {
        type: Object,
        default: () => {},
      },
      generator: {
        type: Object,
        default: () => undefined,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          name: '',
          promqlGenerator: {
            scope: '',
            resource: '',
            rule: '',
            unit: '',
          },
          expr: '',
          unit: '',
        },
        objRules: {
          nameRule: [required],
          resourceRule: [required],
          ruleRule: [required],
          exprRule: [required],
          modeRule: [required],
        },
        mode: 'template',
        resource: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      modeItems() {
        return [
          { text: this.$t('tab.generate_from_template'), value: 'template' },
          { text: this.$t('tab.generate_from_promql'), value: 'ql' },
        ];
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.mode = this.obj.promqlGenerator ? 'template' : 'ql';
            let unit = this.obj.promqlGenerator?.unit;
            if (!unit) {
              unit = this.unit;
            }
            this.m_metrics_initItems(unit);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onModeChange() {
        if (this.mode === 'template') {
          this.obj.promqlGenerator = {
            resource: '',
            rule: '',
            unit: '',
            scope: '',
          };
          this.obj.expr = null;
          this.obj.unit = null;
        } else if (this.mode === 'ql') {
          this.obj.promqlGenerator = null;
          this.obj.expr = '';
          this.obj.unit = '';
          this.obj.name = '';
        }
      },
      setData() {
        if (this.resource) {
          this.obj.promqlGenerator = {
            scope: this.resource.scope,
            resource: this.resource.resource,
            rule: this.resource.rule,
            unit: this.resource.unit,
          };
          this.obj.unit = this.resource.unit;
          this.obj.name = this.resource.showName;
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
        this.mode = 'template';
        this.resource = undefined;
      },
      insertMetrics(metrics) {
        this.$set(this.obj, 'expr', metrics);
        this.$forceUpdate();
      },
    },
  };
</script>
