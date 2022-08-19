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
  <v-container class="dash" fluid>
    <BaseBreadcrumb class="dash__header">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ContainerSelect :env="env" @filterPod="filterPod" />
          <ProjectEnvSelectCascade v-model="env" first :offset-y="4" reverse :tenant="tenant" />

          <BaseDatetimePicker v-model="date" :default-value="30" :offset-y="0" @change="onDatetimeChange(undefined)" />
          <v-menu
            v-if="
              environment &&
              m_permisson_resourceAllow(environment.text) &&
              missingPlugins &&
              missingPlugins.length === 0
            "
            left
          >
            <template #activator="{ on, attrs }">
              <v-btn color="primary" icon text v-bind="attrs" v-on="on">
                <v-icon> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" text @click="addDashboard">
                    <v-icon left>mdi-plus-box</v-icon>
                    创建监控大盘
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" text @click="updateDashboard">
                    <v-icon left>mdi-upload</v-icon>
                    更新监控大盘
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text @click="removePanel">
                    <v-icon left>mdi-minus-box</v-icon>
                    删除监控大盘
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <template v-if="items.length > 0">
      <v-card flat>
        <v-card-text class="pa-0 py-1">
          <v-tabs v-model="tab" class="rounded-t pl-4 py-2" height="35" @change="onTabChange">
            <v-tab v-for="item in items" :key="item.id">
              <BaseLogo class="mr-2" :icon-name="item.name" :ml="0" :mt="1" :width="20" />
              {{ item.name }}
            </v-tab>
          </v-tabs>
        </v-card-text>
      </v-card>

      <v-row class="mt-3 mb-1 pb-0">
        <v-col
          v-for="(graph, index) in items[tab] ? items[tab].graphs : []"
          :key="index"
          class="dash__col pt-0"
          :cols="4"
        >
          <v-card class="kubegems__full-height" flat height="330">
            <v-card-text class="pa-1 kubegems__full-height">
              <div class="dash__btn">
                <v-btn icon small @click.stop="openGraphInMaxScreen(graph)">
                  <v-icon color="primary" small> mdi-magnify-plus </v-icon>
                </v-btn>
                <v-btn icon small @click.stop="updateGraph(graph, index)">
                  <v-icon color="primary" small> mdi-pencil </v-icon>
                </v-btn>
                <v-btn icon small @click.stop="removeGraph(graph, index)">
                  <v-icon color="error" small> mdi-minus-box </v-icon>
                </v-btn>
              </div>
              <BaseApexAreaChart
                :id="`c${index}`"
                :key="`c${index}${tab}`"
                chart-type="line"
                :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
                colorful
                :extend-height="300"
                label="all"
                :label-show="false"
                :metrics="metrics[`c${index}`]"
                :no-data-offset-y="-18"
                single-tooptip
                :title="graph.name"
                type=""
                :unit="graph.promqlGenerator ? getUnit(graph.promqlGenerator.unit) : getUnit(graph.unit)"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col class="pt-0" cols="4">
          <v-card class="kubegems__full-height" flat min-height="330">
            <v-card-text class="pa-0 kubegems__full-height">
              <v-list-item class="kubegems__full-height" three-line>
                <v-list-item-content>
                  <v-btn block class="text-h6" color="primary" text @click="addGraph">
                    <v-icon left>mdi-plus-box</v-icon>
                    添加图表
                  </v-btn>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <div v-else class="text-center dash__tip primary--text white rounded">
      <span class="kubegems__full-center">请先创建监控大盘</span>
    </div>

    <AddDashboard ref="addDashboard" :environment="environment" @refresh="dashboardList" />
    <UpdateDashboard ref="updateDashboard" :environment="environment" @refresh="dashboardList" />
    <GraphMax ref="graphMax" :environment="environment" />
    <AddGraph
      ref="addGraph"
      :dashboard="items.length > 0 ? items[tab] : null"
      :environment="environment"
      @refresh="dashboardList"
    />
    <UpdateGraph
      ref="updateGraph"
      :dashboard="items.length > 0 ? items[tab] : null"
      :environment="environment"
      @refresh="dashboardList"
    />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddDashboard from './components/AddDashboard';
  import AddGraph from './components/AddGraph';
  import ContainerSelect from './components/ContainerSelect';
  import GraphMax from './components/GraphMax';
  import UpdateDashboard from './components/UpdateDashboard';
  import UpdateGraph from './components/UpdateGraph';
  import {
    deleteMonitorDashboard,
    getMetricsQueryrange,
    getMonitorDashboardList,
    getMyConfigData,
    getSystemConfigData,
    putUpdateMonitorDashboard,
  } from '@/api';
  import BasePermission from '@/mixins/permission';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'MonitorDashboard',
    components: {
      AddDashboard,
      AddGraph,
      ContainerSelect,
      GraphMax,
      ProjectEnvSelectCascade,
      UpdateDashboard,
      UpdateGraph,
    },
    mixins: [BasePermission],
    data() {
      return {
        tab: 0,
        tenant: null,
        items: [],
        metrics: {},
        environment: undefined,
        timeinterval: null,
        resourceNamespaced: {},
        date: [],
        params: {
          start: null,
          end: null,
        },
        missingPlugins: [],
        env: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'Scale']),
      ...mapGetters(['Tenant']),
    },
    watch: {
      env: {
        handler: async function (newValue) {
          if (newValue) {
            this.environment = newValue;
            this.missingPlugins = await this.m_permission_plugin_pass(
              newValue.clusterName,
              this.$route.meta?.dependencies || [],
            );
            if (this.missingPlugins?.length === 0) {
              this.dashboardList();
            } else {
              this.$store.commit('SET_SNACKBAR', {
                text: `该环境所在集群还未启用 ${this.missingPlugins.join(', ')} 插件！`,
                color: 'warning',
              });
              return;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: '暂未选择租户',
            color: 'warning',
          });
          return;
        }
        this.tenant = this.Tenant();
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
      });
    },
    destroyed() {
      this.clearInterval();
    },
    methods: {
      async loadMetrics(pod = null) {
        this.clearInterval();
        this.metrics = {};
        if (this.items?.length > 0 && this.items[this.tab] && this.items[this.tab].graphs) {
          this.items[this.tab].graphs.forEach((item, index) => {
            this.getMetrics(item, index, pod);
          });
        }
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          if (this.items?.length > 0 && this.items[this.tab] && this.items[this.tab].graphs) {
            this.items[this.tab].graphs.forEach((item, index) => {
              this.getMetrics(item, index, pod);
            });
          }
        }, 1000 * 30);
      },
      clearInterval() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
      async dashboardList(pod = null) {
        await this.getMonitorConfig();
        const data = await getMonitorDashboardList(this.environment.value);
        this.items = data;
        if (this.$route.query.tab) {
          const index = this.items.findIndex((i) => {
            return i.name === this.$route.query.tab;
          });
          this.tab = index > -1 ? index : 0;
        }
        this.loadMetrics(pod);
      },
      getNamespace(item) {
        const namespace = item.promqlGenerator
          ? this.resourceNamespaced[item.promqlGenerator.resource]
            ? this.environment.namespace
            : '_all'
          : this.environment.namespace;
        return namespace;
      },
      avg(arr = []) {
        if (arr?.length === 0) return 0;
        let sum = 0;
        arr.map((a) => {
          sum += a;
        });
        return sum / arr.length;
      },
      async getMetrics(item, index, pod = null) {
        const params = item.promqlGenerator
          ? item.promqlGenerator
          : {
              expr: item.expr,
            };
        const namespace = this.getNamespace(item);
        let data = await getMetricsQueryrange(
          this.environment.clusterName,
          namespace,
          Object.assign(params, { noprocessing: true, ...this.params }),
        );
        if (pod) {
          data = data.filter((d) => {
            return d.metric?.pod === pod;
          });
        }
        data = data.sort(
          (a, b) =>
            this.avg(
              b.values.map((d) => {
                return parseFloat(d[1]);
              }),
            ) -
            this.avg(
              a.values.map((d) => {
                return parseFloat(d[1]);
              }),
            ),
        );
        this.$set(this.metrics, `c${index}`, data);
      },
      async filterPod(pod) {
        this.dashboardList(pod.podName);
      },
      addDashboard() {
        this.$refs.addDashboard.open();
      },
      addGraph() {
        this.$refs.addGraph.open();
      },
      updateDashboard() {
        if (this.items?.length > 0) {
          this.$refs.updateDashboard.init(this.items[this.tab]);
          this.$refs.updateDashboard.open();
        }
      },
      updateGraph(item, index) {
        this.$refs.updateGraph.init(item, index);
        this.$refs.updateGraph.open();
      },
      openGraphInMaxScreen(graph) {
        const namespace = this.getNamespace(graph);
        this.$refs.graphMax.init(graph, namespace);
        this.$refs.graphMax.open();
      },
      removePanel() {
        const item = this.items[this.tab];
        this.$store.commit('SET_CONFIRM', {
          title: `删除监控大盘`,
          content: {
            text: `删除监控大盘 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteMonitorDashboard(this.environment.value, param.item.id);
            this.dashboardList();
          },
        });
      },
      removeGraph(item, index) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除监控图表`,
          content: {
            text: `删除监控图表 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { index },
          doFunc: async (param) => {
            const dashboard = this.items[this.tab];
            this.$delete(this.items[this.tab].graphs, param.index);
            await putUpdateMonitorDashboard(this.environment.value, dashboard.id, dashboard);
            this.dashboardList();
          },
        });
      },
      async getMonitorConfig() {
        let data = {};
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }
        this.resourceNamespaced = {};
        const resources = data.content?.resources;
        if (!resources) return;
        Object.keys(resources).forEach((r) => {
          this.resourceNamespaced[r] = resources[r].namespaced;
        });
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
      onTabChange() {
        this.loadMetrics();
        this.$router.replace({
          query: {
            tab: this.items[this.tab]?.name || null,
          },
        });
      },
      getUnit(unit) {
        if (unit === 'short') {
          return 'short';
        }
        if (unit && unit?.indexOf('-') > -1) {
          return unit.substr(unit.indexOf('-') + 1);
        }
        return unit;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dash {
    &__tip {
      height: 460px;
      position: relative;
      font-size: 1.2rem;
      font-weight: 600;
    }

    &__col {
      position: relative;
    }

    &__btn {
      position: absolute;
      right: 5px;
      top: 6px;
      z-index: 1;
    }
  }
</style>
