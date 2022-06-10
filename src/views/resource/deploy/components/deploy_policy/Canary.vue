<template>
  <BaseDialog v-model="dialog" :width="1000" title="金丝雀部署" icon="mdi-send" @reset="reset">
    <template #content>
      <v-flex>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-flex :class="expand ? 'kubegems__overlay' : ''" />
          <BaseDeployInfoForm ref="baseDeployInfoForm" :runtime="runtime" />

          <BaseSubTitle title="流量设置" />
          <v-card-text class="pa-2">
            <v-row>
              <v-col cols="6">
                <v-autocomplete
                  v-model="trafficRouting"
                  color="primary"
                  :items="trafficRoutingItems"
                  :rules="canaryRules.trafficRoutingRule"
                  label="流量路由"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  @change="onTraffRoutingRuleChange"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small class="mx-1">
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col v-if="trafficRouting === 'default'" cols="6">
                <v-text-field
                  v-model="obj.strategy.canary.steps[0].setWeight"
                  :rules="canaryRules.setWeightRule"
                  class="my-0"
                  required
                  label="灰度流量比例"
                  suffix="%"
                  type="number"
                />
              </v-col>
            </v-row>
            <template v-if="trafficRouting !== 'default'">
              <v-row>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="obj.strategy.canary.canaryService"
                    :rules="canaryRules.canaryServiceRule"
                    :items="canaryServiceItems"
                    color="primary"
                    label="灰度服务"
                    hide-selected
                    class="my-0"
                    no-data-text="暂无可选数据"
                    :search-input.sync="canaryServiceText"
                    @keyup.enter="createCanaryService"
                    @change="onTrafficDataChange"
                  >
                    <template #selection="{ item }">
                      <v-chip color="primary" small class="mx-1">
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="obj.strategy.canary.stableService"
                    :rules="canaryRules.stableServiceRule"
                    :items="stableServiceItems"
                    color="primary"
                    label="线上服务"
                    hide-selected
                    class="my-0"
                    no-data-text="暂无可选数据"
                    :search-input.sync="stableServiceText"
                    @keyup.enter="createStableService"
                    @change="onTrafficDataChange"
                  >
                    <template #selection="{ item }">
                      <v-chip color="primary" small class="mx-1">
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
            </template>
          </v-card-text>

          <template v-if="trafficRouting === 'istio'">
            <BaseSubTitle title="灰度配置" />
            <v-tabs v-model="tab" class="px-2 mt-2 v-tabs--default" height="40" fixed-tabs @change="onTabChange">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>

            <component
              :is="tabItems[tab].value"
              :ref="tabItems[tab].value"
              :data="runtime"
              @updateComponentData="updateComponentData"
            />
          </template>

          <AnalysisTemplateForm
            ref="analysisTemplateForm"
            :data="analysis"
            :service="obj.strategy.canary.canaryService"
            @addData="addAnalysisData"
            @closeOverlay="closeExpand"
          />
          <BaseSubTitle title="应用分析（需启用prometheus与istio）" />
          <v-card-text class="pa-2">
            <AnalysisTemplateItem
              ref="analysisTemplateItem"
              :obj="obj.strategy.canary.analysis"
              title="应用分析"
              @updateAnalysis="updateAnalysis"
              @removeAnalysis="removeAnalysis"
              @expandCard="expandCard"
            />
          </v-card-text>
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="strategyDeployEnvironmentApps">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { postStrategyDeployEnvironmentApps, getAppResourceFileMetas } from '@/api';
  import BaseDeployInfoForm from './base/BaseDeployInfoForm';
  import DefaultTraffic from './traffic/DefaultTraffic';
  import HeaderTraffic from './traffic/HeaderTraffic';
  import UriTraffic from './traffic/UriTraffic';
  import AnalysisTemplateItem from './analysis_template/AnalysisTemplateItem';
  import AnalysisTemplateForm from './analysis_template/AnalysisTemplateForm';
  import StrategyDeploy from '@/views/resource/deploy/mixins/deploy';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required, positiveInteger } from '@/utils/rules';

  export default {
    name: 'Canary',
    components: {
      AnalysisTemplateItem,
      AnalysisTemplateForm,
      BaseDeployInfoForm,
      DefaultTraffic,
      HeaderTraffic,
      UriTraffic,
    },
    mixins: [StrategyDeploy, BaseResource],
    data() {
      return {
        dialog: false,
        expand: false,
        valid: false,
        analysis: {},
        canaryServiceItems: [],
        canaryServiceText: '',
        stableServiceItems: [],
        stableServiceText: '',
        trafficRouting: 'default',
        trafficRoutingItems: [
          { text: '默认', value: 'default' },
          { text: 'istio网关', value: 'istio' },
        ],
        obj: {
          images: [],
          name: '',
          strategy: {
            canary: {
              analysis: {},
              steps: [
                {
                  setWeight: 10,
                },
              ],
              canaryService: '',
              stableService: '',
            },
            type: 'Canary',
          },
          istioVersion: '',
        },
        tab: 0,
        tabItems: [
          { text: '按流量灰度', value: 'DefaultTraffic' },
          { text: '按请求头灰度', value: 'HeaderTraffic' },
          { text: '按请求uri灰度', value: 'UriTraffic' },
        ],
      };
    },
    computed: {
      ...mapState(['Circular']),
      canaryRules() {
        const rule = {
          trafficRoutingRule: [required],
          setWeightRule: [positiveInteger],
        };
        if (this.trafficRouting !== 'default') {
          rule['canaryServiceRule'] = [required];
          rule['stableServiceRule'] = [required];
        }
        return rule;
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init() {
        await this.strategyDeployEnvironmentAppsDetail();
        if (this.runtime.strategy.type === 'Canary') {
          this.svcList();
          this.obj = deepCopy(this.runtime);
          if (this.obj.strategy.canary.trafficRouting && this.obj.strategy.canary.trafficRouting.istio) {
            this.trafficRouting = 'istio';
          }
        }
      },
      async strategyDeployEnvironmentApps() {
        if (
          this.$refs.baseDeployInfoForm.validate() &&
          this.$refs.form.validate(true) &&
          (!this.$refs[this.tabItems[this.tab].value] ||
            (this.$refs[this.tabItems[this.tab].value] && this.$refs[this.tabItems[this.tab].value].validate(true)))
        ) {
          this.obj = Object.assign(this.obj, this.$refs.baseDeployInfoForm.getData());
          await postStrategyDeployEnvironmentApps(
            this.Tenant().ID,
            this.Project().ID,
            this.Environment().ID,
            this.$route.params.name,
            this.m_resource_beautifyData(this.obj),
          );
          this.reset();
          // this.$emit('refresh')
          this.dialog = false;
          this.$router.push({
            name: 'app-detail',
            params: Object.assign(this.$route.params, { name: this.$route.params.name }),
            query: {
              projectid: this.Project().ID,
              tenantid: this.Tenant().ID,
              kind: 'app',
              namespace: this.Environment().Namespace,
              type: this.$route.query.type,
              tab: 1,
            },
          });
        }
      },
      updateComponentData(data) {
        this.obj = deepCopy(data);
      },
      async svcList() {
        let data = {};
        data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: 'Service',
          },
        );
        data.forEach((v) => {
          v.text = v.metadata.name;
          v.value = v.metadata.name;
        });
        this.canaryServiceItems = data;
        this.stableServiceItems = data;
      },
      createCanaryService() {
        if (
          !this.canaryServiceItems.find((v) => {
            return v.value === this.canaryServiceText;
          })
        ) {
          this.canaryServiceItems.push({
            text: this.canaryServiceText,
            value: this.canaryServiceText,
          });
        }
        this.obj.strategy.canary.canaryService = this.canaryServiceText;
        this.canaryServiceText = '';
      },
      createStableService() {
        if (
          !this.stableServiceItems.find((v) => {
            return v.value === this.stableServiceText;
          })
        ) {
          this.stableServiceItems.push({
            text: this.stableServiceText,
            value: this.stableServiceText,
          });
        }
        this.obj.strategy.canary.stableService = this.stableServiceText;
        this.stableServiceText = '';
      },
      onTraffRoutingRuleChange() {
        if (this.trafficRouting === 'default') {
          this.$delete(this.obj.strategy.canary, 'trafficRouting');
        } else if (this.trafficRouting === 'istio') {
          this.svcList();
          this.$set(this.obj.strategy.canary, 'trafficRouting', {
            istio: {
              virtualService: {
                uri: null,
                ignoreUriCase: null,
                headers: null,
              },
            },
          });
          this.obj.strategy.canary.canaryService = '';
          this.obj.strategy.canary.stableService = '';
          this.onTrafficDataChange();
        }
      },
      updateAnalysis() {
        this.analysis = deepCopy(this.obj.strategy.canary.analysis);
        this.$refs.analysisTemplateForm.expandCard();
      },
      removeAnalysis() {
        this.obj.strategy.canary.analysis = {};
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.analysisTemplateForm.expandCard();
          this.expand = true;
        });
      },
      addAnalysisData(data) {
        this.obj.strategy.canary.analysis = data;
        this.$refs.analysisTemplateForm.closeCard();
      },
      closeExpand() {
        this.expand = false;
      },
      onTrafficDataChange() {
        this.$nextTick(() => {
          this.$refs[this.tabItems[this.tab].value].init(this.obj);
        });
      },
      onTabChange() {
        if (this.tabItems[this.tab].value === 'DefaultTraffic') {
          this.obj.strategy.canary.trafficRouting.istio.virtualService.uri = null;
          this.obj.strategy.canary.trafficRouting.istio.virtualService.ignoreUriCase = null;
          this.obj.strategy.canary.trafficRouting.istio.virtualService.headers = null;
        } else if (this.tabItems[this.tab].value === 'UriTraffic') {
          this.obj.strategy.canary.trafficRouting.istio.virtualService.headers = null;
          this.obj.strategy.canary.trafficRouting.istio.virtualService.ignoreUriCase = 'true';
        } else if (this.tabItems[this.tab].value === 'HeaderTraffic') {
          this.obj.strategy.canary.trafficRouting.istio.virtualService.uri = null;
          this.obj.strategy.canary.trafficRouting.istio.virtualService.ignoreUriCase = null;
        }
        this.onTrafficDataChange();
      },
      reset() {
        this.$refs.analysisTemplateForm.reset();
        if (this.$refs[this.tabItems[this.tab].value]) {
          this.$refs[this.tabItems[this.tab].value].reset();
        }
        this.trafficRouting = 'default';
        this.tab = 0;
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
        this.$refs.baseDeployInfoForm.reset();
      },
    },
  };
</script>
