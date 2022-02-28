<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '负载名称', value: 'search' }"
          @refresh="filterList"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-spacer />
        <v-menu
          v-if="resourceAllow"
          left
        >
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon
                small
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
                  text
                  color="primary"
                  @click="addWorkload"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建工作负载
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="
                    batchRemoveResource(
                      tabItems[tab].value === 'DaemonSet'
                        ? '守护进程服务'
                        : tabItems[tab].value === 'Deployment'
                          ? '无状态服务'
                          : '有状态服务',
                      tabItems[tab].value,
                      workloadList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除工作负载
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text class="py-0">
        <v-tabs
          v-model="tab"
          height="40"
          class="rounded-t"
          @change="onTabChange"
        >
          <v-tab
            v-for="item in tabItems"
            :key="item.value"
          >
            {{ item.text }}
          </v-tab>
        </v-tabs>
        <v-data-table
          :headers="headers"
          :items="items"
          :page.sync="params.page"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          hide-default-footer
          show-select
          @update:sort-by="sortBy"
          @update:sort-desc="sortDesc"
          @toggle-select-all="onResourceToggleSelect"
        >
          <template #[`item.data-table-select`]="{ item, index }">
            <v-checkbox
              v-model="
                batchResources[`${item.metadata.name}-${index}`].checked
              "
              hide-details
              color="primary"
              @click.stop
              @change="onResourceChange($event, item, index)"
            />
          </template>
          <template #[`item.name`]="{ item, index }">
            <v-flex :id="`a${item.workload.metadata.resourceVersion}`" />
            <a
              class="text-subtitle-2"
              @click="workloadDetail(item.workload)"
            >
              {{ item.workload.metadata.name }}
            </a>
            <ResourceAdvise
              v-if="item.hasOwnProperty('advise')"
              :item="item.workload"
              :top="
                params.size - index <= 5 || (items.length <= 5 && index >= 1)
              "
              :kind="tabItems[tab].value"
              :advise-item="
                adviseItems[
                  `${item.workload.metadata.name}/${item.workload.metadata.namespace}`
                ]
              "
              @clearAdvise="clearAdvise"
              @scaleResourceLimit="scaleResourceLimit"
            />
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.workload.metadata.namespace }}
          </template>
          <template #[`item.status`]="{ item, index }">
            <v-flex :id="`e${item.workload.metadata.resourceVersion}`" />
            <EventTip
              :kind="tabItems[tab].value"
              :item="item.workload"
              :top="
                params.size - index <= 5 || (items.length <= 5 && index >= 1)
              "
            >
              <template #trigger>
                <span
                  :class="`v-avatar mr-2 ${
                    getWorkloadStatus(tabItems[tab].value, item.workload) ===
                    'pending'
                      ? 'waiting-flashing'
                      : ''
                  }`"
                  :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                    $WORKLOAD_STATUS_COLOR[
                      getWorkloadStatus(tabItems[tab].value, item.workload)
                    ]
                  };`"
                />
                <span>
                  {{
                    getWorkloadStatus(tabItems[tab].value, item.workload) ===
                      'ready'
                      ? 'Ready'
                      : 'Pending'
                  }}
                </span>
                <span v-if="tabItems[tab].value !== 'DaemonSet'">
                  ({{
                    item.workload.status.availableReplicas ||
                      item.workload.status.readyReplicas ||
                      0
                  }}/{{ item.workload.spec.replicas }})
                </span>
                <span v-else>
                  ({{ item.workload.status.numberReady || 0 }}/{{
                    item.workload.status.currentNumberScheduled
                  }})
                </span>
              </template>
            </EventTip>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{
              item.workload.metadata.creationTimestamp
                ? $moment(item.workload.metadata.creationTimestamp).format(
                  'lll',
                )
                : ''
            }}
          </template>

          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.workload.metadata.resourceVersion}`" />
            <v-menu
              left
              :attach="`#r${item.workload.metadata.resourceVersion}`"
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
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn
                      color="primary"
                      text
                      small
                      @click="updateWorkload(item.workload)"
                    >
                      编辑
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn
                      color="error"
                      text
                      small
                      @click="removeWorkload(item.workload)"
                    >
                      删除
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
          @loaddata="workloadList"
          @changesize="onPageSizeChange"
          @changepage="onPageIndexChange"
        />
      </v-card-text>
    </v-card>
    <AddWorkload
      ref="addWorkload"
      @refresh="workloadList"
    />
    <UpdateWorkload
      ref="updateWorkload"
      @refresh="workloadList"
    />
    <ResourceLimit
      ref="resourceLimit"
      @clearAdvise="clearAdvise"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getDaemonSetList,
  getStatefulSetList,
  getDeploymentList,
  deleteDaemonSet,
  deleteStatefulSet,
  deleteDeployment,
  getWorkloadResourcesList,
  deleteWorkloadResourceAdvise,
} from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import EventTip from '@/views/resource/components/common/EventTip'
import ResourceLimit from './components/ResourceLimit'
import AddWorkload from './components/AddWorkload'
import UpdateWorkload from './components/UpdateWorkload'
import ResourceAdvise from './components/ResourceAdvise'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'

