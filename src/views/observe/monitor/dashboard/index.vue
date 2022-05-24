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
      <v-card-title class="py-4">
        <ProjectEnvSelect @refreshEnvironemnt="refreshEnvironemnt" />
      </v-card-title>

      <v-card-text
        id="monitor__dashboard"
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
        <v-menu
          v-if="environment && m_permisson_resourceAllow(environment.text)"
          :attach="`#monitor__dashboard`"
          left
        >
          <template #activator="{ on, attrs }">
            <v-btn
              class="dash__menu"
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
      </v-card-text>
    </v-card>

    <v-row
      v-if="items.length > 0"
      class="mt-2"
    >
      <v-col
        v-for="(graph, index) in items[tab].graphs"
        :key="index"
        cols="3"
        class="dash__col"
      >
        <v-card
          class="kubegems__full-height"
        >
          <v-card-text class="pa-1 kubegems__full-height">
            <div class="dash__btn">
              <v-btn
                small
                icon
                @click.stop="updateGraph(graph)"
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
                @click.stop="openGraphInMaxScreen(graph)"
              >
                <v-icon
                  small
                  color="primary"
                >
                  mdi-magnify-plus
                </v-icon>
                <v-btn
                  small
                  icon
                  @click.stop="removeGraph(graph)"
                >
                  <v-icon
                    small
                    color="error"
                  >
                    mdi-minus
                  </v-icon>
                </v-btn>
              </v-btn>
            </div>
            <BaseApexAreaChart
              :id="`c${index}`"
              :title="graph.name"
              :metrics="metrics[`c${index}`]"
              label="pod"
              type=""
              :label-show="false"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card
          class="kubegems__full-height"
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
                  添加面板
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
    <AddGraph ref="addGraph" />
    <UpdateGraph ref="updateGraph" />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getMonitorDashboardList,
  getMetricsQueryrange,
  deleteMonitorDashboard,
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
    }
  },
  computed: {
    ...mapState(['AdminViewport', 'Scale']),
  },
  mounted() {

  },
  methods: {
    async dashboardList() {
      const data = await getMonitorDashboardList(this.environment.value)
      this.items = data
      this.metrics = {}
      if (this.items?.length > 0 && this.items[this.tab].graphs) {
        this.items[this.tab].graphs.forEach((item, index) => {
          this.getMetrics(item, index)
        })
      }
    },
    async getMetrics(item, index) {
      const params = item.promqlGenerator ? item.promqlGenerator : {
        expr: item.expr,
      }
      const data = await getMetricsQueryrange(
        this.environment.clusterName,
        this.environment.namespace,
        Object.assign(params, {noprocessing: true}),
      )
      this.$set(this.metrics, `c${index}`, data)
    },
    refreshEnvironemnt(env) {
      this.environment = env
      this.dashboardList()
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
    updateGraph(item) {
      this.$refs.updateGraph.init(item)
      this.$refs.updateGraph.open()
    },
    openGraphInMaxScreen(graph) {
      this.$refs.graphMax.init(graph)
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
          this.dashboardList()
        },
      })
    },
    removeGraph(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除监控面板`,
        content: {
          text: `删除监控面板 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteMonitorDashboard(
            this.environment.value,
            param.item.id,
          )
          this.dashboardList()
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.dash {
  &__menu {
    position: absolute;
    right: 16px;
    top: 16px;
  }

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
    z-index: 10;
  }
}
</style>
