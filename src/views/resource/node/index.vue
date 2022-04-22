<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '节点名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <v-spacer />
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
      >
        <template #[`item.name`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="nodeDetail(item)"
          >
            <v-flex class="float-left">
              {{ item.metadata.name }}
            </v-flex>
            <v-flex
              v-if="
                Plugins && Plugins.gpu_manager &&
                  item.metadata.labels['tencent.com/vcuda'] &&
                  item.metadata.labels['tencent.com/vcuda'] === 'true'
              "
              class="float-left ml-2"
            >
              <v-menu
                top
                open-on-hover
                :close-delay="200"
                nudge-bottom="7px"
              >
                <template #activator="{ on }">
                  <span v-on="on">
                    <BaseLogo icon-name="tke" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> tke </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
            <v-flex
              v-if="
                Plugins && Plugins.nvidia_device_plugin &&
                  item.metadata.labels['nvidia.com/gpu'] &&
                  item.metadata.labels['nvidia.com/gpu'] === 'true'
              "
              class="float-left ml-2"
            >
              <v-menu
                top
                open-on-hover
                :close-delay="200"
                nudge-bottom="7px"
              >
                <template #activator="{ on }">
                  <span v-on="on">
                    <BaseLogo icon-name="nvidia" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> nvidia </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
            <div class="kubegems__clear-float" />
          </a>
        </template>
        <template #[`item.status`]="{ item }">
          <v-avatar
            :style="`background-color: ${
              getStatus(item.status.conditions).join(',') === 'Ready'
                ? '#00BCD4'
                : getStatus(item.status.conditions).join(',') === 'Unknown'
                  ? '#607D8B'
                  : '#ff5252'
            };`"
            class="mr-2"
            size="10"
          >
            <span class="white--text text-h5" />
          </v-avatar>
          {{ getStatus(item.status ? item.status.conditions : null).join(',') }}
        </template>
        <template #[`item.ip`]="{ item }">
          {{ item.status.addresses[0].address }}
        </template>
        <template #[`item.pod`]="{ item }">
          {{ item.podcount ? item.podcount : 0 }}
          / {{ item.status.capacity.pods }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.podPercentage"
            height="15"
            :color="
              item.podPercentage
                ? item.podPercentage < 60
                  ? 'primary'
                  : item.podPercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text"> {{ item.podPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.load`]="{ item }">
          <v-sheet
            :class="`text-subtitle-2 ${getLoadColor(
              item,
            )} rounded text-center py-2 kubegems__detail`"
          >
            {{ item.load ? item.load : 0 }}
          </v-sheet>
        </template>
        <template #[`item.cpu`]="{ item }">
          {{ item.cpu }}
          /
          {{ item.status.capacity.cpu }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.cpuPercentage"
            height="15"
            :color="
              item.cpuPercentage < 60
                ? 'primary'
                : item.cpuPercentage < 80
                  ? 'warning'
                  : 'red darken-1'
            "
          >
            <span class="white--text"> {{ item.cpuPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.memory`]="{ item }">
          {{ item.memory }}
          Gi / {{ sizeOfStorage(item.status.capacity.memory).toFixed(1) }}
          Gi
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.memoryPercentage"
            height="15"
            :color="
              item.memoryPercentage < 60
                ? 'primary'
                : item.memoryPercentage < 80
                  ? 'warning'
                  : 'red darken-1'
            "
          >
            <span class="white--text"> {{ item.memoryPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.createAt`]="{ item }">
          {{
            item.metadata.creationTimestamp
              ? $moment(item.metadata.creationTimestamp).format('lll')
              : ''
          }}
        </template>
        <template #[`item.taint`]="{ item }">
          <v-chip
            v-for="(val, index) in getDistinctTaints(item.spec.taints)"
            :key="index"
            color="success"
            text-color="white"
            class="ma-1 font-weight-medium"
            small
          >
            {{ val }}
          </v-chip>
        </template>
        <template #[`item.role`]="{ item }">
          <span
            v-if="
              item.metadata.labels[`node-role.kubernetes.io/master`] === '' ||
                item.metadata.labels[`kubernetes.io/role`] === 'master'
            "
          >
            Master
          </span>
          <span v-else>Worker</span>
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu
            left
            :attach="`#r${item.metadata.resourceVersion}`"
          >
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
              <v-card-text class="pa-2 text-center">
                <v-flex
                  v-if="Plugins && (Plugins.gpu_manager || Plugins.nvidia_device_plugin)"
                >
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="gpuSchedule(item)"
                  >
                    GPU调度
                  </v-btn>
                </v-flex>
                <v-flex v-if="item.spec.unschedulable">
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="allowSchedule(item)"
                  >
                    允许调度
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="stopSchedule(item)"
                  >
                    停止调度
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="nodeList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <GpuScheduleForm
      ref="gpuScheduleForm"
      @refresh="nodeList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getNodeList, patchCordonNode, vector } from '@/api'
import GpuScheduleForm from './components/GpuScheduleForm'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import {
  NODE_LOAD_PROMQL,
  NODE_ALL_CPU_USAGE_PROMQL,
  NODE_ALL_MEMORY_USAGE_PROMQL,
  NODE_POD_RUNNING_COUNT_PROMQL,
} from '@/utils/prometheus'
import { convertStrToNum, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'Node',
  components: {
    GpuScheduleForm,
  },
  mixins: [BaseFilter, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '集群节点',
      tip: '节点(node)提供了当前集群下节点的运行状态。',
      icon: 'mdi-lan-connect',
    },
    items: [],
    headers: [
      { text: '主机名', value: 'name', align: 'start' },
      { text: 'Ip', value: 'ip', align: 'start' },
      { text: '状态', value: 'status', align: 'start', width: 150 },
      { text: '角色', value: 'role', align: 'start' },
      { text: '污点', value: 'taint', align: 'start' },
      { text: '5分钟负载', value: 'load', align: 'start' },
      { text: 'CPU', value: 'cpu', align: 'start', width: 150 },
      { text: '内存', value: 'memory', align: 'start', width: 150 },
      { text: 'Pods', value: 'pod', align: 'start', width: 150 },
      { text: '加入时间', value: 'createAt', align: 'start', width: 180 },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '节点名称', value: 'search', items: [] }],
    interval: null,
  }),
  computed: {
    ...mapState(['JWT', 'Plugins']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或选择集群`,
            color: 'warning',
          })
          return
        }
        Object.assign(
          Object.assign(this.params, { noprocessing: false }),
          convertStrToNum(this.$route.query),
        )
        this.nodeList()
      })
    }
  },
  destroyed() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    async nodeList(noprocess = false) {
      const data = await getNodeList(
        this.ThisCluster,
        Object.assign(this.params, { noprocessing: noprocess }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.nodeCPUUsage(true)
      this.nodeMemoryUsage(true)
      this.nodeLoad5(true)
      this.nodePodCount(true)
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.interval = setInterval(() => {
        this.nodeList(true)
      }, 1000 * 60)
    },
    async nodeLoad5(noprocess = false) {
      const data = await vector(this.ThisCluster, {
        query: NODE_LOAD_PROMQL,
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        const index = this.items.findIndex((node) => {
          return d.metric.host === node.metadata.name
        })
        if (index > -1) {
          const item = this.items[index]
          item.load = parseFloat(d.value[1]).toFixed(1)
          this.$set(this.items, index, item)
        }
      })
    },
    async nodeCPUUsage(noprocess = false) {
      const data = await vector(this.ThisCluster, {
        query: NODE_ALL_CPU_USAGE_PROMQL,
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        const index = this.items.findIndex((node) => {
          return d.metric.host === node.metadata.name
        })
        if (index > -1) {
          const item = this.items[index]
          item.cpu = (
            (parseFloat(d.value[1]) * item.status.capacity.cpu) /
            100
          ).toFixed(1)
          item.cpuPercentage = parseFloat(d.value[1]).toFixed(1)
          this.$set(this.items, index, item)
        }
      })
    },
    async nodeMemoryUsage(noprocess = false) {
      const data = await vector(this.ThisCluster, {
        query: NODE_ALL_MEMORY_USAGE_PROMQL,
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        const index = this.items.findIndex((node) => {
          return d.metric.host === node.metadata.name
        })
        if (index > -1) {
          const item = this.items[index]
          item.memory = (
            (parseFloat(d.value[1]) *
              sizeOfStorage(item.status.capacity.memory, 'Ki')) /
            1024 /
            1024 /
            100
          ).toFixed(1)
          item.memoryPercentage = parseFloat(d.value[1]).toFixed(1)
          this.$set(this.items, index, item)
        }
      })
    },
    async nodePodCount(noprocess = false) {
      const data = await vector(this.ThisCluster, {
        query: NODE_POD_RUNNING_COUNT_PROMQL,
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        const index = this.items.findIndex((node) => {
          return d.metric.node === node.metadata.name
        })
        if (index > -1) {
          const item = this.items[index]
          item.podcount = parseInt(d.value[1])
          item.podPercentage = (
            (parseInt(d.value[1]) / item.status.capacity.pods) *
            100
          ).toFixed(1)
          this.$set(this.items, index, item)
        }
      })
    },
    nodeDetail(item) {
      this.$router.push({
        name: 'node-detail',
        params: { name: item.metadata.name },
      })
    },
    stopSchedule(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '停止调度节点',
        content: {
          text: `停止调度节点 ${item.metadata.name}`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
            Unschedulable: true,
          })
          this.nodeList()
        },
      })
    },
    allowSchedule(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '允许调度节点',
        content: {
          text: `允许调度节点 ${item.metadata.name}`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
            Unschedulable: false,
          })
          this.nodeList()
        },
      })
    },
    getStatus(conditions) {
      const tmpConditions = []
      if (conditions && conditions.length === 0) return ['Unknown']
      conditions.forEach((con) => {
        if (con.type === 'Ready') {
          if (con.status === 'True') {
            tmpConditions.push(con.type)
            return tmpConditions
          } else if (con.status === 'Unknown') {
            tmpConditions.push('Unknown')
          } else {
            tmpConditions.push('NotReady')
          }
        } else {
          if (con.status === 'True') {
            tmpConditions.push(con.type)
          }
        }
      })

      if (tmpConditions.length > 1 && tmpConditions.indexOf('Ready') > -1) {
        const index = tmpConditions.indexOf('Ready')
        tmpConditions.splice(index, 1)
      }

      return tmpConditions
    },
    getDistinctTaints(taints) {
      if (taints === undefined) return []
      const t = []
      taints.forEach((taint) => {
        if (t.indexOf(taint.effect) === -1) {
          t.push(taint.effect)
        }
      })
      return t
    },
    getLoadColor(item) {
      const cpu = parseFloat(item.status.capacity.cpu)
      if (item.load > cpu) {
        return 'red lighten-3'
      }
      return 'green lighten-4'
    },
    gpuSchedule(item) {
      this.$refs.gpuScheduleForm.init(item)
      this.$refs.gpuScheduleForm.open()
    },
    sizeOfStorage: sizeOfStorage,
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>
