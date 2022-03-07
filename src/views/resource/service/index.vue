<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '服务名称', value: 'search' }"
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
                  @click="addService"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建服务
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="batchRemoveResource('服务', 'Service', serviceList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除服务
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
            @click="serviceDetail(item)"
          >
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.clusterIp`]="{ item }">
          {{
            item.spec.clusterIP !== 'None' ? item.spec.clusterIP : 'Headless'
          }}
        </template>
        <template #[`item.clusterType`]="{ item }">
          {{ item.spec.type }}
        </template>
        <template #[`item.ports`]="{ item }">
          <BaseCollapseChips
            :chips="item.services || []"
            single-line
            icon="mdi-directions-fork"
          />
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
                    @click="updateService(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeService(item)"
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
        @loaddata="serviceList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddService
      ref="addService"
      @refresh="serviceList"
    />
    <UpdateService
      ref="updateService"
      @refresh="serviceList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getServiceList, deleteService } from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import AddService from './components/AddService'
import UpdateService from './components/UpdateService'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'

export default {
  name: 'Service',
  components: {
    AddService,
    UpdateService,
    NamespaceFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '服务',
      tip: '服务 (Service) 是定义了一类容器组的逻辑集合和一个用于访问它们的策略。',
      icon: 'mdi-dns',
    },
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '服务名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    headers() {
      const items = [
        { text: '服务名', value: 'name', align: 'start' },
        {
          text: '服务地址',
          value: 'clusterIp',
          align: 'start',
          sortable: false,
        },
        {
          text: '服务类型',
          value: 'clusterType',
          align: 'start',
          sortable: false,
        },
        { text: '访问信息', value: 'ports', align: 'start', sortable: false },
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
          this.serviceList()
        }
      },
      deep: true,
    },
    sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.serviceList(true)
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
        this.serviceList()
      })
    }
  },
  methods: {
    async serviceList(noprocess = false) {
      const data = await getServiceList(
        this.ThisCluster,
        this.ThisNamespace,
        Object.assign(this.params, {
          noprocessing: noprocess,
          sort: this.generateResourceSortParamValue(),
        }),
      )
      data.List = data.List.map((d) => {
        const services = []
        d.spec.ports.forEach((s) => {
          if (s.nodePort !== undefined) {
            services.push(`${s.port}:${s.nodePort} ｜ ${s.protocol}`)
          } else {
            services.push(`${s.port} ｜ ${s.protocol}`)
          }
        })
        return { ...d, services: services }
      })
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.generateSelectResource()
    },
    serviceDetail(item) {
      this.$router.push({
        name: 'service-detail',
        params: {
          name: item.metadata.name,
        },
        query: {
          namespace: item.metadata.namespace,
        },
      })
    },
    addService() {
      this.$refs.addService.open()
    },
    updateService(item) {
      this.$refs.updateService.init(item)
      this.$refs.updateService.open()
    },
    removeService(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除服务`,
        content: {
          text: `删除服务 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteService(
              this.ThisCluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.serviceList()
          }
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
