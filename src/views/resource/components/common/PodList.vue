<template>
  <v-flex class="pa-4">
    <v-data-table
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      hide-default-footer
      @update:sort-by="m_table_sortBy"
      @update:sort-desc="m_table_sortDesc"
    >
      <template #[`item.name`]="{ item }">
        <a
          class="text-subtitle-2"
          @click="podDetail(item)"
        >
          {{ item.metadata.name }}
        </a>
      </template>
      <template #[`item.status`]="{ item, index }">
        <v-flex :id="`e${item.metadata.resourceVersion}`" />
        <EventTip
          kind="Pod"
          :item="item"
          :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
        >
          <template #trigger>
            <span
              :class="`v-avatar mr-2 ${
                [
                  'ContainerCreating',
                  'Pending',
                  'Terminating',
                  'PodInitializing',
                ].indexOf(m_resource_getPodStatus(item)) > -1
                  ? 'kubegems__waiting-flashing'
                  : ''
              }`"
              :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                $POD_STATUS_COLOR[m_resource_getPodStatus(item)] || '#ff5252'
              };`"
            />
            <span> {{ m_resource_getPodStatus(item) }}</span>
            <span>
              ({{
                item.status && item.status.containerStatuses
                  ? item.status.containerStatuses.filter((c) => {
                    return c.ready
                  }).length
                  : 0
              }}/{{ item.spec.containers.length }})
            </span>
          </template>
        </EventTip>
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.status.podIP }}
      </template>
      <template #[`item.restart`]="{ item }">
        {{ getRestart(item.status.containerStatuses) }}
      </template>
      <template #[`item.age`]="{ item }">
        {{
          item.status.startTime
            ? $moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
            : ''
        }}
      </template>
      <template #[`item.cpu`]="{ item }">
        <v-flex class="text-subtitle-2">
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
        <v-flex class="text-subtitle-2">
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
                v-if="
                  m_permisson_resourceAllow &&
                    item.status.phase === 'Running' &&
                    !item.metadata.deletionTimestamp
                "
              >
                <v-btn
                  color="primary"
                  text
                  small
                  @click="containerShell(item)"
                >
                  终端
                </v-btn>
              </v-flex>
              <v-flex
                v-if="
                  m_permisson_resourceAllow &&
                    item.status.phase === 'Running' &&
                    !item.metadata.deletionTimestamp
                "
              >
                <v-btn
                  color="primary"
                  text
                  small
                  @click="containerDebug(item)"
                >
                  Debug
                </v-btn>
              </v-flex>
              <v-flex
                v-if="
                  (item.status.phase === 'Running' ||
                    item.status.phase === 'Succeeded') &&
                    !item.metadata.deletionTimestamp
                "
              >
                <v-btn
                  color="primary"
                  text
                  small
                  @click="containerLog(item)"
                >
                  日志
                </v-btn>
              </v-flex>
              <v-flex
                v-if="
                  (item.status.phase !== 'Running' &&
                    item.status.phase !== 'Succeeded') ||
                    item.metadata.deletionTimestamp
                "
                class="pa-2"
              >
                不可操作
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
      @loaddata="podList"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />

    <ContainerLog ref="containerLog" />
    <Terminal ref="terminal" />
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { getPodList } from '@/api'
import ContainerLog from './ContainerLog'
import Terminal from './Terminal'
import EventTip from './EventTip'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'
import {
  POD_CPU_USAGE_PROMQL,
  POD_MEMORY_USAGE_PROMQL,
} from '@/utils/prometheus'
import { beautifyCpuUnit, beautifyStorageUnit } from '@/utils/helpers'

