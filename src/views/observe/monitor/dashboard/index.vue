<template>
  <v-container
    fluid
    class="dash"
  >
    <BaseBreadcrumb
      class="dash__header"
    >
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect v-model="tenant" />
      </template>
    </BaseBreadcrumb>

    <v-card
      flat
    >
      <v-card-title
        id="monitor__dashboard"
        class="py-4"
      >
        <ProjectEnvSelect
          :tenant="tenant"
          @refreshEnvironemnt="refreshEnvironemnt"
        />
        <v-spacer />
        <BaseDatetimePicker
          v-model="date"
          :default-value="30"
          @change="onDatetimeChange(undefined)"
        />
        <v-menu
          v-if="environment && m_permisson_resourceAllow(environment.text)"
          :attach="`#monitor__dashboard`"
          left
        >
          <template #activator="{ on, attrs }">
            <v-btn
              text
              color="primary"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon small>
                fas fa-ellipsis-v
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  text
                  color="primary"
                  @click="addDashboard"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建监控大盘
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="primary"
                  @click="updateDashboard"
                >
                  <v-icon left>mdi-upload</v-icon>
                  更新监控大盘
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="removePanel"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除监控大盘
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text
        class="pa-0"
      >
        <v-tabs
          v-model="tab"
          height="40"
          class="rounded-t pl-4 pr-12 pb-2"
        >
          <v-tab
            v-for="item in items"
            :key="item.id"
          >
            {{ item.name }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <v-row
      v-if="items.length > 0"
      class="mt-0"
    >
      <v-col
        v-for="(graph, index) in items[tab].graphs"
        :key="index"
        :cols="3"
        class="dash__col"
      >
        <v-card
          class="kubegems__full-height"
          height="260"
        >
          <v-card-text class="pa-1 kubegems__full-height">
            <div class="dash__btn">
              <v-btn
                small
                icon
                @click.stop="openGraphInMaxScreen(graph)"
              >
                <v-icon
                  small
                  color="primary"
                >
                  mdi-magnify-plus
                </v-icon>
              </v-btn>
              <v-btn
                small
                icon
                @click.stop="updateGraph(graph, index)"
              >
                <v-icon
                  small
                  color="primary"
                >
                  mdi-upload
                </v-icon>
              </v-btn>
              <v-btn
                small
                icon
                @click.stop="removeGraph(graph, index)"
              >
                <v-icon
                  small
                  color="error"
                >
                  mdi-minus-box
                </v-icon>
              </v-btn>
            </div>
            <BaseApexAreaChart
              :id="`c${index}`"
              :title="graph.name"
              :metrics="metrics[`c${index}`]"
              :unit="graph.promqlGenerator?graph.promqlGenerator.unit:graph.unit"
              label="pod"
              type=""
              :label-show="false"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
              :extend-height="240"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card
          class="kubegems__full-height"
          min-height="200"
        >
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item
              three-line
              class="kubegems__full-height"
            >
              <v-list-item-content>
                <v-btn
                  text
                  block
                  color="primary"
                  class="text-h6"
                  @click="addGraph"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  添加图表
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div
      v-else
      class="text-h6 text-center dash__tip primary--text white"
    >
      <span class="kubegems__full-center">请先创建监控大盘</span>
    </div>

    <AddDashboard
      ref="addDashboard"
      :environment="environment"
      @refresh="dashboardList"
    />
    <UpdateDashboard
      ref="updateDashboard"
      :environment="environment"
      @refresh="dashboardList"
    />
    <GraphMax
      ref="graphMax"
      :environment="environment"
    />
    <AddGraph
      ref="addGraph"
      :environment="environment"
      :dashboard="items.length>0?items[tab]:null"
      @refresh="dashboardList"
    />
    <UpdateGraph
      ref="updateGraph"
      :environment="environment"
      :dashboard="items.length>0?items[tab]:null"
      @refresh="dashboardList"
    />
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  getMonitorDashboardList,
  getMetricsQueryrange,
  deleteMonitorDashboard,
  putUpdateMonitorDashboard,
  getSystemConfigData,
  getMyConfigData,
} from '@/api'
import AddDashboard from './components/AddDashboard'
import UpdateDashboard from './components/UpdateDashboard'
import AddGraph from './components/AddGraph'
import UpdateGraph from './components/UpdateGraph'
import TenantSelect from '../../components/TenantSelect'
import ProjectEnvSelect from './components/ProjectEnvSelect'
import GraphMax from './components/GraphMax'
import BasePermission from '@/mixins/permission'

