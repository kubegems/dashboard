<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '路由名称', value: 'search' }"
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
                  @click="addIngress"
                >
                  <v-icon left>mdi-plus-network</v-icon>
                  创建路由
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="m_table_batchRemoveResource('路由', 'Ingress', ingressList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除路由
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
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
        @toggle-select-all="m_table_onResourceToggleSelect"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="
              m_table_batchResources[`${item.metadata.name}-${index}`].checked
            "
            color="primary"
            hide-details
            @click.stop
            @change="m_table_onResourceChange($event, item, index)"
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="ingressDetail(item)"
          >
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.address`]="{ item }">
          <template v-for="(rule, index) in item.spec.rules">
            <template
              v-for="(path, i) in rule.http.paths"
            >
              <v-flex
                :key="`c${index}http${i}`"
                class="mx-1"
              >
                {{ getHost(rule, item)
                }}{{
                  getGatewayPort(
                    getSchema(rule, item),
                    item.spec.ingressClassName,
                  )
                }}{{ path.path }}
                <v-btn
                  :key="`i${index}http${i}`"
                  small
                  icon
                  @click="
                    toAddress(
                      `${getHost(rule, item)}${getGatewayPort(
                        getSchema(rule, item),
                        item.spec.ingressClassName,
                      )}${path.path}`,
                    )
                  "
                >
                  <v-icon
                    small
                    color="success"
                  >
                    mdi-open-in-new
                  </v-icon>
                </v-btn>
              </v-flex>
            </template>
          </template>
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
                    @click="updateIngress(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeIngress(item)"
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
        @loaddata="ingressList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddIngress
      ref="addIngress"
      @refresh="ingressList"
    />
    <UpdateIngress
      ref="updateIngress"
      @refresh="ingressList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getIngressList, deleteIngress, getGatewayList } from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import AddIngress from './components/AddIngress'
import UpdateIngress from './components/UpdateIngress'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import BaseTable from '@/mixins/table'

export default {
  name: 'Ingress',
  components: {
    AddIngress,
    UpdateIngress,
    NamespaceFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '路由名称', value: 'search', items: [] }],
    gateway: {},
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    headers() {
      const items = [
        { text: '名称', value: 'name', align: 'start' },
        { text: '访问地址', value: 'address', align: 'start', sortable: false },
        { text: '创建时间', value: 'createAt', align: 'start' },
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
          this.ingressList()
        }
      },
      deep: true,
    },
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.ingressList(true)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.JWT) {
      if (this.ThisCluster === '') {
        this.$store.commit('SET_SNACKBAR', {
          text: `请创建或选择集群`,
          color: 'warning',
        })
        return
      }
      this.$nextTick(() => {
        this.m_table_generateParams()
        this.ingressList()
      })
    }
  },
  methods: {
    async ingressList(noprocess = false) {
      const data = await getIngressList(
        this.ThisCluster,
        this.ThisNamespace,
        Object.assign(this.params, {
          noprocessing: noprocess,
          sort: this.m_table_generateResourceSortParamValue(),
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.m_table_generateSelectResource()
      this.gatewayList()
    },
    addIngress() {
      this.$refs.addIngress.open()
    },
    updateIngress(item) {
      this.$refs.updateIngress.init(item)
      this.$refs.updateIngress.open()
    },
    ingressDetail(item) {
      this.$router.push({
        name: 'ingress-detail',
        params: {
          name: item.metadata.name,
        },
        query: {
          namespace: item.metadata.namespace,
        },
      })
    },
    removeIngress(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除路由`,
        content: {
          text: `删除路由 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteIngress(
              this.ThisCluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.ingressList()
          }
        },
      })
    },
    async gatewayList() {
      const data = await getGatewayList(
        this.AdminViewport ? '_all' : this.Tenant().ID,
        this.ThisClusterID,
        {
          size: 1000,
          noprocessing: true,
        },
      )
      this.gateway = {}
      data.forEach((d) => {
        this.gateway[d.spec.ingressClass] = d
      })
    },
    getSchema(rule, item) {
      let prefix = 'http'
      if (item.spec.tls) {
        item.spec.tls.forEach((t) => {
          const i = t.hosts.findIndex((h) => {
            return h === rule.host
          })
          if (i > -1) {
            prefix = 'https'
            return
          }
        })
      }
      return prefix
    },
    getHost(rule, item) {
      let prefix = 'http'
      if (item.spec.tls) {
        item.spec.tls.forEach((t) => {
          const i = t.hosts.findIndex((h) => {
            return h === rule.host
          })
          if (i > -1) {
            prefix = 'https'
            return
          }
        })
      }
      return `${prefix}://${rule.host}`
    },
    getGatewayPort(type, name) {
      const gateway = this.gateway[name]
      if (gateway && gateway.status) {
        if (type === 'http') {
          const g = gateway.status.ports.find((g) => {
            return g.name === 'http'
          })
          if (g) return `:${g.nodePort}`
          return ''
        } else if (type === 'https') {
          const g = gateway.status.ports.find((g) => {
            return g.name === 'https'
          })
          if (g) return `:${g.nodePort}`
          return ''
        }
      }
      return ''
    },
    toAddress(address) {
      window.open(address)
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
