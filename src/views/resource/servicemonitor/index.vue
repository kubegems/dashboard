<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '采集器名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-spacer />
        <v-menu
          v-if="m_permisson_resourceAllow"
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
                  @click="addServiceMonitor"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建采集器
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="
                    batchRemoveResource(
                      '采集器',
                      'ServiceMonitor',
                      serviceMonitorList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除采集器
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
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
            color="primary"
            hide-details
            @click.stop
            @change="onResourceChange($event, item, index)"
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="serviceMonitorDetail(item)"
          >
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.service`]="{ item }">
          {{ showSvc(item) }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.port`]="{ item }">
          {{ showPort(item) }}
        </template>
        <template #[`item.path`]="{ item }">
          {{
            item.spec.endpoints.length > 0 && item.spec.endpoints[0].path
              ? item.spec.endpoints[0].path
              : ''
          }}
        </template>
        <template #[`item.createAt`]="{ item }">
          {{
            item.metadata.creationTimestamp
              ? $moment(item.metadata.creationTimestamp).format('lll')
              : ''
          }}
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
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateServiceMonitor(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeServiceMonitor(item)"
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
        @loaddata="serviceMonitorList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddServiceMonitor
      ref="addServiceMonitor"
      @refresh="serviceMonitorList"
    />
    <UpdateServiceMonitor
      ref="updateServiceMonitor"
      @refresh="serviceMonitorList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getServiceMonitorList, deleteServiceMonitor } from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import AddServiceMonitor from './components/AddServiceMonitor'
import UpdateServiceMonitor from './components/UpdateServiceMonitor'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'ServiceMonitorList',
  components: {
    AddServiceMonitor,
    UpdateServiceMonitor,
    NamespaceFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '采集器',
      tip: '采集器 (ServiceMonitor) 为一组服务定义监控, 自动被Prometheus发现, 成为其指标拉取目标Target。',
      icon: 'mdi-eyedropper',
    },
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '采集器名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    headers() {
      const items = [
        { text: '采集器名', value: 'name', align: 'start' },
        // { text: '关联服务', value: 'service', align: 'start', sortable: false },
        { text: '采集端口', value: 'port', align: 'start', sortable: false },
        { text: '采集路径', value: 'path', align: 'start', sortable: false },
        { text: '创建时间', value: 'createAt', align: 'center' },
      ]
      if (this.m_permisson_resourceAllow) {
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
          this.serviceMonitorList()
        }
      },
      deep: true,
    },
    sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.serviceMonitorList(true)
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
        Object.assign(this.params, convertStrToNum(this.$route.query))
        this.serviceMonitorList()
      })
    }
  },
  methods: {
    async serviceMonitorList(noprocess = false) {
      const data = await getServiceMonitorList(
        this.ThisCluster,
        this.ThisNamespace,
        Object.assign(this.params, {
          noprocessing: noprocess,
          sort: this.generateResourceSortParamValue(),
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.generateSelectResource()
    },
    serviceMonitorDetail(item) {
      this.$router.push({
        name: 'servicemonitor-detail',
        params: {
          name: item.metadata.name,
        },
        query: {
          namespace: item.metadata.namespace,
        },
      })
    },
    addServiceMonitor() {
      this.$refs.addServiceMonitor.open()
    },
    updateServiceMonitor(item) {
      this.$refs.updateServiceMonitor.init(item)
      this.$refs.updateServiceMonitor.open()
    },
    removeServiceMonitor(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除采集器`,
        content: {
          text: `删除采集器 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteServiceMonitor(
              this.ThisCluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.serviceMonitorList()
          }
        },
      })
    },
    showPort(item) {
      if (item.spec.endpoints.length > 0 && item.spec.endpoints[0].port) {
        return item.spec.endpoints[0].port
      } else if (
        item.spec.endpoints.length > 0 &&
        item.spec.endpoints[0].targetPort
      ) {
        return item.spec.endpoints[0].targetPort
      } else {
        return ''
      }
    },
    showSvc(item) {
      if (item.metadata.labels && item.metadata.labels[`svc`]) {
        return item.metadata.labels[`svc`]
      } else {
        // TODO: 非手动创建的ServiceMonitor需要通过label匹配,先获取所有服务, 然后从中过滤出服务,暂缓
        return ''
      }
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
