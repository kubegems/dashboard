<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '租户名称', value: 'search' }"
          @refresh="m_filter_list"
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
      >
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
        <template #[`item.cpu`]="{ item }">
          {{ item.Cpu }} core
        </template>
        <template #[`item.memory`]="{ item }">
          {{ item.Memory }} Gi
        </template>
        <template #[`item.storage`]="{ item }">
          {{ item.Storage }} Gi
        </template>
        <template #[`item.allocatedCpu`]="{ item }">
          {{ item.AllocatedCpu ? item.AllocatedCpu.toFixed(1) : 0 }} core
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.CpuPercentage"
              height="15"
              :color="
                item.CpuPercentage
                  ? item.CpuPercentage < 60
                    ? 'primary'
                    : item.CpuPercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text">{{ item.CpuPercentage }}% </span>
            </v-progress-linear>
          </span>
        </template>
        <template #[`item.allocatedMemory`]="{ item }">
          {{ item.AllocatedMemory ? item.AllocatedMemory.toFixed(1) : 0 }} Gi
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.MemoryPercentage"
              height="15"
              :color="
                item.MemoryPercentage
                  ? item.MemoryPercentage < 60
                    ? 'primary'
                    : item.MemoryPercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text">{{ item.MemoryPercentage }}% </span>
            </v-progress-linear>
          </span>
        </template>
        <template #[`item.allocatedStorage`]="{ item }">
          {{ item.AllocatedStorage ? item.AllocatedStorage.toFixed(1) : 0 }} Gi
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :value="item.StoragePercentage"
              height="15"
              :color="
                item.StoragePercentage
                  ? item.StoragePercentage < 60
                    ? 'primary'
                    : item.StoragePercentage < 80
                      ? 'warning'
                      : 'red darken-1'
                  : 'primary'
              "
            >
              <span class="white--text">{{ item.StoragePercentage }}% </span>
            </v-progress-linear>
          </span>
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
import BaseTable from '@/mixins/table'
import { sizeOfStorage, sizeOfCpu, convertStrToNum } from '@/utils/helpers'

export default {
  name: 'Tenant',
  components: {
    AddTenant,
    UpdateTenant,
  },
  mixins: [BaseFilter, BaseSelect, BaseResource, BaseTable],
  data: () => ({
    items: [],
    headers: [
      { text: '名称', value: 'tenantName', align: 'start' },
      { text: '状态', value: 'isActive', align: 'start' },
      { text: '用户数', value: 'user', align: 'start' },
      { text: '集群数', value: 'cluster', align: 'start' },
      { text: '总CPU', value: 'cpu', align: 'start' },
      { text: '总内存', value: 'memory', align: 'start' },
      { text: '总存储', value: 'storage', align: 'start' },
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
      containAllocatedResourcequota: true,
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
        t.Cpu = 0
        t.Memory = 0
        t.Storage = 0
        t.ResourceQuotas.forEach((r) => {
          t.Cpu += sizeOfCpu(r.Content['limits.cpu'])
          t.Memory += sizeOfStorage(r.Content['limits.memory'])
          t.Storage += sizeOfStorage(r.Content['requests.storage'])
        })

        t.AllocatedCpu = t.AllocatedResourcequota ? sizeOfCpu(t.AllocatedResourcequota['requests.cpu']) : 0
        t.AllocatedMemory = t.AllocatedResourcequota ? sizeOfStorage(t.AllocatedResourcequota['requests.memory']) : 0
        t.AllocatedStorage = t.AllocatedResourcequota ? sizeOfStorage(t.AllocatedResourcequota['requests.storage']) : 0

        t.CpuPercentage = t.Cpu > 0 ? (t.AllocatedCpu / t.Cpu * 100).toFixed(1) : 0
        t.MemoryPercentage = t.Memory > 0 ? (t.AllocatedMemory / t.Memory * 100).toFixed(1) : 0
        t.StoragePercentage = t.Storage > 0 ? (t.AllocatedStorage / t.Storage * 100).toFixed(1) : 0
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
        params: Object.assign(this.$route.params, { name: item.TenantName }),
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
          this.$store.dispatch('UPDATE_TENANT_DATA')
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
