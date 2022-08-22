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
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.prometheus_rule')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>

          <v-col cols="6">
            <v-autocomplete
              v-model="mod"
              class="my-0"
              color="primary"
              hide-selected
              :items="modeItems"
              :label="$t('form.mode')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.modRule"
              @change="onModChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <!-- 资源 -->
          <template v-if="mod === 'template' && mode === 'monitor'">
            <v-col cols="6">
              <ResourceSelectCascade
                v-model="resource"
                :generator="generator"
                single-line
                :tenant="Tenant()"
                @setData="setResourceData"
              />
            </v-col>
            <!-- 资源 -->
          </template>

          <template v-if="mod === 'template' && mode === 'logging'">
            <v-col cols="6">
              <v-text-field
                v-model="obj.logqlGenerator.match"
                class="my-0"
                :label="$t('form.match_string')"
                required
                :rules="objRules.matchRule"
              />
            </v-col>
            <v-col cols="3">
              <v-autocomplete
                v-model="obj.logqlGenerator.labelpairs.container"
                class="my-0"
                color="primary"
                hide-selected
                :items="containerItems"
                :label="$t('form.dest_container')"
                :no-data-text="$root.$t('data.no_data')"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="obj.logqlGenerator.duration"
                class="my-0"
                :label="$t('form.time')"
                required
                :rules="objRules.durationRule"
              />
            </v-col>
          </template>

          <template v-if="mod === 'ql' && mode === 'monitor'">
            <v-col cols="12">
              <v-textarea
                v-model="obj.expr"
                auto-grow
                :label="$t('tip.query_ql')"
                :rules="objRules.exprRule"
                @keyup="onExprInput"
              />
              <MetricsSuggestion
                :cluster="$route.query.cluster"
                :expr="obj.expr"
                :left="20"
                :newline="118"
                :top="250"
                @insertMetrics="insertMetrics"
              />
            </v-col>
          </template>
          <template v-if="mod === 'ql' && mode === 'logging'">
            <v-col cols="12">
              <v-textarea
                v-model="obj.expr"
                auto-grow
                :label="$t('tip.query_ql')"
                :rules="objRules.exprRule"
                @keyup="onExprInput"
              />
            </v-col>
          </template>
          <!-- 单位 -->

          <v-col col="12">
            <v-autocomplete
              v-if="mode === 'monitor'"
              v-model="obj.inhibitLabels"
              class="my-0"
              color="primary"
              hide-selected
              :items="inhibitLabelItems"
              :label="$t('form.inhabit_label')"
              multiple
              :no-data-text="$root.$t('data.no_data')"
              @focus="getInhibitLabels"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-else
              v-model="obj.inhibitLabels"
              class="my-0"
              color="primary"
              hide-selected
              :items="inhibitLabelItems"
              :label="$t('form.inhabit_label')"
              multiple
              :no-data-text="$root.$t('data.no_data')"
              :search-input.sync="inhibitLabelText"
              @focus="getInhibitLabels"
              @keyup.enter="createInhibitLabel"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <!-- 评估时间 -->
          <v-col cols="6">
            <v-text-field v-model="obj.for" class="my-0" :label="$t('table.for')" required :rules="objRules.forRule" />
          </v-col>
          <!-- 评估时间 -->
        </v-row>
      </v-card-text>

      <!-- 标签筛选 -->
      <div v-if="mod === 'template' && mode === 'monitor'" class="mb-4">
        <BaseSubTitle :title="$t('tip.label_filter')" />
        <br />
        <RuleLabelpairs v-model="obj.labelpairs" />
      </div>
      <!-- 标签筛选 -->

      <AlertLevelForm
        ref="alertLevelForm"
        :data="obj.alertLevels"
        :namespace="obj.namespace"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle :title="$t('tip.alert_severity_config')" />
      <v-card-text class="pa-2">
        <AlertLevelItem
          :alertlevels="obj.alertLevels"
          @expandCard="expandCard"
          @removeAlertLevel="removeAlertLevel"
          @updateAlertLevel="updateAlertLevel"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import AlertLevelForm from './AlertLevelForm';
  import AlertLevelItem from './AlertLevelItem';
  import RuleLabelpairs from './RuleLabelpairs';
  import { getMetricsLabels, getPodList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required, timeInterval } from '@/utils/rules';
  import MetricsSuggestion from '@/views/observe/monitor/metrics/components/MetricsSuggestion';
  import ResourceSelectCascade from '@/views/observe/monitor/metrics/components/ResourceSelectCascade';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'Rule',
    i18n: {
      messages: messages,
    },
    components: {
      AlertLevelForm,
      AlertLevelItem,
      MetricsSuggestion,
      ResourceSelectCascade,
      RuleLabelpairs,
    },
    mixins: [BaseResource, BaseSelect, Metrics],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      expr: {
        type: String,
        default: () => '',
      },
      generator: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      mode: {
        type: String,
        default: () => 'monitor',
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        inhibitLabelItems: [],
        obj: {
          name: '',
          namespace: '',
          for: '1m',
          labelpairs: {},
          alertLevels: [],
          receivers: [],
          inhibitLabels: [],
          promqlGenerator: {
            resource: '',
            rule: '',
            unit: '',
            scope: '',
          },
          logqlGenerator: {
            match: '',
            duration: '',
            labelpairs: {
              container: '',
            },
          },
        },
        mod: 'template',
        containerItems: [],
        inhibitLabelText: '',
        resource: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      modeItems() {
        if (this.mode === 'monitor')
          return [
            { text: this.$t('tab.generate_from_template'), value: 'template' },
            { text: this.$t('tab.generate_from_promql'), value: 'ql' },
          ];
        if (this.mode === 'logging')
          return [
            { text: this.$t('tab.generate_from_template'), value: 'template' },
            { text: this.$t('tab.generate_from_logql'), value: 'ql' },
          ];
        return [];
      },
      objRules() {
        return {
          nameRule: [required],
          namespaceRule: [required],
          resourceRule: [required],
          ruleRule: [required],
          metricRule: [required],
          forRule: [timeInterval],
          compareRule: [required],
          severityRule: [required],
          thresholdValueRule: [required],
          exprRule: [required],
          modRule: [required],
          matchRule: [required],
          durationRule: [timeInterval],
        };
      },
    },
    watch: {
      expr: {
        handler(newValue) {
          if (newValue) {
            this.obj.expr = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      if (this.item) {
        this.obj = deepCopy(this.item);
      }
      this.load();
      this.$refs.form.resetValidation();
      this.obj.namespace = this.$route?.query.namespace;
      this.getInhibitLabels();
    },
    methods: {
      load() {
        if (this.mod === 'template' && this.mode === 'monitor') {
          if (!this.obj.promqlGenerator) {
            this.obj.promqlGenerator = {
              resource: '',
              scope: '',
              rule: '',
              unit: '',
            };
          }
          this.$delete(this.obj, 'expr');
        } else if (this.mod === 'ql' && this.mode === 'monitor') {
          if (!this.obj.expr) {
            this.obj.expr = '';
          }
          this.$delete(this.obj, 'logqlGenerator');
        } else if (this.mod === 'ql' && this.mode === 'logging') {
          if (!this.obj.expr) {
            this.obj.expr = '';
          }
          this.$delete(this.obj, 'promqlGenerator');
          this.$delete(this.obj, 'labelpairs');
        } else if (this.mod === 'template' && this.mode === 'logging') {
          if (!this.obj.logqlGenerator) {
            this.obj.logqlGenerator = {
              match: '',
              duration: '',
              labelpairs: {
                container: '',
              },
            };
          }
          this.getContainers();
          this.$delete(this.obj, 'expr');
        }
        this.$refs.form.resetValidation();
      },
      init(data) {
        this.$nextTick(() => {
          this.setData(data);
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.setData(data);
        });
      },
      addData(data) {
        this.obj.alertLevels = data;
        this.$refs.alertLevelForm.closeCard();
      },
      updateAlertLevel(index) {
        const alertLevel = this.obj.alertLevels[index];
        const data = {
          index: index,
          compareOp: alertLevel.compareOp,
          compareValue: alertLevel.compareValue,
          severity: alertLevel.severity,
        };

        this.$refs.alertLevelForm.setAlertLevel({
          compareSelector: alertLevel.compareOp,
          severity: alertLevel.severity,
        });
        this.$nextTick(() => {
          this.$refs.alertLevelForm.init(data);
          this.expand = true;
        });
      },
      removeAlertLevel(index) {
        this.$delete(this.obj.alertLevels, index);
      },
      expandCard() {
        this.$refs.alertLevelForm.setAlertLevel({
          index: -1,
          compareOp: '>',
          compareValue: '',
          severity: 'error',
        });
        this.$nextTick(() => {
          this.$refs.alertLevelForm.expandCard();
          this.expand = true;
        });
      },
      setData(data) {
        this.obj = deepCopy(data);
        if (!this.obj.promqlGenerator && this.mode === 'monitor') {
          this.mod = 'ql';
        } else if (this.obj.promqlGenerator && this.mode === 'monitor') {
          this.mod = 'template';
        } else if (!this.obj.logqlGenerator && this.mode === 'logging') {
          this.mod = 'ql';
        } else if (this.obj.logqlGenerator && this.mode === 'logging') {
          this.mod = 'template';
        }
      },
      setResourceData() {
        if (this.resource) {
          this.obj.promqlGenerator = {
            scope: this.resource.scope,
            resource: this.resource.resource,
            rule: this.resource.rule,
            unit: this.resource.unit,
          };
          this.setLabelpairs();
        }
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.alertLevelForm.closeCard();
        this.$refs.form.resetValidation();
        this.obj = deepCopy(this.$options.data().obj);
      },
      onModChange() {
        this.load();
        this.obj.labelpairs = {};
        this.obj.inhibitLabels = [];
        this.inhibitLabelItems = [];
      },
      // mergeLabelpairs 点击编辑时数据labelpairs与全值合并
      setLabelpairs(mergeLabelpairs = {}) {
        const labelpairs = {};
        if (this.resource) {
          const labels = this.resource.labels || [];
          labels.forEach((item) => {
            labelpairs[item] = '';
          });
        }
        this.$set(this.obj, 'labelpairs', { ...labelpairs, ...mergeLabelpairs });
        this.inhibitLabelItems = Object.keys(this.obj.labelpairs).map((l) => {
          return { text: l, value: l };
        });
      },
      async getInhibitLabels() {
        let data = [];
        if (this.mode === 'monitor' && this.mod === 'ql' && this.obj.expr) {
          data = await getMetricsLabels(
            this.$route.query.cluster || this.obj.cluster,
            this.$route.query.namespace || this.obj.namespace,
            {
              expr: this.obj.expr,
            },
          );
          this.obj.labelpairs = {};
          this.inhibitLabelItems = data.map((l) => {
            if (l !== '__name__') {
              this.obj.labelpairs[l] = '';
              return { text: l, value: l };
            }
          });
        } else if (this.mode === 'logging' && this.mod === 'template') {
          this.inhibitLabelItems = [
            { text: 'pod', value: 'pod' },
            { text: 'container', value: 'container' },
          ];
        }
        this.inhibitLabelItems = this.inhibitLabelItems.concat(...(this.obj.inhibitLabels || []));
      },
      createInhibitLabel() {
        if (
          !this.inhibitLabelItems.some((l) => {
            return l.value === this.inhibitLabelText;
          })
        ) {
          this.inhibitLabelItems.push({ text: this.inhibitLabelText, value: this.inhibitLabelText });
          this.obj.inhibitLabels.push(this.inhibitLabelText);
          this.inhibitLabelText = '';
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      insertMetrics(metrics) {
        this.$set(this.obj, 'expr', metrics);
        this.$forceUpdate();
      },
      onExprInput() {
        this.$forceUpdate();
      },
      async getContainers() {
        const data = await getPodList(
          this.$route.query.cluster || this.obj.cluster,
          this.$route.query.namespace || this.obj.namespace,
          {
            size: 1000,
          },
        );
        if (data) {
          data.List.forEach((pod) => {
            if (pod?.spec?.containers) {
              this.containerItems = this.containerItems.concat(
                pod.spec.containers.map((c) => {
                  return c.name;
                }),
              );
            }
          });

          this.containerItems = Array.from(new Set(this.containerItems));
          this.containerItems = this.containerItems.map((c) => {
            return { text: c, value: c };
          });
        }
      },
    },
  };
</script>
