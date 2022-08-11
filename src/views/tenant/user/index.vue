<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.username_or_email'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addUser">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.account')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveNotK8SResource($root.$t('resource.account'), 'User', userList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.account')]) }}
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
        :no-data-text="$root.$t('data.no_data')"
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
                  :icon-name="item.SourceVendor ? item.SourceVendor.toLocaleLowerCase() : 'kubegems'"
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
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ $t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mid-minus-circle </v-icon>
            {{ $t('status.disabled') }}
          </span>
        </template>
        <template #[`item.role`]="{ item }">
          {{
            item.SystemRole === null
              ? $root.$t('role.system.normal')
              : item.SystemRole.RoleCode === 'sysadmin'
              ? $root.$t('role.system.administrator')
              : $root.$t('role.system.normal')
          }}
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
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateRole(item)"> {{ $t('operate.role') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="warning" small text @click="resetPassword(item)"> {{ $t('operate.reset_pwd') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeUser(item)"> {{ $root.$t('operate.delete') }} </v-btn>
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
  import messages from './i18n';
  import { deleteUser, getUserList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'User',
    i18n: {
      messages: messages,
    },
    components: {
      AddUser,
      ResetPassword,
      UpdateRole,
    },
    mixins: [BaseFilter, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'username', align: 'start' },
          { text: this.$t('table.status'), value: 'isActive', align: 'start' },
          { text: this.$t('table.email'), value: 'email', align: 'start' },
          { text: this.$t('table.mobile'), value: 'phone', align: 'start' },
          { text: this.$t('table.role'), value: 'role', align: 'start' },
          { text: this.$t('table.last_login_at'), value: 'lastLoginAt', align: 'start' },
          { text: this.$t('table.registe_at'), value: 'createdAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
      filters() {
        return [{ text: this.$t('filter.username_or_email'), value: 'search', items: [] }];
      },
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
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.account')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.account')])} ${item.Username}`,
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