export default {
  name: 'MonitorDashboard',
  components: {
    TenantSelect,
    ProjectEnvSelect,
    AddDashboard,
    UpdateDashboard,
    GraphMax,
    AddGraph,
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
    }
  },
  computed: {
    ...mapState(['AdminViewport', 'Scale']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.tenant = this.Tenant()
      }
    })
  },
  destroyed() {
    this.clearInterval()
  },
  methods: {
    async loadMetrics() {
      this.clearInterval()
      await this.getMonitorConfig()
      this.dashboardList()
      this.timeinterval = setInterval(() => {
        this.params.start = this.$moment(this.params.start)
          .utc()
          .add(30, 'seconds')
          .format()
        this.params.end = this.$moment(this.params.end)
          .utc()
          .add(30, 'seconds')
          .format()
        this.dashboardList(true)
      }, 1000 * 30)
    },
    clearInterval() {
      if (this.timeinterval) clearInterval(this.timeinterval)
    },
    async dashboardList(noprocess = false) {
      const data = await getMonitorDashboardList(
        this.environment.value,
        { noprocessing: noprocess },
      )
      this.items = data
      this.metrics = {}
      if (this.items?.length > 0 && this.items[this.tab].graphs) {
        this.items[this.tab].graphs.forEach((item, index) => {
          this.getMetrics(item, index)
        })
      }
    },
    getNamespace(item) {
      const namespace = item.promqlGenerator
      ? this.resourceNamespaced[item.promqlGenerator.resource]
      ? this.environment.namespace
      : '_all'
      : this.environment.namespace
      return namespace
    },
    async getMetrics(item, index) {
      const params = item.promqlGenerator ? item.promqlGenerator : {
        expr: item.expr,
      }
      const namespace = this.getNamespace(item)
      const data = await getMetricsQueryrange(
        this.environment.clusterName,
        namespace,
        Object.assign(params, {noprocessing: true, ...this.params}),
      )
      this.$set(this.metrics, `c${index}`, data)
    },
    refreshEnvironemnt(env) {
      this.environment = env
      this.loadMetrics()
    },
    addDashboard() {
      this.$refs.addDashboard.open()
    },
    addGraph() {
      this.$refs.addGraph.open()
    },
    updateDashboard() {
      if (this.items?.length > 0) {
        this.$refs.updateDashboard.init(this.items[this.tab])
        this.$refs.updateDashboard.open()
      }
    },
    updateGraph(item, index) {
      this.$refs.updateGraph.init(item, index)
      this.$refs.updateGraph.open()
    },
    openGraphInMaxScreen(graph) {
      const namespace = this.getNamespace(graph)
      this.$refs.graphMax.init(graph, namespace)
      this.$refs.graphMax.open()
    },
    removePanel() {
      const item = this.items[this.tab]
      this.$store.commit('SET_CONFIRM', {
        title: `删除监控大盘`,
        content: {
          text: `删除监控大盘 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteMonitorDashboard(
            this.environment.value,
            param.item.id,
          )
          this.loadMetrics()
        },
      })
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
          const dashboard = this.items[this.tab]
          this.$delete(this.items[this.tab].graphs, param.index)
          await putUpdateMonitorDashboard(
            this.environment.value,
            dashboard.id,
            dashboard,
          )
          this.loadMetrics()
        },
      })
    },
    async getMonitorConfig() {
      let data = {}
      if (this.AdminViewport) {
        data = await getSystemConfigData('Monitor')
      } else {
        data = await getMyConfigData('Monitor')
      }
      this.resourceNamespaced = {}
      const resources = data.content?.resources
      if (!resources) return
      Object.keys(resources).forEach(r => {
        this.resourceNamespaced[r] = resources[r].namespaced
      })
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[1]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>

<style lang="scss" scoped>
.dash {
  &__tip {
    height: 460px;
    position: relative;
  }

  &__col {
    position: relative;
  }

  &__btn {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 1;
  }
}
</style>
