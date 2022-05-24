<template>
  <v-card>
    <v-card-text>
      <BaseSubTitle
        title="租户成员"
        :divider="false"
      >
        <template #header>
          <span class="text-caption grey--text">
            共{{ total }}人
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
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
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
        v-if="pageCount > 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="tenantUserList"
        @changesize="onUserPageSizeChange"
        @changepage="onUserPageIndexChange"
      />
    </v-card-text>

    <AddUser
      ref="addUser"
      @refresh="tenantUserList"
    />
  </v-card>
</template>

<script>
import {
  deleteTenantUser,
  getTenantUserList,
  putChangeTenantUser,
} from '@/api'
import AddUser from './AddUser'

export default {
  name: 'UserList',
  components: {
    AddUser,
  },
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
      total: 0,
      headers: [
        { text: '用户名', value: 'username', align: 'start' },
        { text: '角色', value: 'role', align: 'start' },
        { text: '状态', value: 'isActive', align: 'start' },
        { text: '最近登录', value: 'lastLoginAt', align: 'start' },
        { text: '', value: 'action', align: 'center', width: 20 },
      ],
    }
  },
  watch: {
    tenant: {
      handler(newValue) {
        if (newValue) {
          this.tenantUserList()
        }
      },
      deep: true,
    },
  },
  methods: {
    async tenantUserList() {
      const data = await getTenantUserList(this.tenant.ID, this.params)
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.total = data.Total
    },
    addUser() {
      this.$refs.addUser.open()
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
          await putChangeTenantUser(parseInt(this.tenant.ID), param.item.ID, {
            UserID: param.item.ID,
            TenantID: parseInt(this.tenant.ID),
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
          await putChangeTenantUser(parseInt(this.tenant.ID), param.item.ID, {
            UserID: param.item.ID,
            TenantID: parseInt(this.tenant.ID),
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
          await deleteTenantUser(this.tenant.ID, param.item.ID)
          this.tenantUserList()
        },
      })
    },
    onUserPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onUserPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>

