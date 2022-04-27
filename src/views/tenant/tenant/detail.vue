<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
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
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateTenant"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <template v-if="tenant">
                  <v-flex v-if="tenant.IsActive">
                    <v-btn
                      color="error"
                      text
                      small
                      @click="forbidTenant"
                    >
                      禁用
                    </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn
                      color="primary"
                      text
                      small
                      @click="activeTenant"
                    >
                      启用
                    </v-btn>
                  </v-flex>
                </template>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeTenant"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="2"
        class="pt-0"
      >
        <v-card height="100%">
          <v-card-title class="text-h6 primary--text">
            {{ tenant ? tenant.TenantName : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                状态
              </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="tenant ? tenant.IsActive : false">
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
                  >fas fa-minus-circle</v-icon>
                  禁用
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                用户数
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ userTotal }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                创建时间
              </v-list-item-title>
              <v-list-item-subtitle>
                {{
                  tenant && tenant.CreatedAt
                    ? $moment(tenant.CreatedAt).format('lll')
                    : ''
                }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card>
          <v-card-text>
            <BaseSubTitle
              title="租户成员"
              :divider="false"
            >
              <template #header>
                <span class="text-caption grey--text">
                  共{{ userTotal }}人
                </span>
              </template>
              <template #action>
                <v-btn
                  small
                  text
                  color="primary"
                  class="float-right mr-2"
                  @click="addUser"
                >
                  <v-icon
                    left
                    small
                  >
                    mdi-account-plus
                  </v-icon>
                  添加成员
                </v-btn>
              </template>
            </BaseSubTitle>
            <v-data-table
              disable-sort
              :headers="userHeaders"
              :items="userItems"
              :page.sync="userParams.page"
              :items-per-page="userParams.size"
              no-data-text="暂无数据"
              hide-default-footer
            >
              <template #[`item.isActive`]="{ item }">
                <span v-if="item.IsActive">
                  <v-icon
                    small
                    color="primary"
                  > fas fa-check-circle </v-icon>
                  正常
                </span>
                <span v-else>
                  <v-icon
                    small
                    color="error"
                  >fas fa-minus-circle</v-icon>
                  禁用
                </span>
              </template>
              <template #[`item.username`]="{ item }">
                {{ item.Username }}
              </template>
              <template #[`item.role`]="{ item }">
                {{ item.Role === 'ordinary' ? '普通用户' : '租户管理员' }}
              </template>
              <template #[`item.lastLoginAt`]="{ item }">
                {{
                  item.LastLoginAt === null
                    ? '--'
                    : $moment(item.LastLoginAt).format('lll')
                }}
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
                    <v-card-text class="pa-2 text-center">
                      <v-flex v-if="item.Role === 'ordinary'">
                        <v-btn
                          color="primary"
                          text
                          small
                          @click="setAdmin(item)"
                        >
                          设置管理员
                        </v-btn>
                      </v-flex>
                      <v-flex v-else>
                        <v-btn
                          color="primary"
                          text
                          small
                          @click="setOrdinary(item)"
                        >
                          设置普通用户
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn
                          color="error"
                          text
                          small
                          @click="removeUser(item)"
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
              v-if="userPageCount > 1"
              v-model="userParams.page"
              :page-count="userPageCount"
              :size="userParams.size"
              @loaddata="tenantUserList"
              @changesize="onUserPageSizeChange"
              @changepage="onUserPageIndexChange"
            />
          </v-card-text>
        </v-card>
        <v-card class="mt-3">
          <v-card-text>
            <BaseSubTitle
              title="资源分配"
              :divider="false"
            >
              <template #header>
                <span>
                  <span class="ma-2 text-caption grey--text">
                    CPU:
                    <span class="text-subtitle-2">{{ allCpu }}</span>
                    core
                  </span>
                  <span class="ma-2 text-caption grey--text">
                    内存:
                    <span class="text-subtitle-2">{{ allMem }}</span>
                    Gi
                  </span>
                  <span class="ma-2 text-caption grey--text">
                    存储:
                    <span class="text-subtitle-2">{{ allStorage }}</span>
                    Gi
                  </span>
                </span>
              </template>
              <template #action>
                <v-btn
                  small
                  text
                  color="primary"
                  class="float-right mr-2"
                  @click="addResource"
                >
                  <v-icon
                    left
                    small
                  >
                    mdi-server-plus
                  </v-icon>
                  添加集群资源
                </v-btn>
              </template>
            </BaseSubTitle>
            <v-data-table
              disable-sort
              :headers="clusterHeaders"
              :items="clusterItems"
              :page.sync="clusterParams.page"
              :items-per-page="clusterParams.size"
              no-data-text="暂无数据"
              hide-default-footer
            >
              <template #[`item.clusterName`]="{ item }">
                {{ item.Cluster.ClusterName }}
              </template>
              <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
              <template #[`item.memory`]="{ item }">
                {{ item.Memory }} Gi
              </template>
              <template #[`item.storage`]="{ item }">
                {{ item.Storage }} Gi
              </template>
              <template #[`item.action`]="{ item }">
                <v-flex :id="`l${item.ID}`" />
                <v-menu
                  left
                  :attach="`#l${item.ID}`"
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
                          @click="scaleResource(item)"
                        >
                          资源调整
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn
                          color="primary"
                          text
                          small
                          @click="tenantMonitor(item)"
                        >
                          资源监控
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn
                          color="error"
                          text
                          small
                          @click="recycleTenantResourceQuota(item)"
                        >
                          回收集群
                        </v-btn>
                      </v-flex>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </v-data-table>
            <BasePagination
              v-if="clusterPageCount > 1"
              v-model="clusterParams.page"
              :page-count="clusterPageCount"
              :size="clusterParams.size"
              @loaddata="tenantResourceQuotaList"
              @changesize="onClusterPageSizeChange"
              @changepage="onClusterPageIndexChange"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddUser
      ref="addUser"
      @refresh="tenantUserList"
    />
    <AddResource
      ref="addResource"
      :clusters="clusterItems"
      @refresh="tenantResourceQuotaList"
    />
    <TenantMonitor ref="tenantMonitor" />
    <ScaleResource
      ref="scaleResource"
      @refresh="tenantResourceQuotaList"
    />
    <UpdateTenant
      ref="updateTenant"
      @refresh="tenantDetail"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getTenantDetail,
  deleteTenantUser,
  getTenantUserList,
  putChangeTenantUser,
  getTenantResourceQuotaList,
  putForbideTenant,
  putActiveTenant,
  deleteTenant,
  deleteTenantResourceQuota,
} from '@/api'
import AddUser from './components/AddUser'
import AddResource from './components/AddResource'
import TenantMonitor from './components/TenantMonitor'
import ScaleResource from './components/ScaleResource'
import UpdateTenant from './components/UpdateTenant'
import BaseSelect from '@/mixins/select'
import BaseFilter from '@/mixins/base_filter'
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'TenantDetail',
  components: {
    AddUser,
    AddResource,
    TenantMonitor,
    ScaleResource,
    UpdateTenant,
  },
  mixins: [BaseFilter, BaseSelect],
  data: () => ({
    breadcrumb: {
      title: '租户',
      tip: '租户(tenant)是一个组织您的项目和 DevOps 工程、管理资源访问权限以及在团队内部共享资源等的逻辑单元，可以作为团队工作的独立工作空间。',
      icon: 'mdi-account-switch',
    },
    tenant: null,
    userItems: [],
    userHeaders: [
      { text: '用户名', value: 'username', align: 'start' },
      { text: '角色', value: 'role', align: 'start' },
      { text: '状态', value: 'isActive', align: 'start' },
      { text: '最近登录', value: 'lastLoginAt', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    userPageCount: 0,
    userParams: {
      page: 1,
      size: 10,
      noprocessing: true,
    },
    userTotal: 0,
    clusterItems: [],
    clusterHeaders: [
      { text: '集群', value: 'clusterName', align: 'start' },
      { text: 'CPU', value: 'cpu', align: 'start' },
      { text: '内存', value: 'memory', align: 'start' },
      { text: '存储', value: 'storage', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    clusterPageCount: 0,
    clusterParams: {
      page: 1,
      size: 50,
    },
    allCpu: 0,
    allMem: 0,
    allStorage: 0,
    tenantid: 0,
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.tenantid = this.$route.query.id
        this.tenantDetail()
      })
    }
  },
  methods: {
    async tenantDetail() {
      const data = await getTenantDetail(this.tenantid)
      this.tenant = data
      this.tenantUserList()
      this.tenantResourceQuotaList()
    },
    async tenantUserList() {
      const data = await getTenantUserList(this.tenantid, this.userParams)
      this.userItems = data.List
      this.userPageCount = Math.ceil(data.Total / this.userParams.size)
      this.userParams.page = data.CurrentPage
      this.userTotal = data.Total
    },
    async tenantResourceQuotaList() {
      this.allCpu = 0
      this.allMem = 0
      this.allStorage = 0
      const data = await getTenantResourceQuotaList(this.tenantid, {
        noprocessing: true,
      })
      data.List.forEach((item) => {
        item.Cpu = item.Content['limits.cpu']
          ? sizeOfCpu(item.Content['limits.cpu'])
          : 0
        item.Memory = item.Content['limits.memory']
          ? sizeOfStorage(item.Content['limits.memory'])
          : 0
        item.Storage = item.Content['requests.storage']
          ? sizeOfStorage(item.Content['requests.storage'])
          : 0

        this.allCpu += item.Cpu
        this.allMem += item.Memory
        this.allStorage += item.Storage
      })
      this.clusterItems = data.List
      this.clusterPageCount = Math.ceil(data.Total / this.clusterParams.size)
      this.clusterParams.page = data.CurrentPage
    },
    addUser() {
      this.$refs.addUser.open()
    },
    addResource() {
      this.$refs.addResource.init(this.tenant)
      this.$refs.addResource.open()
    },
    tenantMonitor(item) {
      this.$refs.tenantMonitor.init(item)
      this.$refs.tenantMonitor.open()
    },
    scaleResource(item) {
      this.$refs.scaleResource.init(item)
      this.$refs.scaleResource.open()
    },
    setAdmin(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `设置租户成员角色`,
        content: {
          text: `设置租户成员 ${item.Username} 为管理员`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await putChangeTenantUser(parseInt(this.tenantid), param.item.ID, {
            UserID: param.item.ID,
            TenantID: parseInt(this.tenantid),
            Role: 'admin',
          })
          item.Role = 'admin'
        },
      })
    },
    setOrdinary(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `设置租户成员角色`,
        content: {
          text: `设置租户成员 ${item.Username} 为普通用户`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await putChangeTenantUser(parseInt(this.tenantid), param.item.ID, {
            UserID: param.item.ID,
            TenantID: parseInt(this.tenantid),
            Role: 'ordinary',
          })
          item.Role = 'ordinary'
        },
      })
    },
    removeUser(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除租户成员`,
        content: {
          text: `删除租户成员 ${item.Username}`,
          type: 'delete',
          name: item.Username,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteTenantUser(this.tenantid, param.item.ID)
          this.tenantUserList()
        },
      })
    },
    updateTenant() {
      this.$refs.updateTenant.init(this.tenant)
      this.$refs.updateTenant.open()
    },
    forbidTenant() {
      const item = this.tenant
      this.$store.commit('SET_CONFIRM', {
        title: `禁用租户`,
        content: { text: `禁用租户 ${item.TenantName}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await putForbideTenant(param.item.ID)
          this.tenantDetail()
        },
      })
    },
    activeTenant() {
      const item = this.tenant
      this.$store.commit('SET_CONFIRM', {
        title: `激活租户`,
        content: { text: `激活租户 ${item.TenantName}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await putActiveTenant(param.item.ID)
          this.tenantDetail()
        },
      })
    },
    recycleTenantResourceQuota(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `回收集群资源`,
        content: {
          text: `回收集群资源 ${item.Cluster.ClusterName}`,
          type: 'delete',
          name: item.Cluster.ClusterName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteTenantResourceQuota(
            param.item.TenantID,
            param.item.ClusterID,
          )
          this.tenantDetail()
        },
      })
    },
    removeTenant() {
      const item = this.tenant
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
          this.$router.push({ name: 'tenant-list' })
        },
      })
    },
    onUserPageSizeChange(size) {
      this.userParams.page = 1
      this.userParams.size = size
    },
    onUserPageIndexChange(page) {
      this.userParams.page = page
    },
    onClusterPageSizeChange(size) {
      this.clusterParams.page = 1
      this.clusterParams.size = size
    },
    onClusterPageIndexChange(page) {
      this.clusterParams.page = page
    },
  },
}
</script>
