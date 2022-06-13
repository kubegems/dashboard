<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '用户名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addUser">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建用户
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveNotK8SResource('用户', 'User', userList)">
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
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-select
        @toggle-select-all="m_table_onNotK8SResourceToggleSelect($event, 'ID')"
      >
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="m_table_batchResources[item.ID].checked"
            color="primary"
            hide-details
            @change="m_table_onNotK8SResourceChange($event, item, 'ID')"
            @click.stop
          />
        </template>
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
          <v-chip class="mr-1" pill small>
            <v-avatar left>
              <v-btn class="white--text" color="grey lighten-4" small>
                <BaseLogo
                  class="primary--text logo-margin mt-1"
                  :icon-name="item.SourceVendor ? item.SourceVendor.toLowerCase() : 'kubegems'"
                  :ml="0"
                  :width="20"
                />
              </v-btn>
            </v-avatar>
            <span class="font-weight-medium kubegems__text">
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
            <v-icon color="primary" small> fas fa-check-circle </v-icon>
            正常
          </span>
          <span v-else>
            <v-icon color="error" small>fas fa-minus-circle</v-icon>
            禁用
          </span>
        </template>
        <template #[`item.role`]="{ item }">
          {{ item.SystemRole === null ? '普通用户' : item.SystemRole.RoleName }}
        </template>
        <template #[`item.lastLoginAt`]="{ item }">
          {{ item.LastLoginAt === null ? '--' : $moment(item.LastLoginAt).format('lll') }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt === null ? '--' : $moment(item.CreatedAt).format('lll') }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu :attach="`#r${item.ID}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateRole(item)"> 角色 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="warning" small text @click="resetPassword(item)"> 重设密码 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeUser(item)"> 删除 </v-btn>
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
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="userList"
      />
    </v-card>

    <UpdateRole ref="updateRole" @refresh="userList" />
    <AddUser ref="addUser" @refresh="userList" />
    <ResetPassword ref="resetPassword" @refresh="userList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddUser from './components/AddUser';
  import ResetPassword from './components/ResetPassword';
  import UpdateRole from './components/UpdateRole';

  import { getUserList, deleteUser } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'User',
    components: {
      AddUser,
      ResetPassword,
      UpdateRole,
    },
    mixins: [BaseFilter, BaseResource, BaseTable],
    data: () => ({
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
        Object.assign(this.params, convertStrToNum(this.$route.query));
        this.userList();
      }
    },
    methods: {
      async userList() {
        const data = await getUserList(this.params);
        this.items = data.List.map((item) => {
          return {
            name: item.Username,
            ...item,
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.m_table_generateSelectResourceNoK8s('ID');
      },
      updateRole(item) {
        this.$refs.updateRole.init(item);
        this.$refs.updateRole.open();
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
            await deleteUser(param.item.ID);
            this.userList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      addUser() {
        this.$refs.addUser.open();
      },
      resetPassword(item) {
        this.$refs.resetPassword.init(item.ID);
        this.$refs.resetPassword.open();
      },
    },
  };
</script>
