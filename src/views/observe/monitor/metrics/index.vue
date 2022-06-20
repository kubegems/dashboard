<template>
  <v-container class="queryer" fluid>
    <BaseBreadcrumb class="queryer__header">
      <template #extend>
        <div class="kubegems__full-right">
          <ButtonInput v-model="step" class="mr-2" empty-value-placeholder="auto" label="Step:">
            <v-combobox
              v-model="step"
              dense
              flat
              hide-details
              :items="['auto']"
              placeholder="Step"
              :rules="fieldRules.step"
              solo
              :style="{ width: '110px' }"
              @change="_handleRefresh(undefined)"
            />
          </ButtonInput>

          <BaseDatetimePicker
            ref="baseDatetimePicker"
            v-model="date"
            :default-value="30"
            @change="onRefresh(undefined)"
          />
          <v-btn color="primary" small text @click="onRefresh(undefined)">
            <v-icon left small> fas fa-redo </v-icon>
            刷新
          </v-btn>
        </div>
      </template>
    </BaseBreadcrumb>

    <div class="queryer__main">
      <div class="queryer__main-box">
        <div class="queryer__main-inner">
          <v-expansion-panels v-model="expand" accordion class="queryer__panel">
            <v-expansion-panel v-for="(item, index) in queryList" :key="item._$id">
              <!-- panel-header -->
              <v-expansion-panel-header disable-icon-rotate>
                <div>
                  <v-btn class="mr-2" color="primary" depressed x-small>
                    {{ index + 1 }}
                  </v-btn>
                  <v-btn v-if="item.resource" class="mr-2" color="success" depressed x-small>
                    {{ item.resource.showName }}
                  </v-btn>
                  <v-btn v-if="item.rule" color="success" depressed x-small>
                    {{ item.rule.showName }}
                  </v-btn>
                </div>
                <template #actions>
                  <v-icon v-if="metricsObject[item._$id]" color="success"> mdi-check </v-icon>
                  <v-icon v-else>mdi-alert-circle</v-icon>
                </template>
              </v-expansion-panel-header>
              <!-- panel-header -->

              <!-- panel-content -->
              <v-expansion-panel-content>
                <v-form :ref="`${item._$id}-form`" lazy-validation @submit.prevent>
                  <!-- 项目环境 -->
                  <BaseSubTitle class="mb-3" :title="queryList[index].isCluster ? '集群' : '项目环境'">
                    <template #action>
                      <v-switch
                        v-if="AdminViewport"
                        v-model="queryList[index].isCluster"
                        class="ma-0 px-2 ml-2 mt-0"
                        color="primary"
                        hide-details
                        style="margin-top: 2px !important"
                        @change="onLatitudeChange(index)"
                      >
                        <template #label>
                          <span class="text-body-2 font-weight-medium">
                            {{ !queryList[index].isCluster ? '集群维度' : '项目环境维度' }}
                          </span>
                        </template>
                      </v-switch>
                    </template>
                  </BaseSubTitle>
                  <v-row>
                    <template v-if="queryList[index].isCluster">
                      <v-col :cols="12">
                        <v-autocomplete
                          v-model="queryList[index].cluster"
                          class="px-2"
                          dense
                          flat
                          item-text="text"
                          item-value="value"
                          :items="m_select_clusterItems"
                          label="集群"
                          no-data-text="暂无可选数据"
                          return-object
                          :rules="fieldRules.required"
                          solo
                          @change="onClusterChange(index)"
                        >
                          <template #selection="{ item }">
                            <v-chip color="primary" label small>
                              <span>{{ item.text }}</span>
                            </v-chip>
                          </template>
                        </v-autocomplete>
                      </v-col>
                    </template>

                    <template v-else>
                      <v-col :cols="12">
                        <v-autocomplete
                          v-model="queryList[index].project"
                          class="px-2"
                          dense
                          flat
                          item-text="text"
                          item-value="value"
                          :items="queryList[index].projectItems"
                          label="项目"
                          no-data-text="暂无可选数据"
                          return-object
                          :rules="fieldRules.required"
                          solo
                          @change="onProjectChange(index)"
                        >
                          <template #selection="{ item }">
                            <v-chip color="primary" label small>
                              <span>{{ item.text }}</span>
                            </v-chip>
                          </template>
                        </v-autocomplete>

                        <v-autocomplete
                          v-model="queryList[index].environment"
                          class="px-2"
                          dense
                          :disabled="!queryList[index].project"
                          flat
                          item-text="EnvironmentName"
                          item-value="ID"
                          :items="queryList[index].environmentItems"
                          label="环境"
                          no-data-text="暂无可选数据"
                          return-object
                          :rules="fieldRules.required"
                          solo
                          @change="onEnvironmentChange(index)"
                        >
                          <template #selection="{ item }">
                            <v-chip color="primary" label small>
                              <span>{{ item.EnvironmentName }}</span>
                            </v-chip>
                          </template>
                        </v-autocomplete>
                      </v-col>
                    </template>
                  </v-row>
                  <!-- 项目环境 -->

                  <!-- 资源规则 -->
                  <BaseSubTitle class="mb-3" title="资源规则">
                    <template #action>
                      <v-switch
                        v-model="queryList[index].ql"
                        class="ma-0 px-2 ml-2 mt-0"
                        color="primary"
                        hide-details
                        style="margin-top: 2px !important"
                      >
                        <template #label>
                          <span class="text-body-2 font-weight-medium"> PromQl </span>
                        </template>
                      </v-switch>
                    </template>
                  </BaseSubTitle>

                  <template v-if="queryList[index].ql">
                    <v-textarea
                      v-model="queryList[index].expr"
                      auto-grow
                      class="px-2"
                      dense
                      flat
                      label="查询语句"
                      :rules="fieldRules.required"
                      solo
                    />
                    <MetricsSuggestion
                      :cluster="
                        queryList[index].environment
                          ? queryList[index].environment.Cluster.ClusterName
                          : queryList[index].cluster
                          ? queryList[index].cluster.text
                          : undefined
                      "
                      :expr="queryList[index].expr"
                      :index="index"
                      @insertMetrics="insertMetrics"
                    />
                  </template>

                  <template v-else>
                    <v-autocomplete
                      v-model="queryList[index].resource"
                      class="px-2"
                      dense
                      flat
                      item-text="showName"
                      item-value="_$value"
                      :items="queryList[index].resourceItems"
                      label="资源"
                      no-data-text="暂无可选数据"
                      return-object
                      :rules="fieldRules.required"
                      solo
                      @change="setRuleItems(index)"
                    >
                      <template #selection="{ item }">
                        <v-chip color="primary" label small>
                          <span>{{ item.showName }}</span>
                        </v-chip>
                      </template>
                    </v-autocomplete>

                    <v-autocomplete
                      v-model="queryList[index].rule"
                      class="px-2"
                      dense
                      :disabled="!queryList[index].resource"
                      flat
                      item-text="showName"
                      item-value="_$value"
                      :items="queryList[index].ruleItems"
                      label="规则"
                      no-data-text="暂无可选数据"
                      return-object
                      :rules="fieldRules.required"
                      solo
                    >
                      <template #selection="{ item }">
                        <v-chip color="primary" label small>
                          <span>{{ item.showName }}</span>
                        </v-chip>
                      </template>
                    </v-autocomplete>

                    <v-autocomplete
                      v-model="queryList[index].unit"
                      class="px-2"
                      dense
                      flat
                      item-text="text"
                      :items="queryList[index].unitItems"
                      label="单位(回车可创建自定义单位)"
                      no-data-text="暂无可选数据"
                      :readonly="!queryList[index].ql"
                      return-object
                      :search-input.sync="queryList[index].unitText"
                      solo
                      @focus="setUnitItems(index)"
                      @keydown.enter="createUnit(index)"
                    >
                      <template #selection="{ item }">
                        <v-chip color="primary" label small>
                          <span>{{ item.text }}</span>
                        </v-chip>
                      </template>
                    </v-autocomplete>
                  </template>

                  <!-- 资源规则 -->

                  <!-- 查询 -->
                  <div class="queryer__panel-search">
                    <v-btn class="mr-4" depressed @click="onRemove(item._$id)"> 移除 </v-btn>
                    <v-btn color="primary" depressed @click="onSearch(item._$id)"> 查询 </v-btn>
                  </div>
                  <!-- 查询 -->
                </v-form>
              </v-expansion-panel-content>
              <!-- panel-content -->
            </v-expansion-panel>
          </v-expansion-panels>
          <v-row>
            <v-col :cols="6">
              <v-btn block class="mt-4" @click="onClean">
                <v-icon>mdi-redo</v-icon>
                重置
              </v-btn>
            </v-col>
            <v-col :cols="6">
              <v-btn block class="mt-4" color="primary" @click="onAddQuery">
                <v-icon>mdi-plus-box</v-icon>
                添加查询
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="queryer__main-box">
        <div class="queryer__main-inner">
          <transition-group name="scroll-x-reverse-transition">
            <MetricsItem
              v-for="item in metricsItems"
              :key="item._$value"
              class="mb-3"
              :data="item"
              :label-object="labelObject[item._$value]"
              :labelpairs="labelpairs[item._$value]"
              :title="item._$title"
              :unit="item._$unit"
              @alert="onAddAlert"
              @change="onLabelChange($event, item._$value)"
              @loadLabel="getLabelItems($event, item._$value)"
              @refresh="onRefresh(item._$value)"
            />
          </transition-group>
        </div>
      </div>
    </div>

    <AddPrometheusRule ref="addPrometheusRule" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ButtonInput from './components/ButtonInput';
  import MetricsItem from './components/MetricsItem';
  import MetricsSuggestion from './components/MetricsSuggestion';
  import {
    getSystemConfigData,
    getMyConfigData,
    getMetricsQueryrange,
    getProjectList,
    getProjectEnvironmentList,
    getMetricsLabelValues,
  } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';
  import { deepCopy, debounce } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import AddPrometheusRule from '@/views/observe/monitor/config/prometheusrule/components/AddPrometheusRule';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'MetricsIndex',
    components: {
      AddPrometheusRule,
      ButtonInput,
      MetricsItem,
      MetricsSuggestion,
    },
    mixins: [BasePermission, BaseSelect, Metrics],
    data() {
      this.fieldRules = {
        cluster: (index) => {
          return [
            (v) => {
              const query = this.queryList[index];
              return !!v || !!query.project || '集群和项目环境不能同时为空';
            },
          ];
        },
        required: [required],
        step: [(v) => !v || v.trim() === 'auto' || !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)'],
      };

      this.defaultParams = {
        _$id: `0-${Date.now()}`,
        cluster: undefined,
        namespace: undefined,
        resource: undefined,
        project: undefined,
        environment: undefined,
        rule: undefined,
        unit: undefined,
        labelpairs: undefined,
        expr: undefined,
        projectItems: [],
        environmentItems: [],
        resourceItems: [],
        ruleItems: [],
        unitItems: [],
        unitText: '',
        _$origin: undefined,
        ql: false,
        isCluster: false,
      };

      this._handleRefresh = debounce(this.onRefresh, 500);

      return {
        expand: 0,
        queryList: [{ ...this.defaultParams }],
        date: [],
        step: 'auto',
        allProjectList: [],
        config: {},
        labelObject: {},
        metricsObject: {},
        labelpairs: {},
        isMounted: true,
        missingPlugins: [],
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport', 'Scale']),
      metricsItems() {
        return Object.keys(this.metricsObject).map((id) => {
          const index = this.queryList.findIndex((item) => item._$id === id);
          const query = this.queryList[index];
          return {
            _$value: id,
            _$index: index,
            _$unit: query._$origin?.unit?.value || ``,
            _$title: query._$origin?.resource
              ? `${index + 1}-${query._$origin?.resource.showName}-${query._$origin?.rule.showName}`
              : `${index + 1}-${query._$origin.expr}`,
            _$origin: query._$origin,
            data: this.metricsObject[id],
          };
        });
      },
    },
    mounted() {
      if (this.AdminViewport) {
        this.m_select_clusterSelectData();
      }
      this.getMonitorConfig();
      this.getProjectList();
      this.isMounted = false;
    },
    methods: {
      formatObject2Array(obj) {
        return Object.keys(obj || {}).map((key) => ({
          _$value: key,
          ...obj[key],
        }));
      },
      onClean() {
        this.queryList = [{ ...this.defaultParams }];
        this.labelObject = {};
        this.labelpairs = {};
        this.metricsObject = {};
        this.expand = 0;
      },
      onAddQuery() {
        this.queryList.push({
          ...this.defaultParams,
          projectItems: this.allProjectList,
          _$id: `${this.queryList.length}-${Date.now()}`,
        });
        this.onLatitudeChange(this.queryList.length - 1);
        this.expand = this.queryList.length - 1;
      },
      onRemove(id) {
        this.queryList = this.queryList.filter((item) => item._$id !== id);
        this.expand = 0;
        this.$delete(this.labelObject, id);
        this.$delete(this.labelpairs, id);
        this.$delete(this.metricsObject, id);
      },
      onAddAlert(data) {
        this.$refs.addPrometheusRule.open();
        this.$refs.addPrometheusRule.init(data);
      },
      // 设置各项独立的ruleItems
      setRuleItems(index) {
        const params = this.queryList[index];
        let items = [];
        if (params.resource) {
          const rulesObj = this.config.resources?.[params.resource._$value]?.rules || {};
          items = this.formatObject2Array(rulesObj);
        }
        this.$set(this.queryList[index], 'rule', undefined);
        this.$set(this.queryList[index], 'ruleItems', items);
      },
      // 设置各项独立的unitItems
      setUnitItems(index, custom = false) {
        const items = [];
        Object.keys(this.m_metrics_units).forEach((unit) =>
          this.m_metrics_units[unit].value.forEach((u) => {
            if (unit === 'short') {
              items.push({
                text: `${this.m_metrics_units[unit].cn}`,
                value: `${unit}`,
              });
            } else {
              items.push({
                text: `${this.m_metrics_units[unit].cn}/${u}`,
                value: `${unit}-${u}`,
              });
            }
          }),
        );
        this.$set(this.queryList[index], 'unitItems', items);
        if (custom) {
          this.$set(this.queryList[index], 'unit', items[items.length - 1]);
        }
      },
      // 获取格式化后的params
      getParams(params) {
        let newParams = {
          cluster: params.cluster?.text || params.environment?.Cluster.ClusterName,
          namespace: params.environment?.Namespace || '_all',
          start: this.$moment(this.date[0]).utc().format(),
          end: this.$moment(this.date[1]).utc().format(),
          step: this.step === 'auto' ? null : this.step,
        };

        if (params.ql) {
          newParams = Object.assign(newParams, {
            expr: params.expr,
          });
        } else {
          newParams = Object.assign(newParams, {
            resource: params.resource._$value,
            rule: params.rule._$value,
            unit: params.unit?.value || null,
          });
        }

        // 设置labelpairs值
        const labelpairs = this.labelpairs[params._$id];
        for (const key in labelpairs) {
          if (labelpairs[key] && labelpairs[key].length) {
            newParams[`labelpairs[${key}]`] = labelpairs[key].reduce(
              (pre, current, index, arr) => pre + current + `${index === arr.length - 1 ? '' : '|'}`,
              '',
            );
          }
        }

        return newParams;
      },
      // 设置labelObject
      setLabelObject(query) {
        const data = {};
        const labels = query.rule?.labels || [];
        labels.forEach((label) => {
          data[label] = {
            text: label,
            items: [],
            request: false,
          };
        });
        this.$set(this.labelpairs, query._$id, {}); // 清空图表选中值
        this.$set(this.labelObject, query._$id, data);
      },
      // 设置label查询值
      onLabelChange(data, id) {
        this.$set(this.labelpairs[id], data.label, data.value);
        this.onSearch(id, false);
      },
      onLatitudeChange(index) {
        const query = this.queryList[index];
        const items = this.formatObject2Array(this.config.resources || {}).filter(
          (item) => query.isCluster || item.namespaced,
        );
        this.$set(query, 'resourceItems', items);
      },
      onClusterChange(index) {
        const query = this.queryList[index];
        const items = query.cluster
          ? this.allProjectList.filter((pro) => pro.environments.some((env) => env.ClusterID === query.cluster.value))
          : this.allProjectList;
        this.$set(query, 'projectItems', items);
        this.$set(query, 'project', undefined);
        this.$set(query, 'environment', undefined);

        this.pluginsPass(query.cluster?.text);
      },
      async onProjectChange(index) {
        const query = this.queryList[index];
        let envItems = [];
        if (query.project) {
          const data = await getProjectEnvironmentList(query.project.value, {
            noprocessing: true,
          });
          envItems = query.cluster ? data.List.filter((pro) => pro.ClusterID === query.cluster.value) : data.List;
        }
        this.$set(query, 'environment', undefined);
        this.$set(query, 'environmentItems', envItems);
      },
      onEnvironmentChange(index) {
        const query = this.queryList[index];
        this.pluginsPass(query.environment?.Cluster.ClusterName);
      },
      async getMonitorConfig() {
        let data = null;
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }

        this.config = data?.content || {};
        this.onLatitudeChange(0);
      },
      async getProjectList() {
        const data = await getProjectList(this.Tenant().ID, { noprocessing: true });
        this.allProjectList = data.List.map((item) => ({
          value: item.ID,
          text: item.ProjectName,
          environments: item.Environments,
        }));
        this.onClusterChange(0);
      },
      async getLabelItems(label, id) {
        if (this.labelObject[id][label]?.request) return;
        const query = this.queryList.find((item) => item._$id === id);
        if (query) {
          const params = this.getParams(query);
          params.label = label;
          const data = await getMetricsLabelValues(
            params.cluster,
            params.namespace,
            Object.assign(params, { noprocessing: true }),
          );
          this.$set(this.labelObject[id][label], 'items', data);
          this.$set(this.labelObject[id][label], 'request', true);
        }
      },
      async onSearch(id, reset = true) {
        const form = `${id}-form`;
        if (this.$refs[form][0].validate(true)) {
          this.$refs.baseDatetimePicker.refresh(false);
          const query = this.queryList.find((item) => item._$id === id);
          // 重置labelpairs
          reset && this.setLabelObject(query);
          const params = this.getParams(query);
          if (!params.cluster || !params.namespace) {
            this.$store.commit('SET_SNACKBAR', {
              text: '请选择项目环境',
              color: 'warning',
            });
            return;
          }
          let data = await getMetricsQueryrange(params.cluster, params.namespace, params);
          if (data?.length > 30) {
            this.$store.commit('SET_SNACKBAR', {
              text: '结果数量过多，截取30条',
              color: 'warning',
            });
            data = data.slice(0, 30);
          }
          const origin = deepCopy(query);
          delete origin._$origin;

          this.$set(query, '_$origin', origin);
          this.$set(this.metricsObject, id, data);
          this.$set(this.labelpairs, id, this.labelpairs[id] || {});
        }
      },
      async onRefresh(id) {
        const ids = id ? [id] : this.queryList.map((item) => item._$id);
        await Promise.all(ids.map((i) => this.onSearch(i)));
      },
      insertMetrics(metrics, index) {
        const query = this.queryList[index];
        this.$set(query, 'expr', metrics);
      },
      createUnit(index) {
        const query = this.queryList[index];
        if (!query.unitText) return;
        if (
          !query.unitItems.some((u) => {
            return u.value === query.unitText;
          })
        ) {
          this.$set(this.m_metrics_units, 'custom', {
            cn: '自定义',
            value: [query.unitText],
          });
          this.setUnitItems(index, true);
        }
      },
      async pluginsPass(cluster) {
        if (!cluster) return;
        this.missingPlugins = await this.m_permission_plugin_pass(cluster, this.$route.meta?.dependencies || []);
        if (this.missingPlugins?.length === 0) {
          //
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: `该集群还未启用 ${this.missingPlugins.join(', ')} 插件！`,
            color: 'warning',
          });
          return;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .queryer {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__header {
      max-height: 64px;
    }

    &__main {
      display: flex;
      flex: 1;
      overflow: hidden;

      &-box {
        position: relative;
        height: 100%;

        &:nth-child(1) {
          max-width: 30%;
          min-width: 30%;
          margin-right: 12px;
        }
        &:nth-child(2) {
          flex: auto;
        }
      }

      &-inner {
        position: inherit;
        padding-bottom: 8px;
      }
    }

    &__panel {
      box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);

      &-search {
        text-align: right;
      }
    }
  }
</style>