export default {
  name: 'Workload',
  components: {
    AddWorkload,
    UpdateWorkload,
    NamespaceFilter,
    ResourceAdvise,
    EventTip,
    ResourceLimit,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '工作负载',
      tip: '工作负载 (Workload) 通常是访问服务的载体, 是对一组容器组 (Pod) 的抽象。',
      icon: 'mdi-vector-arrange-above',
    },
    filters: [{ text: '负载名称', value: 'search', items: [] }],
    tab: 0,
    tabItems: [
      { text: '无状态服务', value: 'Deployment' },
      { text: '有状态服务', value: 'StatefulSet' },
      { text: '守护进程服务', value: 'DaemonSet' },
    ],
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    adviseItems: {},
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS']),
    ...mapGetters(['Environment']),
    headers() {
      const items = [
        { text: '负载名称', value: 'name', align: 'start' },
        { text: '运行状态', value: 'status', align: 'start', sortable: false },
        { text: '创建时间', value: 'createAt', align: 'start' },
      ]
      if (this.resourceAllow) {
        items.push({
          text: '',
          value: 'action',
          align: 'center',
          width: 20,
          sortable: false,
        })
      }
      if (this.AdminViewport) {
        items.splice(1, 0, {
          text: '命名空间',
          value: 'namespace',
          align: 'start',
          sortable: false,
        })
      }
      return items
    },
  },
  watch: {
    '$store.state.NamespaceFilter': {
      handler: function (namespace) {
        if (namespace && !namespace.Mounted) {
          this.params.page = 1
          this.params.namespace = namespace.Namespace
          this.workloadList()
        }
      },
      deep: true,
    },
    '$store.state.MessageStream': {
      handler: function (updatingWorkload) {
        if (!updatingWorkload) return
        const workload = JSON.parse(updatingWorkload)
        if (workload.MessageType !== 'objectChanged') return
        if (workload.EventKind === 'delete') {
          this.generateParams()
          this.workloadList(true)
          return
        }
        if (
          workload.EventKind === 'add' &&
          this.params.page === 1 &&
          workload.InvolvedObject.Kind === this.tabItems[this.tab].value
        ) {
          if (
            this.AdminViewport ||
            workload.InvolvedObject.NamespacedName.indexOf(
              this.Environment().Namespace,
            ) === 0
          ) {
            this.generateParams()
            this.workloadList(true)
            return
          }
        }
        const index = this.items.findIndex((w) => {
          return (
            workload.Content.metadata &&
            w.workload.metadata.name === workload.Content.metadata.name &&
            w.workload.metadata.namespace ===
              workload.Content.metadata.namespace
          )
        })
        if (index > -1) {
          const w = this.items[index]
          w.workload = workload.Content
          this.$set(this.items, index, w)
        }
      },
      deep: true,
      immediate: true,
    },
    sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.workloadList(true)
      },
      deep: true,
    },
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
        this.generateParams()
        this.workloadList()
      })
    }
  },
  methods: {
    addWorkload() {
      this.$nextTick(() => {
        this.$refs.addWorkload.init()
        this.$refs.addWorkload.kind = this.tabItems[this.tab].value
        this.$refs.addWorkload.open()
      })
    },
    async onTabChange() {
      this.params.page = 1
      this.items = []
      this.pageCount = 0
      await this.workloadList()
    },
    async workloadList(noprocess = false) {
      let data = {}
      if (this.tabItems[this.tab].value === 'DaemonSet') {
        data = await getDaemonSetList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.generateResourceSortParamValue(),
          }),
        )
      } else if (this.tabItems[this.tab].value === 'StatefulSet') {
        data = await getStatefulSetList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.generateResourceSortParamValue(),
          }),
        )
      } else if (this.tabItems[this.tab].value === 'Deployment') {
        data = await getDeploymentList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.generateResourceSortParamValue(),
          }),
        )
      }
      const workloads = []
      data.List.forEach((item) => {
        workloads.push({
          workload: item,
        })
      })
      this.items = workloads
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.adviseList()
      this.watchWorkloadList()
      this.items = this.items.map((workload) => {
        return {
          ...workload.workload,
          ...workload,
        }
      })
      this.generateSelectResource()
    },
    watchWorkloadList() {
      const sub = {
        kind: 'objectChanged',
        content: {},
      }
      const watchWorkloadList = []
      this.items.forEach((workload) => {
        watchWorkloadList.push(
          `${workload.workload.metadata.namespace}/${workload.workload.metadata.name}`,
        )
      })
      sub.content[this.ThisCluster] = {}
      sub.content[this.ThisCluster][this.tabItems[this.tab].value] =
        watchWorkloadList
      if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
        this.MessageStreamWS.send(JSON.stringify(sub))
      }
    },
    async adviseList() {
      const params = {
        cluster: this.ThisCluster,
        namespace: this.ThisNamespace,
        workloadtype: this.tabItems[this.tab].value,
        noprocessing: true,
      }
      // 清空原来的建议
      this.adviseItems = {}
      const data = await getWorkloadResourcesList(params)
      if (data) {
        // advise list to map, ns+name=key
        data.forEach((advise) => {
          this.adviseItems[`${advise.Name}/${advise.Namespace}`] = advise
        })
        this.items.forEach((item, itemKey) => {
          const nameAndNs = `${item.workload.metadata.name}/${item.workload.metadata.namespace}`
          if (this.adviseItems[nameAndNs]) {
            item.advise = this.adviseItems[nameAndNs]
            this.$set(this.items, itemKey, item)
          }
        })
      }
    },
    async clearAdvise(advise) {
      await deleteWorkloadResourceAdvise(advise.ID)
      const index = this.items.findIndex((item) => {
        return item.advise && item.advise.Name === advise.Name
      })
      if (index >= -1) {
        const item = this.items[index]
        this.$delete(item, 'advise')
        this.$set(this.items, index, item)
      }
    },
    workloadDetail(item) {
      this.$router.push({
        name: 'workload-detail',
        params: {
          name: item.metadata.name,
        },
        query: {
          type: this.tabItems[this.tab].value,
          namespace: item.metadata.namespace,
        },
      })
    },
    updateWorkload(item) {
      const kind = this.tabItems[this.tab].value
      this.$refs.updateWorkload.init(item, kind)
      this.$refs.updateWorkload.open()
    },
    removeWorkload(item) {
      if (this.tabItems[this.tab].value === 'DaemonSet') {
        this.$store.commit('SET_CONFIRM', {
          title: `删除守护进程服务`,
          content: {
            text: `删除守护进程服务 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteDaemonSet(
                this.ThisCluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              )
              this.workloadList()
            }
          },
        })
      } else if (this.tabItems[this.tab].value === 'StatefulSet') {
        this.$store.commit('SET_CONFIRM', {
          title: `删除有状态服务`,
          content: {
            text: `删除有状态服务 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteStatefulSet(
                this.ThisCluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              )
              this.workloadList()
            }
          },
        })
      } else if (this.tabItems[this.tab].value === 'Deployment') {
        this.$store.commit('SET_CONFIRM', {
          title: `删除无状态服务`,
          content: {
            text: `删除无状态服务 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteDeployment(
                this.ThisCluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              )
              this.workloadList()
            }
          },
        })
      }
    },
    scaleResourceLimit(item, kind, adviseItem) {
      this.$refs.resourceLimit.init(item, kind, adviseItem)
      this.$refs.resourceLimit.open()
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

<style lang="scss" scoped>
.waiting-flashing {
  animation-name: animate-waiting-flash;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes animate-waiting-flash {
  from {
    background-color: #fb8c00;
  }
  to {
    background-color: white;
  }
}
</style>
