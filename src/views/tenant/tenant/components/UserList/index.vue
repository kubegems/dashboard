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
      <BaseSubTitle :divider="false" :pl="0" :title="i18n.t('resource.tenant_c', [i18n.t('resource.member')])">
        <template #header>
          <span class="text-caption grey--text"> {{ i18nLocal.t('user.tip.user_count', [pagination.total]) }} </span>
        </template>
        <template #action>
          <v-btn class="float-right" color="primary" small text @click="addUser">
            <v-icon left small> mdi-account-plus </v-icon>
            {{ i18n.t('operate.add_c', [i18n.t('resource.member')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.isActive="{ item }">
          <span v-if="item.IsActive">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ i18nLocal.t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
            {{ i18nLocal.t('status.disabled') }}
          </span>
        </template>
        <template #item.username="{ item }">
          {{ item.Username }}
        </template>
        <template #item.role="{ item }">
          {{ item.Role === 'ordinary' ? i18n.t('role.tenant.ordinary') : i18n.t('role.tenant.admin') }}
        </template>
        <template #item.lastLoginAt="{ item }">
          {{ item.LastLoginAt === null ? '--' : moment(item.LastLoginAt).format('lll') }}
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
              <v-card-text class="pa-2 text-center">
                <v-flex v-if="item.Role === 'ordinary'">
                  <v-btn color="primary" small text @click="setAdmin(item)">
                    {{ i18nLocal.t('operate.set_admin') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="setOrdinary(item)">
                    {{ i18nLocal.t('operate.set_ordinary') }}
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
        v-if="pagination.pageCount > 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getUserList"
      />
    </v-card-text>

    <AddUser ref="add" @refresh="getUserList" />
  </v-card>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import AddUser from './AddUser.vue';
  import { useTenantUserPagination } from '@/composition/tenant';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { ResourceRole } from '@/types/role';
  import { Tenant } from '@/types/tenant';
  import { User } from '@/types/user';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      tenant?: Tenant;
    }>(),
    {
      tenant: undefined,
    },
  );

  const headers = [
    { text: i18nLocal.t('user.table.username'), value: 'username', align: 'start' },
    { text: i18nLocal.t('user.table.role'), value: 'role', align: 'start' },
    { text: i18nLocal.t('user.table.status'), value: 'isActive', align: 'start' },
    { text: i18nLocal.t('user.table.last_login_at'), value: 'lastLoginAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<User> = reactive<Pagination<User>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    total: 0,
  });

  const getUserList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<User> = await useTenantUserPagination(new Tenant(props.tenant), params.page, params.size);
    pagination = Object.assign(pagination, data);
  };

  watch(
    () => props.tenant,
    async (newValue) => {
      if (newValue) {
        getUserList();
      }
    },
    {
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

  const add = ref(null);
  const addUser = (): void => {
    add.value.open();
  };

  const setAdmin = async (item: User): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('user.tip.set_member_role'),
      content: {
        text: i18nLocal.t('user.tip.set_admin', [item.Username]),
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(props.tenant).updateUser(param.item, ResourceRole.Admin);
        getUserList();
      },
    });
  };

  const setOrdinary = async (item: User): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('user.tip.set_member_role'),
      content: {
        text: i18nLocal.t('user.tip.set_ordinary', [item.Username]),
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(props.tenant).updateUser(param.item, ResourceRole.Ordinary);
        getUserList();
      },
    });
  };

  const removeUser = async (item: User): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.member')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.member')])} ${item.Username}`,
        type: 'delete',
        name: item.Username,
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(props.tenant).deleteUser(param.item);
        getUserList();
      },
    });
  };
</script>