export default {
  name: 'PodList',
  components: {
    ContainerLog,
    Terminal,
    EventTip,
  },
  mixins: [BaseResource, BasePermission, BaseTable],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    selector: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    items: [],
    headers: [
      { text: '容器组', value: 'name', align: 'start' },
      { text: '状态', value: 'status', align: 'start', width: 250 },
      { text: '重启次数', value: 'restart', align: 'start', sortable: false },
      { text: 'Age', value: 'age', align: 'start' },
      { text: 'Pod IP', value: 'ip', align: 'start', sortable: false },
      {
        text: 'CPU使用量',
        value: 'cpu',
        align: 'start',
        width: 150,
        sortable: false,
      },
      {
        text: '内存使用量',
        value: 'memory',
        align: 'start',
        width: 150,
        sortable: false,
      },
      {
        text: '操作',
        value: 'action',
        align: 'center',
        width: 20,
        sortable: false,
      },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
      noprocessing: true,
    },
  }),
  computed: {
    ...mapState(['MessageStreamWS', 'AdminViewport']),
  },
  watch: {
    '$store.state.MessageStream': {
      handler: function (updatingPod) {
        if (!updatingPod) return
        const pod = JSON.parse(updatingPod)
        if (pod.MessageType !== 'objectChanged') return
        if (pod.EventKind === 'delete') {
          this.podList()
          return
        }
        const index = this.items.findIndex((p) => {
          return (
            p.metadata.name === pod.Content.metadata.name &&
            p.metadata.namespace === pod.Content.metadata.namespace
          )
        })
        if (index > -1) {
          this.$set(this.items, index, pod.Content)
        }
      },
      deep: true,
      immediate: true,
    },
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.podList()
      },
      deep: true,
    },
    item: {
      handler: function () {
        if (this.item) {
          this.podList()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async podList() {
      const data = await getPodList(
        this.ThisCluster,
        this.$route.query.namespace || '_all',
        Object.assign(
          this.selector,
          Object.assign(this.params, {
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        ),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.podCPUUsage()
      this.podMemoryUsage()
      this.watchPodList()
    },
    watchPodList() {
      const sub = {
        kind: 'objectChanged',
        content: {},
      }
      const watchPodList = []
      this.items.forEach((pod) => {
        watchPodList.push(`${pod.metadata.namespace}/${pod.metadata.name}`)
      })
      sub.content[this.ThisCluster] = { Pod: watchPodList }
      if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
        this.MessageStreamWS.send(JSON.stringify(sub))
      }
    },
    async podCPUUsage() {
      const parallelPods = []
      for (
        let index = 0;
        index < parseInt(this.items.length / 20) + 1;
        index++
      ) {
        parallelPods.push(this.items.slice(index * 20, (index + 1) * 20))
      }
      parallelPods.forEach(async (pods) => {
        const query = POD_CPU_USAGE_PROMQL
          .replaceAll(
            '$1',
            pods
              .map((pod) => {
                return pod.metadata.name
              })
              .join('|'),
          )
          .replaceAll(
            '$2',
            pods
              .map((pod) => {
                return pod.metadata.namespace
              })
              .join('|'),
          )
        const data = await this.m_permission_matrix(this.ThisCluster, {
          query: query,
          start: this.$moment(
            new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
          )
            .utc()
            .format(),
          end: this.$moment(new Date()).utc().format(),
          noprocessing: true,
        })
        if (data) {
          data.forEach((d) => {
            const index = this.items.findIndex((p) => {
              return d.metric && p.metadata.name === d.metric.pod
            })
            if (index > -1) {
              const CpuUsed = []
              const latest =
                d.values.length > 0
                  ? parseFloat(d.values[d.values.length - 1][1])
                  : null
              d.values.forEach((v) => {
                CpuUsed.push(parseFloat(v[1]))
              })
              const item = this.items[index]
              item.LatestCpu = latest ? beautifyCpuUnit(latest) : 0
              item.CpuUsed = CpuUsed
              this.$set(this.items, index, item)
            }
          })
        }
      })
    },
    async podMemoryUsage() {
      const parallelPods = []
      for (
        let index = 0;
        index < parseInt(this.items.length / 20) + 1;
        index++
      ) {
        parallelPods.push(this.items.slice(index * 20, (index + 1) * 20))
      }
      parallelPods.forEach(async (pods) => {
        const query = POD_MEMORY_USAGE_PROMQL
          .replaceAll(
            '$1',
            pods
              .map((pod) => {
                return pod.metadata.name
              })
              .join('|'),
          )
          .replaceAll(
            '$2',
            pods
              .map((pod) => {
                return pod.metadata.namespace
              })
              .join('|'),
          )
        const data = await this.m_permission_matrix(this.ThisCluster, {
          query: query,
          start: this.$moment(
            new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
          )
            .utc()
            .format(),
          end: this.$moment(new Date()).utc().format(),
          noprocessing: true,
        })
        if (data) {
          data.forEach((d) => {
            const index = this.items.findIndex((p) => {
              return d.metric && p.metadata.name === d.metric.pod
            })
            if (index > -1) {
              const MemoryUsed = []
              const latest =
                d.values.length > 0
                  ? parseFloat(d.values[d.values.length - 1][1])
                  : null
              d.values.forEach((v) => {
                MemoryUsed.push(parseFloat(v[1]))
              })
              const item = this.items[index]
              item.LatestMemory = latest ? beautifyStorageUnit(latest) : 0
              item.MemoryUsed = MemoryUsed
              this.$set(this.items, index, item)
            }
          })
        }
      })
    },
    containerLog(item) {
      const itemCopy = {
        namespace: item.metadata.namespace,
        name: item.metadata.name,
        containers: item.spec.containers,
      }
      let container = ''
      if (item.spec.containers && item.spec.containers.length > 0) {
        container = item.spec.containers[0].name
      }
      this.$refs.containerLog.init(container, itemCopy)
      this.$refs.containerLog.open()
    },
    containerDebug(item) {
      const itemCopy = {
        namespace: item.metadata.namespace,
        name: item.metadata.name,
        containers: item.spec.containers,
      }
      let container = ''
      if (item.spec.containers && item.spec.containers.length > 0) {
        container = item.spec.containers[0].name
      }
      this.$refs.terminal.init(container, itemCopy, 'debug')
      this.$refs.terminal.open()
    },
    containerShell(item) {
      const itemCopy = {
        namespace: item.metadata.namespace,
        name: item.metadata.name,
        containers: item.spec.containers,
      }
      let container = ''
      if (item.spec.containers && item.spec.containers.length > 0) {
        container = item.spec.containers[0].name
      }
      this.$refs.terminal.init(container, itemCopy, 'shell')
      this.$refs.terminal.open()
    },
    getRestart(containerStatuses) {
      let sum = 0
      if (containerStatuses) {
        containerStatuses.forEach((con) => {
          sum += con.restartCount
        })
      }
      return sum
    },
    podDetail(item) {
      this.$router.push({
        name: 'pod-detail',
        params: Object.assign(this.$route.params, {
          name: item.metadata.name,
        }),
        query: {
          namespace: item.metadata.namespace,
        },
      })
    },
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
