<template>
  <v-flex class="px-2">
    <v-expansion-panels
      v-model="expand"
      accordion
      class="project-panel"
    >
      <v-expansion-panel
        v-for="(item, index) in projectItems"
        :key="index"
      >
        <v-expansion-panel-header @click="projectEnvironmentList(item)">
          <v-flex class="text-subtitle-1">
            {{ item.ProjectName }}
            <span class="text-body-2 ml-3">别名：{{ item.ProjectAlias }}</span>
            <span class="text-body-2 ml-3">备注：{{ item.Remark }}</span>
            <v-btn
              v-if="m_permisson_projectAllow"
              color="primary"
              small
              text
              depressed
              class="float-right"
              @click.stop="addEnvironment(item)"
            >
              <v-icon
                left
                small
              >
                mdi-cube
              </v-icon>
              创建环境
            </v-btn>
            <v-btn
              color="primary"
              small
              text
              depressed
              class="float-right"
              @click.stop="projectDetail(item)"
            >
              <v-icon
                left
                small
              >
                mdi-login-variant
              </v-icon>
              进入项目
            </v-btn>
          </v-flex>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-data-table
            disable-sort
            :headers="headers"
            :items="environmentItems"
            no-data-text="暂无数据"
            hide-default-footer
          >
            <template #[`item.environmentName`]="{ item }">
              <BaseMarquee
                :speed="20"
                :content="item.EnvironmentName"
              >
                <a
                  class="font-weight-medium"
                  @click="environmentDetail(item)"
                >
                  {{ item.EnvironmentName }}
                </a>
              </BaseMarquee>
            </template>
            <template #[`item.type`]="{ item }">
              <v-chip
                x-small
                label
                :color="
                  $METATYPE_CN[item.MetaType] && $METATYPE_CN[item.MetaType].color
                    ? $METATYPE_CN[item.MetaType].color
                    : 'grey'
                "
              >
                {{ $METATYPE_CN[item.MetaType].cn }}
              </v-chip>
            </template>
            <template #[`item.workload`]="{ item }">
              {{ item.Workload ? item.Workload : 0 }}
            </template>
            <template #[`item.job`]="{ item }">
              {{ item.Job ? item.Job : 0 }}
            </template>
            <template #[`item.configMap`]="{ item }">
              {{ item.ConfigMap ? item.ConfigMap : 0 }}
            </template>
            <template #[`item.secret`]="{ item }">
              {{ item.Secret ? item.Secret : 0 }}
            </template>
            <template #[`item.service`]="{ item }">
              {{ item.Service ? item.Service : 0 }}
            </template>
            <template #[`item.persistentvolumeclaims`]="{ item }">
              {{
                item.Persistentvolumeclaims ? item.Persistentvolumeclaims : 0
              }}
            </template>
            <template #[`item.ingress`]="{ item }">
              {{ item.Ingress ? item.Ingress : 0 }}
            </template>
            <template #[`item.pod`]="{ item }">
              {{ item.Pod ? item.Pod : 0 }}
            </template>
            <template #[`item.cpu`]="{ item }">
              <v-flex>
                {{ item.LatestCpu ? item.LatestCpu : 0 }}
              </v-flex>
              <v-sparkline
                :value="item.CpuUsed ? item.CpuUsed : []"
                type="trend"
                auto-draw
                auto-line-width
                smooth
                :line-width="5"
                fill
                :auto-draw-duration="200"
                color="rgba(29, 136, 229, 0.6)"
              />
            </template>
            <template #[`item.memory`]="{ item }">
              <v-flex>
                {{ item.LatestMemory ? item.LatestMemory : 0 }}
              </v-flex>
              <v-sparkline
                :value="item.MemoryUsed ? item.MemoryUsed : []"
                type="trend"
                auto-draw
                auto-line-width
                smooth
                :line-width="5"
                fill
                :auto-draw-duration="200"
                color="rgba(29, 136, 229, 0.6)"
              />
            </template>
            <template #[`item.in`]="{ item }">
              <v-flex>
                {{ item.LatestNetwokrIn ? item.LatestNetwokrIn : 0 }}
              </v-flex>
              <v-sparkline
                :value="item.NetworkInUsed ? item.NetworkInUsed : []"
                type="trend"
                auto-draw
                auto-line-width
                smooth
                :line-width="5"
                fill
                :auto-draw-duration="200"
                color="rgba(29, 136, 229, 0.6)"
              />
            </template>
            <template #[`item.out`]="{ item }">
              <v-flex>
                {{ item.LatestNetwokrOut ? item.LatestNetwokrOut : 0 }}
              </v-flex>
              <v-sparkline
                :value="item.NetwokrOutUsed ? item.NetwokrOutUsed : []"
                type="trend"
                auto-draw
                auto-line-width
                smooth
                :line-width="5"
                fill
                :auto-draw-duration="200"
                color="rgba(29, 136, 229, 0.6)"
              />
            </template>
            <template #[`item.action`]="{ item }">
              <span class="pa-2">
                <v-btn
                  color="primary"
                  text
                  x-small
                  @click="environmentDetail(item)"
                >
                  <v-icon
                    left
                    small
                  >mdi-login-variant</v-icon>
                  进入环境
                </v-btn>
              </span>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <Pagination
      v-if="pageCount >= 1"
      v-model="pageParams.page"
      :page-count="pageCount"
      :size="pageParams.size"
      @loaddata="projectList"
      @changepage="onPageIndexChange"
    />

    <AddEnvironment
      ref="addEnvironment"
      @refresh="refreshEnvironmentList"
    />
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getProjectList,
  getProjectEnvironmentList,
  getProjectEnvironmentQuotaList,
  matrix,
} from '@/api'
import AddEnvironment from '@/views/resource/environment/components/AddEnvironment'
import Pagination from './Pagination'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import {
  beautifyCpuUnit,
  beautifyStorageUnit,
  beautifyNetworkUnit,
} from '@/utils/helpers'
import {
  ENVIRONMENT_CPU_USAGE_PROMQL,
  ENVIRONMENT_MEMORY_USAGE_PROMQL,
  ENVIRONMENT_NETWORK_IN_PROMQL,
  ENVIRONMENT_NETWORK_OUT_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'ProjectList',
  components: {
    AddEnvironment,
    Pagination,
  },
  mixins: [BaseSelect, BaseResource, BasePermission],
  inject: ['reload'],
  data: () => ({
    projectItems: [],
    environmentItems: [],
    headers: [
      { text: '环境', value: 'environmentName', align: 'start', width: 120 },
      { text: '类型', value: 'type', align: 'start' },
      { text: '工作负载', value: 'workload', align: 'start' },
      { text: '任务', value: 'job', align: 'start' },
      { text: '存储卷', value: 'persistentvolumeclaims', align: 'start' },
      { text: '配置', value: 'configMap', align: 'start' },
      { text: '密钥', value: 'secret', align: 'start' },
      { text: '服务', value: 'service', align: 'start' },
      { text: '路由', value: 'ingress', align: 'start' },
      { text: '容器组', value: 'pod', align: 'start' },
      { text: 'CPU', value: 'cpu', align: 'start', width: 120 },
      { text: '内存', value: 'memory', align: 'start', width: 120 },
      { text: '流量in', value: 'in', align: 'start', width: 120 },
      { text: '流量out', value: 'out', align: 'start', width: 120 },
      { text: '操作', value: 'action', align: 'center', width: 100 },
    ],
    pageCount: 0,
    pageParams: {
      page: 1,
      size: 10,
    },
    params: {
      start: '',
      end: '',
    },
    expand: null,
  }),
  computed: {
    ...mapState(['JWT', 'Admin']),
    ...mapGetters(['Tenant', 'Project']),
  },
  mounted() {
    if (this.JWT) {
      if (this.Tenant().ID > 0) {
        this.projectList()
        const end = new Date()
        const start = new Date(
          new Date().setMinutes(new Date().getMinutes() - 15),
        )
        this.params.start = this.$moment(start).utc().format()
        this.params.end = this.$moment(end).utc().format()
      }
    }
  },
  methods: {
    async projectList() {
      const data = await getProjectList(this.Tenant().ID,
      Object.assign(this.pageParams, {
        noprocessing: true,
      }),
      )
      this.projectItems = data.List
      this.pageCount = Math.ceil(data.Total / this.pageParams.size)
      this.pageParams.page = data.CurrentPage
      if (this.projectItems.length > 0) {
        this.expand = 0
        this.projectEnvironmentList(this.projectItems[0])
      }
    },
    onPageIndexChange(page) {
      this.pageParams.page = page
    },
    async projectEnvironmentList(item) {
      this.environmentItems = []
      const data = await getProjectEnvironmentList(item.ID, { noprocessing: true })
      data.List.sort(function (a, b) {
        if (a.EnvironmentName < b.EnvironmentName) {
          return -1
        }
        if (a.EnvironmentName > b.EnvironmentName) {
          return 1
        }
        return 0
      })
      this.environmentItems = data.List
      await this.projectEnvironmentQuotaList(item)
      const envdict = {}
      this.environmentItems.forEach((e) => {
        if (
          Object.prototype.hasOwnProperty.call(envdict, e.Cluster.ClusterName)
        ) {
          envdict[e.Cluster.ClusterName].push(e.EnvironmentName)
        } else {
          envdict[e.Cluster.ClusterName] = [e.EnvironmentName]
        }
      })
      for (const key in envdict) {
        this.environmentCPUUsage(key, envdict[key].join('|'))
        this.environmentMemoryUsage(key, envdict[key].join('|'))
        this.environmentNetworkIn(key, envdict[key].join('|'))
        this.environmentNetworkOut(key, envdict[key].join('|'))
      }
    },
    refreshEnvironmentList(item) {
      this.projectEnvironmentList(item)
      this.$emit('refreshTenantStatistics')
    },
    async projectEnvironmentQuotaList(item) {
      const data = await getProjectEnvironmentQuotaList(item.ID, {
        noprocessing: true,
      })
      for (const key in data) {
        const index = this.environmentItems.findIndex((e) => {
          return e.EnvironmentName === key
        })
        if (index > -1) {
          const env = this.environmentItems[index]
          env.Workload =
            data[key].quota && data[key].quota.status.used
              ? parseInt(data[key].quota.status.used['count/daemonsets.apps']) +
                parseInt(
                  data[key].quota.status.used['count/deployments.apps'],
                ) +
                parseInt(data[key].quota.status.used['count/statefulsets.apps'])
              : 0
          env.Job =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/jobs.batch']
              : 0
          env.ConfigMap =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/configmaps']
              : 0
          env.Secret =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/secrets']
              : 0
          env.Service =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/services']
              : 0
          env.Ingress =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/ingresses.extensions']
              : 0
          env.Persistentvolumeclaims =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/persistentvolumeclaims']
              : 0
          env.Pod =
            data[key].quota && data[key].quota.status.used
              ? data[key].quota.status.used['count/pods']
              : 0
          this.$set(this.environmentItems, index, env)
        }
      }
    },
    addEnvironment(item) {
      this.$refs.addEnvironment.projectid = item.ID
      this.$refs.addEnvironment.open()
      this.$refs.addEnvironment.init(item.ID)
    },
    async environmentDetail(item) {
      this.$router.push({
        name: 'environment-detail',
        params: {
          tenant: this.Tenant().TenantName,
          project: item.Project.ProjectName,
          environment: item.EnvironmentName,
        },
      })
    },
    projectDetail(item) {
      this.$router.push({
        name: 'project-detail',
        query: {
          name: item.ProjectName,
        },
        params: {
          tenant: this.Tenant().TenantName,
          project: item.ProjectName,
        },
      })
    },
    async environmentCPUUsage(cluster, environments) {
      const data = await matrix(
        cluster,
        Object.assign(this.params, {
          query: ENVIRONMENT_CPU_USAGE_PROMQL.replaceAll('$1', environments),
          noprocessing: true,
        }),
      )
      data.forEach((d) => {
        const index = this.environmentItems.findIndex((e) => {
          return e.EnvironmentName === d.metric.environment
        })
        if (index > -1) {
          const values = []
          d.values.forEach((v) => {
            values.push(Math.floor(parseFloat(v[1]) * 1000) / 1000)
          })
          const item = this.environmentItems[index]
          item.LatestCpu =
            values.length > 0 ? beautifyCpuUnit(values[values.length - 1]) : 0
          item.CpuUsed = values
          this.$set(this.environmentItems, index, item)
        }
      })
    },
    async environmentMemoryUsage(cluster, environments) {
      const data = await matrix(
        cluster,
        Object.assign(this.params, {
          query: ENVIRONMENT_MEMORY_USAGE_PROMQL.replaceAll(
            '$1',
            environments,
          ),
          noprocessing: true,
        }),
      )
      data.forEach((d) => {
        const index = this.environmentItems.findIndex((e) => {
          return e.EnvironmentName === d.metric.environment
        })
        if (index > -1) {
          const values = []
          d.values.forEach((v) => {
            values.push(Math.floor(parseFloat(v[1]) * 1000) / 1000)
          })
          const item = this.environmentItems[index]
          item.LatestMemory =
            values.length > 0
              ? beautifyStorageUnit(values[values.length - 1])
              : 0
          item.MemoryUsed = values
          this.$set(this.environmentItems, index, item)
        }
      })
    },
    async environmentNetworkIn(cluster, environments) {
      const data = await matrix(
        cluster,
        Object.assign(this.params, {
          query: ENVIRONMENT_NETWORK_IN_PROMQL.replaceAll('$1', environments),
          noprocessing: true,
        }),
      )
      data.forEach((d) => {
        const index = this.environmentItems.findIndex((e) => {
          return e.EnvironmentName === d.metric.environment
        })
        if (index > -1) {
          const values = []
          d.values.forEach((v) => {
            values.push(Math.floor((parseFloat(v[1]) / 1000) * 1000))
          })
          const item = this.environmentItems[index]
          item.LatestNetwokrIn =
            values.length > 0
              ? beautifyNetworkUnit(values[values.length - 1])
              : 0
          item.NetworkInUsed = values
          this.$set(this.environmentItems, index, item)
        }
      })
    },
    async environmentNetworkOut(cluster, environments) {
      const data = await matrix(
        cluster,
        Object.assign(this.params, {
          query: ENVIRONMENT_NETWORK_OUT_PROMQL.replaceAll(
            '$1',
            environments,
          ),
          noprocessing: true,
        }),
      )
      data.forEach((d) => {
        const index = this.environmentItems.findIndex((e) => {
          return e.EnvironmentName === d.metric.environment
        })
        if (index > -1) {
          const values = []
          d.values.forEach((v) => {
            values.push(Math.floor((parseFloat(v[1]) / 1000) * 1000))
          })
          const item = this.environmentItems[index]
          item.LatestNetwokrOut =
            values.length > 0
              ? beautifyNetworkUnit(values[values.length - 1])
              : 0
          item.NetwokrOutUsed = values
          this.$set(this.environmentItems, index, item)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.project-panel {
  max-height: 500px;
  overflow-y: auto;
}
</style>
