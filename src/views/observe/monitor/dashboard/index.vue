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
          class="rounded-t pl-4 pr-12"
        >
          <v-tab
            v-for="item in items"
            :key="item.id"
          >
            {{ item.name }}
          </v-tab>
        </v-tabs>
        <v-menu
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
                  @click="addPanel"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建监控大盘
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

        <v-row
          v-if="items.length > 0"
          class="mt-2 mx-4"
        >
          <v-col
            v-for="(graph, index) in items[tab].graphs"
            :key="index"
            cols="3"
          >
            <BaseApexAreaChart
              :id="`c${index}`"
              :title="graph.name"
              :metrics="metrics[`c${index}`]"
              :extend-height="280"
              label="pod"
              type=""
              :label-show="false"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
            />
          </v-col>
        </v-row>

        <div
          v-else
          class="text-h6 text-center dash__tip primary--text"
        >
          <span class="kubegems__full-center">请先创建监控大盘</span>
        </div>
      </v-card-text>
    </v-card>

    <AddPanel ref="addPanel" />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getMonitorDashboardList,
  getMetricsQueryrange,
  deleteMonitorDashboard,
} from '@/api'
import AddPanel from './components/AddPanel'
import TenantSelect from '../../components/TenantSelect'
import ProjectEnvSelect from './components/ProjectEnvSelect'

export default {
  name: 'MonitorDashboard',
  components: {
    TenantSelect,
    ProjectEnvSelect,
    AddPanel,
  },
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
      if (this.items[this.tab].graphs) {
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
      // this.dashboardList()
    },
    addPanel() {
      this.$refs.addPanel.open()
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
            this.environmentId,
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
}
</style>
