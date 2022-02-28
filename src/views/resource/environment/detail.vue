<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <template v-if="projectAllow">
            <v-btn
              text
              small
              class="primary--text"
              @click="scaleResource"
            >
              <v-icon
                left
                small
              >
                mdi-scale
              </v-icon>
              调整资源限制
            </v-btn>
            <v-btn
              text
              small
              class="primary--text"
              @click="manageUser"
            >
              <v-icon
                left
                small
              >
                mdi-account-settings
              </v-icon>
              环境成员
            </v-btn>
            <v-btn
              text
              small
              class="primary--text"
              @click="resourceUsage"
            >
              <v-icon
                left
                small
              >
                mdi-view-list
              </v-icon>
              资源使用清单
            </v-btn>
            <v-menu left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon
                    x-small
                    color="primary"
                    v-on="on"
                  >
                    fas fa-ellipsis-v
                  </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn
                      color="primary"
                      text
                      small
                      @click="updateEnvironment"
                    >
                      编辑
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn
                      color="error"
                      text
                      small
                      @click="removeEnvironment"
                    >
                      删除
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-row class="my-3">
      <v-col
        cols="9"
        class="py-0"
      >
        <v-card>
          <BaseSubTitle
            title="资源分配"
            :divider="false"
          />
          <v-card-text
            :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          >
            <v-row>
              <v-col
                cols="3"
                class="py-0"
              >
                <VueApexCharts
                  type="radialBar"
                  height="250"
                  :options="cpuOptions"
                  :series="cpuSeries"
                />
              </v-col>
              <v-col
                cols="3"
                class="py-0"
              >
                <VueApexCharts
                  type="radialBar"
                  height="250"
                  :options="memoryOptions"
                  :series="memorySeries"
                />
              </v-col>
              <v-col
                cols="3"
                class="py-0"
              >
                <VueApexCharts
                  type="radialBar"
                  height="250"
                  :options="storageOptions"
                  :series="storageSeries"
                />
              </v-col>
              <v-col
                cols="3"
                class="py-0"
              >
                <VueApexCharts
                  type="radialBar"
                  height="250"
                  :options="podOptions"
                  :series="podSeries"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <ResourceMonitor :ready="ready" />
      </v-col>

      <v-col
        cols="3"
        class="py-0"
      >
        <v-card>
          <BaseSubTitle
            title="过去一天资源使用排名"
            :divider="false"
          >
            <template #selector>
              <v-sheet class="text-body-2 text--darken-1">
                <v-menu
                  v-model="topMenu"
                  bottom
                  left
                  offset-y
                  origin="top center"
                  transition="scale-transition"
                  nudge-bottom="5px"
                >
                  <template #activator="{ on }">
                    <v-btn
                      depressed
                      color="white"
                      class="primary--text font-weight-medium"
                      small
                      dark
                      v-on="on"
                    >
                      {{ podUsedModeCN }}
                      <v-icon
                        v-if="topMenu"
                        right
                      >
                        fas fa-angle-up
                      </v-icon>
                      <v-icon
                        v-else
                        right
                      >
                        fas fa-angle-down
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-data-iterator
                    :items="[
                      { text: '排序', values: environmentPodUsageSelect },
                    ]"
                    hide-default-footer
                  >
                    <template #no-data>
                      <v-card>
                        <v-card-text> 暂无资源 </v-card-text>
                      </v-card>
                    </template>
                    <template #default="props">
                      <v-card
                        v-for="item in props.items"
                        :key="item.text"
                      >
                        <v-list dense>
                          <v-list-item
                            v-for="(select, index) in item.values"
                            :key="index"
                            class="text-body-2 text-center"
                            link
                            :style="
                              select.value === podUsageMode
                                ? `color: #1e88e5 !important;`
                                : ``
                            "
                            @click="setPodUsageMode(select)"
                          >
                            <v-list-item-content>
                              <span>{{ select.text }}</span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-menu>
              </v-sheet>
            </template>
          </BaseSubTitle>
          <v-card-text>
            <v-flex
              v-if="topN.length === 0"
              class="text-subtitle-1 text-center"
            >
              暂无数据
            </v-flex>
            <v-flex
              v-for="(item, index) in topN"
              :key="index"
              class="text-body-2 mt-3 mb-3"
            >
              <v-flex
                class="float-left"
                style="width: 80%;"
              >
                {{ item.metric.pod }}
              </v-flex>
              <span
                class="float-right text-body-2 primary--text font-weight-medium"
              >
                <span v-if="podUsageMode.indexOf('cpu') > -1">
                  {{
                    beautifyCpuUnit(
                      sizeOfCpu(parseFloat(item.value[1]), 'n') *
                        1000 *
                        1000 *
                        1000,
                    )
                  }}
                </span>
                <span v-else>
                  {{
                    beautifyStorageUnit(
                      sizeOfStorage(parseInt(item.value[1]), 'B'),
                    )
                  }}
                </span>
              </span>
              <v-flex class="kubegems__clear-float" />
              <v-divider class="my-3" />
            </v-flex>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ScaleResource
      ref="scaleResource"
      @refresh="environmentDetail"
    />
    <ManageUser ref="manageUser" />
    <UpdateEnvironment
      ref="updateEnvironment"
      @refresh="environmentDetail"
    />
    <ResourceUseList
      ref="resourceUseList"
      type="env"
      title="环境资源使用清单"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getEnvironmentQuota,
  deleteEnvironment,
  getEnvironmentDetail,
  vector,
} from '@/api'
import ResourceMonitor from './components/ResourceMonitor'
import ResourceUseList from './components/ResourceUseList'
import UpdateEnvironment from './components/UpdateEnvironment'
import ScaleResource from './components/ScaleResource'
import ManageUser from './components/ManageUser'
import VueApexCharts from 'vue-apexcharts'
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'
import BaseResource from '@/mixins/resource'
import { generateRadialBarChartOptions } from '@/utils/chart'
import {
  sizeOfCpu,
  sizeOfStorage,
  beautifyCpuUnit,
  beautifyStorageUnit,
} from '@/utils/helpers'
import {
  TOP_20_POD_CPU_AVG_PROMQL,
  TOP_20_POD_CPU_MAX_PROMQL,
  TOP_20_POD_MEMORY_AVG_PROMQL,
  TOP_20_POD_MEMORY_MAX_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'EnvironmentDetail',
  components: {
    VueApexCharts,
    ScaleResource,
    ManageUser,
    UpdateEnvironment,
    ResourceMonitor,
    ResourceUseList,
  },
  mixins: [BaseSelect, BasePermission, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '环境资源',
      tip: '环境(environment)是具体应用，负载，存储等资源的边界，通常来说是一个命名空间(namespace)。',
      icon: 'mdi-cloud',
    },
    quota: null,
    environment: null,
    podUsageMode: 'cpuavg',
    topN: [],
    ready: false,
    topMenu: false,
  }),
  computed: {
    ...mapState(['JWT', 'Scale']),
    ...mapGetters(['Environment', 'Project']),
    podUsedModeCN() {
      const cn = this.environmentPodUsageSelect.find((e) => {
        return e.value === this.podUsageMode
      })
      if (cn) {
        return cn.text
      }
      return ''
    },
    cpuSeries() {
      return this.quota
        ? [
            this.quota.Cpu === 0
              ? 0
              : (this.quota.UsedCpu / this.quota.Cpu) * 100,
          ]
        : [0]
    },
    cpuOptions() {
      return generateRadialBarChartOptions(
        'CPU',
        ['CPU'],
        this.quota ? this.quota.Cpu : 0,
        'core',
      )
    },
    memorySeries() {
      return this.quota
        ? [
            this.quota.Memory === 0
              ? 0
              : (this.quota.UsedMemory / this.quota.Memory) * 100,
          ]
        : [0]
    },
    memoryOptions() {
      return generateRadialBarChartOptions(
        '内存',
        ['内存'],
        this.quota ? this.quota.Memory : 0,
        'Gi',
      )
    },
    storageSeries() {
      return this.quota
        ? [
            this.quota.Storage === 0
              ? 0
              : (this.quota.UsedStorage / this.quota.Storage) * 100,
          ]
        : [0]
    },
    storageOptions() {
      return generateRadialBarChartOptions(
        '存储',
        ['存储'],
        this.quota ? this.quota.Storage : 0,
        'Gi',
      )
    },
    podSeries() {
      return this.quota
        ? [
            this.quota.Pod === 0
              ? 0
              : (this.quota.UsedPod / this.quota.Pod) * 100,
          ]
        : [0]
    },
    podOptions() {
      return generateRadialBarChartOptions(
        '容器组',
        ['容器组'],
        this.quota ? this.quota.Pod : 0,
        '',
      )
    },
  },
  async mounted() {
    if (this.JWT) {
      this.$store.commit('CLEAR_PLUGINS_INTERVAL')
      this.$store.dispatch('INIT_PLUGINS')
      this.environmentDetail()
      this.environmentQuota()
      this.topNPodResourceUsage()
    }
  },
  methods: {
    beautifyCpuUnit: beautifyCpuUnit,
    beautifyStorageUnit: beautifyStorageUnit,
    sizeOfCpu: sizeOfCpu,
    sizeOfStorage: sizeOfStorage,
    async environmentDetail() {
      this.environmentQuota()
      this.topNPodResourceUsage()
      const data = await getEnvironmentDetail(this.Environment().ID)
      this.environment = data
    },
    async environmentQuota() {
      const data = await getEnvironmentQuota(
        this.Project().ID,
        this.Environment().ID,
        {
          noprocessing: true,
        },
      )
      if (data.quota.status.hard) {
        this.quota = {
          Cpu: data.quota.status.hard['limits.cpu']
            ? parseFloat(sizeOfCpu(data.quota.status.hard['limits.cpu']))
            : 0,
          Memory: data.quota.status.hard['limits.memory']
            ? parseFloat(sizeOfStorage(data.quota.status.hard['limits.memory']))
            : 0,
          Storage: data.quota.status.hard['requests.storage']
            ? parseFloat(
                sizeOfStorage(data.quota.status.hard['requests.storage']),
              )
            : 0,
          Pod: data.quota.status.hard['count/pods']
            ? parseInt(data.quota.status.hard['count/pods'])
            : 5120,
          UsedCpu: data.quota.status.used['limits.cpu']
            ? parseFloat(sizeOfCpu(data.quota.status.used['limits.cpu']))
            : 0,
          UsedMemory: data.quota.status.used['limits.memory']
            ? parseFloat(sizeOfStorage(data.quota.status.used['limits.memory']))
            : 0,
          UsedStorage: data.quota.status.used['requests.storage']
            ? parseFloat(
                sizeOfStorage(data.quota.status.used['requests.storage']),
              )
            : 0,
          UsedPod: data.quota.status.used.pods
            ? parseFloat(data.quota.status.used.pods)
            : 0,
        }
      } else {
        this.quota = {
          Cpu: 0,
          Memory: 0,
          Storage: 0,
          Pod: 0,
          UsedCpu: 0,
          UsedMemory: 0,
          UsedStorage: 0,
          UsedPod: 0,
        }
      }
      this.ready = true
    },
    manageUser() {
      this.$refs.manageUser.init()
      this.$refs.manageUser.open()
    },
    scaleResource() {
      this.$refs.scaleResource.init(this.environment)
      this.$refs.scaleResource.open()
    },
    updateEnvironment() {
      this.$refs.updateEnvironment.init(this.environment)
      this.$refs.updateEnvironment.open()
    },
    removeEnvironment() {
      const item = this.environment
      this.$store.commit('SET_CONFIRM', {
        title: `删除环境`,
        content: {
          text: `删除环境 ${item.EnvironmentName} ，${
            item.DeletePolicy === 'delLabels'
              ? '当前删除策略为 delLabels，该策略仅删除关联'
              : '当前删除策略为 delNamespace，该策略会删除整个命名空间，请谨慎操作'
          }`,
          type: 'delete',
          name: item.EnvironmentName,
          level: item.DeletePolicy === 'delLabels' ? 'warning' : 'error',
        },
        param: { item },
        doFunc: async (param) => {
          await deleteEnvironment(param.item.ID)
          this.$store.commit('CLEAR_RESOURCE')
          this.$router.push({
            name: 'resource-dashboard',
          })
        },
      })
    },
    async topNPodResourceUsage() {
      this.topN = []
      let promql = ''
      if (this.podUsageMode === 'cpuavg') {
        promql = TOP_20_POD_CPU_AVG_PROMQL
      } else if (this.podUsageMode === 'cpumax') {
        promql = TOP_20_POD_CPU_MAX_PROMQL
      } else if (this.podUsageMode === 'memoryavg') {
        promql = TOP_20_POD_MEMORY_AVG_PROMQL
      } else if (this.podUsageMode === 'memorymax') {
        promql = TOP_20_POD_MEMORY_MAX_PROMQL
      }
      const data = await vector(this.ThisCluster, {
        query: promql.replaceAll('$1', this.Environment().Namespace),
        noprocessing: true,
      })
      this.topN = data
    },
    setPodUsageMode(select) {
      if (select.value !== this.podUsageMode) {
        this.podUsageMode = select.value
        this.topNPodResourceUsage()
      }
    },
    resourceUsage() {
      this.$refs.resourceUseList.init()
      this.$refs.resourceUseList.open()
    },
  },
}
</script>
