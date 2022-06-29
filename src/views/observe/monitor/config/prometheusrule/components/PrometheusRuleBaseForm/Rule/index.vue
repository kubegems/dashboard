<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="告警规则定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              label="名称"
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
              label="模式"
              no-data-text="暂无可选数据"
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
              <v-autocomplete
                v-model="obj.promqlGenerator.resource"
                class="my-0"
                color="primary"
                hide-selected
                :items="resourceItems"
                label="资源"
                no-data-text="暂无可选数据"
                :rules="objRules.resourceRule"
                @change="onResourceChange"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <!-- 资源 -->

            <!-- 规则 -->
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.promqlGenerator.rule"
                class="my-0"
                color="primary"
                :disabled="!obj.promqlGenerator.resource"
                hide-selected
                :items="ruleItems"
                label="规则"
                no-data-text="暂无可选数据"
                :rules="objRules.ruleRule"
                @change="onRuleChange"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <!-- 规则 -->

            <!-- 单位 -->
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.promqlGenerator.unit"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_metrics_unitItems"
                label="单位(回车可创建自定义单位)"
                no-data-text="暂无可选数据"
                :readonly="mod === 'template'"
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

          <template v-if="mod === 'template' && mode === 'logging'">
            <v-col cols="6">
              <v-text-field
                v-model="obj.logqlGenerator.match"
                class="my-0"
                label="匹配的字符串(支持正则)"
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
                label="目标容器"
                no-data-text="暂无可选数据"
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
                label="时长"
                required
                :rules="objRules.durationRule"
              />
            </v-col>
          </template>

          <template v-if="mod === 'ql'">
            <v-col cols="12">
              <v-textarea
                v-model="obj.expr"
                auto-grow
                label="查询语句"
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
          <!-- 单位 -->

          <v-col col="12">
            <v-autocomplete
              v-if="mode === 'monitor'"
              v-model="obj.inhibitLabels"
              class="my-0"
              color="primary"
              hide-selected
              :items="inhibitLabelItems"
              label="抑制标签"
              multiple
              no-data-text="暂无可选数据"
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
              label="抑制标签(回车创建)"
              multiple
              no-data-text="暂无可选数据"
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
            <v-text-field v-model="obj.for" class="my-0" label="评估时间" required :rules="objRules.forRule" />
          </v-col>
          <!-- 评估时间 -->
        </v-row>
      </v-card-text>

      <!-- 标签筛选 -->
      <div v-if="mod === 'template' && mode === 'monitor'" class="mb-4">
        <BaseSubTitle title="标签筛选" />
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
      <BaseSubTitle title="告警级别配置" />
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
  import { mapState } from 'vuex';

  import AlertLevelForm from './AlertLevelForm';
  import AlertLevelItem from './AlertLevelItem';
  import RuleLabelpairs from './RuleLabelpairs';
  import { getMetricsLabels, getMyConfigData, getPodList, getSystemConfigData } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import MetricsSuggestion from '@/views/observe/monitor/metrics/components/MetricsSuggestion';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'Rule',
    components: {
      AlertLevelForm,
      AlertLevelItem,
      MetricsSuggestion,
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
        metricsConfig: {}, // 指标配置
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
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      modeItems() {
        if (this.mode === 'monitor')
          return [
            { text: '由模版生成', value: 'template' },
            { text: '由PromQl生成', value: 'ql' },
          ];
        if (this.mode === 'logging')
          return [
            { text: '由模版生成', value: 'template' },
            { text: '由LogQl生成', value: 'ql' },
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
          forRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          compareRule: [required],
          severityRule: [required],
          thresholdValueRule: [required],
          exprRule: [required],
          modRule: [required],
          matchRule: [required],
          durationRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
        };
      },
      resourceItems() {
        const resourcesObj = this.metricsConfig.resources || {};
        return Object.keys(resourcesObj).map((key) => ({
          text: resourcesObj[key].showName,
          value: key,
        }));
      },
      ruleItems() {
        if (this.metricsConfig.resources && this.obj.promqlGenerator.resource) {
          const rulesObj = this.metricsConfig.resources[this.obj.promqlGenerator.resource].rules;
          return Object.keys(rulesObj).map((key) => ({
            text: rulesObj[key].showName,
            value: key,
          }));
        }

        return [];
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
              rule: '',
              unit: '',
            };
          }
          this.$delete(this.obj, 'expr');
          this.getMonitorConfig();
          this.setLabelpairs();
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
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.alertLevelForm.closeCard();
        this.$refs.form.resetValidation();
        this.obj = deepCopy(this.$options.data().obj);
      },
      onResourceChange() {
        // resource选择变更时需要重置rule值
        this.obj.promqlGenerator.rule = '';
        this.obj.promqlGenerator.unit = '';
      },
      onRuleChange() {
        this.obj.promqlGenerator.unit = '';
        this.setLabelpairs();
      },
      onModChange() {
        this.load();
        this.obj.labelpairs = {};
        this.obj.inhibitLabels = [];
        this.inhibitLabelItems = [];
      },
      // mergeLabelpairs 点击编辑时数据labelpairs与全值合并
      setLabelpairs(mergeLabelpairs = {}) {
        const { resource, rule } = this.obj?.promqlGenerator || { resource: '', rule: '' };
        const labelpairs = {};
        if (resource && rule && this.metricsConfig) {
          const labels = this.metricsConfig.resources?.[resource].rules[rule].labels || [];
          labels.forEach((item) => {
            labelpairs[item] = '';
          });
        }
        this.$set(this.obj, 'labelpairs', { ...labelpairs, ...mergeLabelpairs });
        this.inhibitLabelItems = Object.keys(this.obj.labelpairs).map((l) => {
          return { text: l, value: l };
        });
      },
      async getMonitorConfig() {
        let data = {};
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }
        this.metricsConfig = data.content || {};
        this.setLabelpairs(this.obj.labelpairs); // 此处确保配置项加载完后更新labelpairs列表
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
          this.containerItems = data.List.reduce((f1, f2) => {
            return Array.isArray(f1)
              ? f1.concat(
                  f2.spec.containers.map((c) => {
                    return c.name;
                  }),
                )
              : f1.spec.containers
                  .map((c) => {
                    return c.name;
                  })
                  .concat(
                    f2.spec.containers.map((c) => {
                      return c.name;
                    }),
                  );
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
