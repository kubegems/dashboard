<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '租户名称', value: 'search' }"
          @refresh="filterList"
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
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  color="primary"
                  text
                  @click="addTenant"
                >
                  <v-icon left>mdi-account-multiple-plus</v-icon>
                  创建租户
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
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
        show-select
        @toggle-select-all="onNotK8SResourceToggleSelect($event, 'TenantID', 'ID')"
      >
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="batchResources[item.ID].checked"
            color="primary"
            hide-details
            @click.stop
            @change="onNotK8SResourceChange($event, item, 'TenantID', 'ID')"
          />
        </template>
        <template #[`item.tenantName`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="tenantDetail(item)"
          >
            {{ item.TenantName }}
          </a>
        </template>
        <template #[`item.isActive`]="{ item }">
          <span v-if="item.IsActive">
            <v-icon
              small
              color="primary"
            > fas fa-check-circle </v-icon>
            启用
          </span>
          <span v-else>
            <v-icon
              small
              color="error"
            > fas fa-minus-circle </v-icon>
            禁用
          </span>
        </template>
        <template #[`item.allocatedCpu`]="{ item }">
          {{ item.AllocatedCpu }} core
        </template>
        <template #[`item.allocatedMemory`]="{ item }">
          {{ item.AllocatedMemory }} Gi
        </template>
        <template #[`item.allocatedStorage`]="{ item }">
          {{ item.AllocatedStorage }} Gi
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #[`item.user`]="{ item }">
          {{ item.Users === null ? 0 : item.Users.length }}
        </template>
        <template #[`item.cluster`]="{ item }">
          {{ item.ResourceQuotas === null ? 0 : item.ResourceQuotas.length }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu
            left
            :attach="`#r${item.ID}`"
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
                    @click="updateTenant(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex v-if="item.IsActive">
                  <v-btn
                    color="error"
                    text
                    small
                    @click="forbidTenant(item)"
                  >
                    禁用
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="activeTenant(item)"
                  >
                    激活
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeTenant(item)"
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
        @loaddata="tenantList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddTenant
      ref="addTenant"
      @refresh="tenantList"
    />
    <UpdateTenant
      ref="updateTenant"
      @refresh="tenantList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getTenantList, putActiveTenant, putForbideTenant, deleteTenant } from '@/api'
import AddTenant from './components/AddTenant'
import UpdateTenant from './components/UpdateTenant'
import BaseSelect from '@/mixins/select'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import { sizeOfStorage, sizeOfCpu, convertStrToNum } from '@/utils/helpers'

export default {
  name: 'Tenant',
  components: {
    AddTenant,
    UpdateTenant,
  },
  mixins: [BaseFilter, BaseSelect, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '租户',
      tip: '租户(tenant)是一个组织您的项目和 DevOps 工程、管理资源访问权限以及在团队内部共享资源等的逻辑单元，可以作为团队工作的独立工作空间。',
      icon: 'mdi-account-switch',
    },
    items: [],
    headers: [
      { text: '名称', value: 'tenantName', align: 'start' },
      { text: '状态', value: 'isActive', align: 'start' },
      { text: '用户数', value: 'user', align: 'start' },
      { text: '集群数', value: 'cluster', align: 'start' },
      { text: '已分配CPU', value: 'allocatedCpu', align: 'start' },
      { text: '已分配内存', value: 'allocatedMemory', align: 'start' },
      { text: '已分配存储', value: 'allocatedStorage', align: 'start' },
      { text: '创建时间', value: 'createdAt', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '租户名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    if (this.JWT) {
      Object.assign(this.params, convertStrToNum(this.$route.query))
      this.tenantList()
    }
  },
  methods: {
    async tenantList() {
      const data = await getTenantList(this.params)
      data.List.forEach((t) => {
        t.AllocatedCpu = 0
        t.AllocatedMemory = 0
        t.AllocatedStorage = 0
        t.ResourceQuotas.forEach((r) => {
          t.AllocatedCpu += sizeOfCpu(r.Content['limits.cpu'])
          t.AllocatedMemory += sizeOfStorage(r.Content['limits.memory'])
          t.AllocatedStorage += sizeOfStorage(r.Content['requests.storage'])
        })
      })
      this.items = data.List.map((item) => {
        return {
          name: item.TenantName,
          ...item,
        }
      })
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.generateSelectResourceNoK8s('TenantID', 'ID')
    },
    addTenant() {
      this.$refs.addTenant.open()
    },
    updateTenant(item) {
      this.$refs.updateTenant.init(item)
      this.$refs.updateTenant.open()
    },
    tenantDetail(item) {
      this.$router.push({
        name: 'tenant-detail',
        params: { name: item.TenantName },
        query: { id: item.ID },
      })
    },
    forbidTenant(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `禁用租户`,
        content: { text: `禁用租户 ${item.TenantName}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await putForbideTenant(param.item.ID)
          this.tenantList()
        },
      })
    },
    activeTenant(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `激活租户`,
        content: { text: `激活租户 ${item.TenantName}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await putActiveTenant(param.item.ID)
          this.tenantList()
        },
      })
    },
    removeTenant(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除租户`,
        content: {
          text: `删除租户 ${item.TenantName}`,
          type: 'delete',
          name: item.TenantName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteTenant(param.item.ID)
          this.$store.commit('CLEAR_TENANT')
          await this.$store.dispatch('UPDATE_TENANT_DATA')
          this.tenantList()
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
