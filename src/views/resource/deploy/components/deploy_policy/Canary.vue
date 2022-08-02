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
  <BaseDialog v-model="dialog" icon="mdi-send" title="金丝雀部署" :width="1000" @reset="reset">
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
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="trafficRoutingItems"
                  label="流量路由"
                  no-data-text="暂无可选数据"
                  :rules="canaryRules.trafficRoutingRule"
                  @change="onTraffRoutingRuleChange"
                >
                  <template #selection="{ item }">
                    <v-chip class="mx-1" color="primary" small>
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col v-if="trafficRouting === 'default'" cols="6">
                <v-text-field
                  v-model="obj.strategy.canary.steps[0].setWeight"
                  class="my-0"
                  label="灰度流量比例"
                  required
                  :rules="canaryRules.setWeightRule"
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
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="canaryServiceItems"
                    label="灰度服务"
                    no-data-text="暂无可选数据"
                    :rules="canaryRules.canaryServiceRule"
                    :search-input.sync="canaryServiceText"
                    @change="onTrafficDataChange"
                    @keyup.enter="createCanaryService"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="obj.strategy.canary.stableService"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="stableServiceItems"
                    label="线上服务"
                    no-data-text="暂无可选数据"
                    :rules="canaryRules.stableServiceRule"
                    :search-input.sync="stableServiceText"
                    @change="onTrafficDataChange"
                    @keyup.enter="createStableService"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
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
            <v-tabs v-model="tab" class="px-2 mt-2 mb-3 rounded-t" height="30" @change="onTabChange">
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
              @expandCard="expandCard"
              @removeAnalysis="removeAnalysis"
              @updateAnalysis="updateAnalysis"
            />
          </v-card-text>
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="strategyDeployEnvironmentApps">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import AnalysisTemplateForm from './analysis_template/AnalysisTemplateForm';
  import AnalysisTemplateItem from './analysis_template/AnalysisTemplateItem';
  import BaseDeployInfoForm from './base/BaseDeployInfoForm';
  import DefaultTraffic from './traffic/DefaultTraffic';
  import HeaderTraffic from './traffic/HeaderTraffic';
  import UriTraffic from './traffic/UriTraffic';
  import { getAppResourceFileMetas, postStrategyDeployEnvironmentApps } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';
  import StrategyDeploy from '@/views/resource/deploy/mixins/deploy';

  export default {
    name: 'Canary',
    components: {
      AnalysisTemplateForm,
      AnalysisTemplateItem,
      BaseDeployInfoForm,
      DefaultTraffic,
      HeaderTraffic,
      UriTraffic,
    },
    mixins: [BaseResource, StrategyDeploy],
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
      open() {
        this.dialog = true;
      },
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
