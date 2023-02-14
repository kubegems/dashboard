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
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.username_or_email'), value: 'search' }"
          :filters="filters"
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
                  {{ i18n.t('operate.create_c', [i18n.t('resource.account')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="batchDeleteUser">
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ i18n.t('operate.delete_c', [i18n.t('resource.account')]) }}
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
        item-key="ID"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-select
        @item-selected="selected"
        @toggle-select-all="toggleSelectAll"
      >
        <template #item.username="{ item }">
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
              {{ VENDOR[item.SourceVendor] || 'Selfhosted' }}
            </span>
          </v-chip>
        </template>
        <template #item.email="{ item }">
          {{ item.Email }}
        </template>
        <template #item.phone="{ item }">
          {{ item.Phone }}
        </template>
        <template #item.isActive="{ item }">
          <span v-if="item.IsActive">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ i18nLocal.t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mid-minus-circle </v-icon>
            {{ i18nLocal.t('status.disabled') }}
          </span>
        </template>
        <template #item.role="{ item }">
          {{
            item.SystemRole === null
              ? i18n.t('role.system.normal')
              : item.SystemRole.RoleCode === 'sysadmin'
              ? i18n.t('role.system.administrator')
              : i18n.t('role.system.normal')
          }}
        </template>
        <template #item.lastLoginAt="{ item }">
          {{ item.LastLoginAt === null ? '--' : moment(item.LastLoginAt).format('lll') }}
        </template>
        <template #item.createdAt="{ item }">
          {{ item.CreatedAt === null ? '--' : moment(item.CreatedAt).format('lll') }}
        </template>
        <template #item.action="{ item }">
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
                  <v-btn color="primary" small text @click="updateRole(item)">
                    {{ i18nLocal.t('operate.role') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="warning" small text @click="resetPassword(item)">
                    {{ i18nLocal.t('operate.reset_pwd') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeUser(item)"> {{ i18n.t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getUserList"
      />
    </v-card>

    <UpdateRole ref="role" @refresh="getUserList" />
    <AddUser ref="user" @refresh="getUserList" />
    <ResetPassword ref="password" @refresh="getUserList" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onMounted, reactive, ref, watch } from 'vue';

  import AddUser from './components/AddUser.vue';
  import ResetPassword from './components/ResetPassword.vue';
  import UpdateRole from './components/UpdateRole.vue';
  import { useI18n } from './i18n';
  import { useUserPagination } from '@/composition/user';
  import { VENDOR } from '@/constants/platform';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { useStore } from '@/store';
  import { User } from '@/types/user';
  import { deepCopy } from '@/utils/helpers';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'username', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'isActive', align: 'start' },
    { text: i18nLocal.t('table.email'), value: 'email', align: 'start' },
    { text: i18nLocal.t('table.mobile'), value: 'phone', align: 'start' },
    { text: i18nLocal.t('table.role'), value: 'role', align: 'start' },
    { text: i18nLocal.t('table.last_login_at'), value: 'lastLoginAt', align: 'start' },
    { text: i18nLocal.t('table.registe_at'), value: 'createdAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<User> = reactive<Pagination<User>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getUserList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<User> = await useUserPagination(new User(), params.page, params.size, params.search);
    pagination = Object.assign(pagination, data);
  };

  onMounted(() => {
    getUserList();
  });

  const filters = [{ text: i18nLocal.t('filter.username_or_email'), value: 'search', items: [] }];

  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      getUserList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const user = ref(null);
  const addUser = (): void => {
    user.value.open();
  };

  const role = ref(null);
  const updateRole = (item: User): void => {
    role.value.init(item);
    role.value.open();
  };

  const password = ref(null);
  const resetPassword = (item: User): void => {
    password.value.init(item.ID);
    password.value.open();
  };

  const removeUser = async (item: User): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.account')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.account')])} ${item.Username}`,
        type: 'delete',
        name: item.Username,
      },
      param: { item },
      doFunc: async (param) => {
        await new User(param.item).deleteUser();
        getUserList();
      },
    });
  };

  const selectedUserList = ref<User[]>([]);
  const toggleSelectAll = (params: { items: User[]; value: boolean }): void => {
    if (params.value) {
      selectedUserList.value = deepCopy(params.items);
    } else {
      selectedUserList.value = [];
    }
  };
  const selected = (params: { item: User; value: boolean }): void => {
    const index = selectedUserList.value.findIndex((u) => {
      return u.ID === params.item.ID;
    });
    if (params.value) {
      if (index === -1) selectedUserList.value.push(params.item);
    } else {
      if (index > -1) selectedUserList.value.splice(index, 1);
    }
  };

  const batchDeleteUser = (): void => {
    if (selectedUserList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18n.t('resource.account')]),
        color: 'warning',
      });
      return;
    }
    const resources: string[] = selectedUserList.value.map((c: User) => c.Username);
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.batch_delete_c', [i18n.t('resource.account')]),
      content: {
        text: resources.join(','),
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in selectedUserList.value) {
          const user = selectedUserList.value[index];
          try {
            await new User(user).deleteUser();
            store.commit('SET_CONFIRM_STATUS', {
              key: user.Username,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: user.Username,
              value: false,
            });
          }
        }
        getUserList();
      },
    });
  };
</script>
