<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '用户名称', value: 'search' }"
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
                  text
                  color="primary"
                  @click="addUser"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建用户
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="m_table_batchRemoveNotK8SResource('用户', 'User', userList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除用户
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
        @toggle-select-all="m_table_onNotK8SResourceToggleSelect($event, 'ID')"
      >
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="m_table_batchResources[item.ID].checked"
            color="primary"
            hide-details
            @click.stop
            @change="m_table_onNotK8SResourceChange($event, item, 'ID')"
          />
        </template>
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
          <v-chip
            pill
            class="mr-1"
            small
          >
            <v-avatar left>
              <v-btn
                color="grey lighten-4"
                class="white--text"
                small
              >
                <BaseLogo
                  class="primary--text logo-margin mt-1"
                  :icon-name="item.SourceVendor ? item.SourceVendor.toLowerCase() : 'kubegems'"
                  :width="20"
                  :ml="0"
                />
              </v-btn>
            </v-avatar>
            <span class="font-weight-medium kubegems__detail">
              {{ $VENDOR[item.SourceVendor] || 'Selfhosted' }}
            </span>
          </v-chip>
        </template>
        <template #[`item.email`]="{ item }">
          {{ item.Email }}
        </template>
        <template #[`item.phone`]="{ item }">
          {{ item.Phone }}
        </template>
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
        <template #[`item.role`]="{ item }">
          {{ item.SystemRole === null ? '普通用户' : item.SystemRole.RoleName }}
        </template>
        <template #[`item.lastLoginAt`]="{ item }">
          {{
            item.LastLoginAt === null
              ? '--'
              : $moment(item.LastLoginAt).format('lll')
          }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{
            item.CreatedAt === null
              ? '--'
              : $moment(item.CreatedAt).format('lll')
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
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateRole(item)"
                  >
                    角色
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="warning"
                    text
                    small
                    @click="resetPassword(item)"
                  >
                    重设密码
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
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="userList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <UpdateRole
      ref="updateRole"
      @refresh="userList"
    />
    <AddUser
      ref="addUser"
      @refresh="userList"
    />
    <ResetPassword
      ref="resetPassword"
      @refresh="userList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getUserList, deleteUser } from '@/api'
import UpdateRole from './components/UpdateRole'
import AddUser from './components/AddUser'
import ResetPassword from './components/ResetPassword'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BaseTable from '@/mixins/table'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'User',
  components: {
    UpdateRole,
    AddUser,
    ResetPassword,
  },
  mixins: [BaseFilter, BaseResource, BaseTable],
  data: () => ({
    breadcrumb: {
      title: '用户',
      tip: '平台所有用户(user)，包括系统管理员与普通成员。',
      icon: 'mdi-account',
    },
    items: [],
    headers: [
      { text: '名称', value: 'username', align: 'start' },
      { text: '状态', value: 'isActive', align: 'start' },
      { text: '邮箱', value: 'email', align: 'start' },
      { text: '手机号', value: 'phone', align: 'start' },
      { text: '角色', value: 'role', align: 'start' },
      { text: '最近登录', value: 'lastLoginAt', align: 'start' },
      { text: '注册时间', value: 'createdAt', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '用户名或邮箱', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT']),
  },
  mounted() {
    if (this.JWT) {
      Object.assign(this.params, convertStrToNum(this.$route.query))
      this.userList()
    }
  },
  methods: {
    async userList() {
      const data = await getUserList(this.params)
      this.items = data.List.map((item) => {
        return {
          name: item.Username,
          ...item,
        }
      })
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.m_table_generateSelectResourceNoK8s('ID')
    },
    updateRole(item) {
      this.$refs.updateRole.init(item)
      this.$refs.updateRole.open()
    },
    removeUser(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除用户`,
        content: {
          text: `删除用户 ${item.Username}`,
          type: 'delete',
          name: item.Username,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteUser(param.item.ID)
          this.userList()
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
    addUser() {
      this.$refs.addUser.open()
    },
    resetPassword(item) {
      this.$refs.resetPassword.init(item.ID)
      this.$refs.resetPassword.open()
    },
  },
}
</script>
