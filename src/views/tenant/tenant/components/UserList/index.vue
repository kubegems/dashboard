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
  <v-card>
    <v-card-text>
      <BaseSubTitle :divider="false" :pl="0" :title="$root.$t('resource.tenant_c', [$root.$t('resource.member')])">
        <template #header>
          <span class="text-caption grey--text"> {{ $t('user.tip.user_count', [total]) }} </span>
        </template>
        <template #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addUser">
            <v-icon left small> mdi-account-plus </v-icon>
            {{ $root.$t('operate.add_c', [$root.$t('resource.member')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.isActive`]="{ item }">
          <span v-if="item.IsActive">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ $t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
            {{ $t('status.disabled') }}
          </span>
        </template>
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
        </template>
        <template #[`item.role`]="{ item }">
          {{ item.Role === 'ordinary' ? $root.$t('role.tenant.ordinary') : $root.$t('role.tenant.admin') }}
        </template>
        <template #[`item.lastLoginAt`]="{ item }">
          {{ item.LastLoginAt === null ? '--' : $moment(item.LastLoginAt).format('lll') }}
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
              <v-card-text class="pa-2 text-center">
                <v-flex v-if="item.Role === 'ordinary'">
                  <v-btn color="primary" small text @click="setAdmin(item)"> {{ $t('operate.set_admin') }} </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="setOrdinary(item)">
                    {{ $t('operate.set_ordinary') }}
                  </v-btn>
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
        v-if="pageCount > 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onUserPageIndexChange"
        @changesize="onUserPageSizeChange"
        @loaddata="tenantUserList"
      />
    </v-card-text>

    <AddUser ref="addUser" @refresh="tenantUserList" />
  </v-card>
</template>

<script>
  import messages from '../../i18n';
  import AddUser from './AddUser';
  import { deleteTenantUser, getTenantUserList, putChangeTenantUser } from '@/api';

  export default {
    name: 'UserList',
    i18n: {
      messages: messages,
    },
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
      };
    },
    computed: {
      headers() {
        return [
          { text: this.$t('user.table.username'), value: 'username', align: 'start' },
          { text: this.$t('user.table.role'), value: 'role', align: 'start' },
          { text: this.$t('user.table.status'), value: 'isActive', align: 'start' },
          { text: this.$t('user.table.last_login_at'), value: 'lastLoginAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    watch: {
      tenant: {
        handler(newValue) {
          if (newValue) {
            this.tenantUserList();
          }
        },
        deep: true,
      },
    },
    methods: {
      async tenantUserList() {
        const data = await getTenantUserList(this.tenant.ID, this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.total = data.Total;
      },
      addUser() {
        this.$refs.addUser.open();
      },
      setAdmin(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('user.tip.set_member_role'),
          content: {
            text: this.$t('user.tip.set_admin', [item.Username]),
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putChangeTenantUser(parseInt(this.tenant.ID), param.item.ID, {
              UserID: param.item.ID,
              TenantID: parseInt(this.tenant.ID),
              Role: 'admin',
            });
            item.Role = 'admin';
          },
        });
      },
      setOrdinary(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('user.tip.set_member_role'),
          content: {
            text: this.$t('user.tip.set_ordinary', [item.Username]),
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putChangeTenantUser(parseInt(this.tenant.ID), param.item.ID, {
              UserID: param.item.ID,
              TenantID: parseInt(this.tenant.ID),
              Role: 'ordinary',
            });
            item.Role = 'ordinary';
          },
        });
      },
      removeUser(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.member')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.member')])} ${item.Username}`,
            type: 'delete',
            name: item.Username,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteTenantUser(this.tenant.ID, param.item.ID);
            this.tenantUserList();
          },
        });
      },
      onUserPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onUserPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
