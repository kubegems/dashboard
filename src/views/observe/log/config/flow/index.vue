<template>
  <v-container
    fluid
    class="pa-0"
  >
    <v-card>
      <v-card-title class="px-0">
        <BaseFilter
          :filters="filters"
          :default="filters[0]"
          @refresh="onStaticFilter"
        />
        <v-spacer />
        <v-menu left>
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
          <v-card class="pa-2">
            <v-btn
              text
              block
              color="primary"
              @click="onCreate"
            >
              <v-icon left>mdi-plus</v-icon>
              创建采集器
            </v-btn>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text class="px-0">
        <v-data-table
          :headers="headers"
          :items="items"
          disable-sort
          hide-default-footer
          disable-pagination
          no-data-text="暂无数据"
        >
          <template #[`item.name`]="{ item }">
            <a
              class="text-subtitle-2"
              @click="onDetail(item)"
            >
              {{ item.metadata.name }}
            </a>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.metadata.namespace }}
          </template>
          <template #[`item.router`]="{ item }">
            <BaseCollapseChips
              :chips="[...(item.spec.globalOutputRefs || []), ...(item.spec.localOutputRefs || [])]"
              :count="1"
            />
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ $moment(item.metadata.creationTimestamp).format('lll') }}
          </template>
          <template #[`item.status`]="{ item }">
            <template v-if="item.status && item.status.active">
              <v-icon
                color="success"
                small
              >
                mdi-check-circle
              </v-icon>
              已激活
            </template>
            <template v-else>
              <v-icon
                color="error"
                small
              >
                mdi-alert-circle
              </v-icon>
              未激活
            </template>
          </template>
          <template #[`item.action`]="{ item }">
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
              <v-card class="pa-2">
                <v-btn
                  color="error"
                  block
                  text
                  small
                  :disabled="item.kind === 'ClusterFlow' && !AdminViewport"
                  @click="onDelete(item)"
                >
                  删除
                </v-btn>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
        <BasePagination
          v-if="pageCount > 1"
          v-model="params.page"
          :page-count="pageCount"
          :size="params.size"
          @loaddata="onStaticFilter"
          @changesize="onPageSizeChange"
          @changepage="onPageIndexChange"
        />
      </v-card-text>
    </v-card>

    <FlowBaseForm
      ref="flowBaseForm"
      :cluster="params.cluster"
      :namespace-items="namespaceItems"
      @finishSubmit="getFlowList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getClusterFlowsData,
  getFlowsData,
  // getFlowsDataByTenant,
  deleteFlowData,
  deleteClusterFlowData,
} from '@/api'
import FlowBaseForm from './components/FlowBaseForm'

export default {
  name: 'LogFlow',
  components: {
    FlowBaseForm,
  },
  data() {
    this.breadcrumb = {
      title: '日志采集器',
      tip: '日志采集器声明了当前环境下哪些应用的日志会被采集及解析规则',
      icon: 'mdi-arrange-send-backward',
    }

    this.filters = [
      { text: '名称', value: 'name', items: [] },
      { text: '类型', value: 'kind', items: [
        { text: 'Flow', value: 'Flow', parent: 'kind' },
        { text: 'ClusterFlow', value: 'ClusterFlow', parent: 'kind' },
      ] },
    ]

    this.headers = [
      { text: '名称', value: 'name', align: 'start' },
      { text: '类型', value: 'kind', align: 'start' },
      { text: '命名空间', value: 'namespace', align: 'start' },
      { text: '路由器', value: 'router', align: 'start' },
      { text: '创建时间', value: 'createAt', align: 'start', width: 200 },
      { text: '状态', value: 'status', align: 'start', width: 100 },
      { text: '', value: 'action', align: 'center', width: 20 },
    ]

    this.cacheAll = []
    this.cacheFilter = []

    return {
      items: [],
      namespaceItems: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        kind: undefined,
        name: undefined,
        cluster: undefined,
        namespace: undefined,
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  watch: {
    '$route.query': {
      handler (newValue) {
        const { cluster, namespace } = this.params
        const { cluster: newCluster, namespace: newNamespace } = newValue
        const needRefresh = cluster !== newCluster || namespace !== newNamespace
        this.params = { ...this.params, ...newValue }
        this.params.namespace = this.params.namespace || '_all'
        if (needRefresh) {
          this.getFlowList()
        } else {
          this.onStaticFilter()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async getFlowList () {
      const { cluster, namespace } = this.params
      if (!cluster || !namespace) return

      const params = [cluster, namespace, { page: 1, size: 999 }]
      const res = await Promise.all([
        getFlowsData(...params),
        getClusterFlowsData(...params),
      ])
      const list = res.reduce((pre, current) => pre.concat(current.List), [])
      // if (this.AdminViewport) {
      //   res = await Promise.all([
      //     getFlowsData(...params),
      //     getClusterFlowsData(...params),
      //   ])
      //   list = res.reduce((pre, current) => pre.concat(current.List), [])
      // } else {
      //   res = await Promise.all([
      //     getFlowsDataByTenant(cluster, this.Tenant().ID),
      //     getClusterFlowsData(...params),
      //   ])
      //   list = [...res[0], ...res[1].List]
      // }
      this.cacheAll = list.sort(
        (a, b) => Date.parse(b.metadata.creationTimestamp) - Date.parse(a.metadata.creationTimestamp),
      )
      this.onStaticFilter()
    },
    onStaticFilter (params) {
      if (params) {
        this.params.name = params.name
        this.params.kind = params.kind
        this.params.page = 1
      }
      const { kind, name, page, size } = this.params
      this.cacheFilter = this.cacheAll.filter(item => {
        const isName = !name || item.metadata.name.includes(name)
        const isKind = !kind || item.kind === kind
        return isName && isKind
      })
      this.pageCount = Math.ceil(this.cacheFilter.length / size)
      this.items = this.cacheFilter.slice((page - 1) * size, page * size)
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
      this.onStaticFilter()
    },
    onPageIndexChange(page) {
      this.params.page = page
      this.onStaticFilter()
    },
    onCreate() {
      this.$refs.flowBaseForm.create()
    },
    onDelete(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除采集器`,
        content: {
          text: `删除采集器 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        doFunc: async () => {
          if (item.kind === 'Flow') {
            await deleteFlowData(
              this.params.cluster,
              item.metadata.namespace,
              item.metadata.name,
            )
          } else {
            await deleteClusterFlowData(this.params.cluster, item.metadata.name)
          }
          this.getFlowList()
        },
      })
    },
    onDetail(item) {
      this.$router.push({
        name: this.AdminViewport ? 'admin-log-flow-detail' : 'log-flow-detail',
        params: {
          kind: item.kind,
          name: item.metadata.name,
        },
        query: {
          cluster: this.params.cluster,
          namespace: item.metadata.namespace,
        },
      })
    },
  },
}
</script>
