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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-account-settings"
    :title="i18n.t('resource.tenant_c', [i18n.t('resource.member')])"
    :width="900"
    @reset="reset"
  >
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle
            :title="i18n.t('resource.tenant_c', [i18n.t('resource.member_c', [i18n.t('resource.role')])])"
          />
          <v-tabs v-model="state.tab" class="pa-2" height="60px" vertical @change="tabChanged">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
            <v-tab-item v-for="(item, index) in tabItems" :key="index" :reverse-transition="false" :transition="false">
              <v-card flat>
                <v-row class="pa-0 ma-0">
                  <v-col class="py-1" cols="6">
                    <v-card elevation="2" flat height="550px">
                      <v-card-text>
                        <v-flex class="px-1 mb-2">{{ $root.$t('resource.account') }}</v-flex>
                        <v-text-field
                          v-model="searchForAll"
                          class="mx-1"
                          dense
                          hide-details
                          prepend-inner-icon="mdi-magnify"
                          @keyup="searchAllUser"
                        />
                        <v-list dense height="450px" :style="{ overflowY: 'auto' }">
                          <v-list-item
                            v-for="(user, index) in allUserItems"
                            :key="index"
                            link
                            @click="addRole(user, index)"
                          >
                            <v-list-item-avatar class="my-1">
                              <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                                {{ user.Username[0].toLocaleUpperCase() }}
                              </v-avatar>
                            </v-list-item-avatar>
                            <v-list-item-content class="text-subtitle-1">
                              {{ user.Username }}
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col class="py-1" cols="6">
                    <v-card elevation="2" flat height="550px">
                      <v-card-text>
                        <v-flex class="px-1 mb-2">
                          {{ state.tab === 0 ? i18n.t('role.tenant.ordinary') : i18n.t('role.tenant.admin') }}
                        </v-flex>
                        <v-text-field
                          v-model="searchForTenant"
                          class="mx-1"
                          dense
                          hide-details
                          prepend-inner-icon="mdi-magnify"
                          @keyup="searchTenantUser"
                        />
                        <v-list dense height="450px" :style="{ overflowY: 'auto' }">
                          <v-list-item
                            v-for="(user, index) in tenantUserItems.filter((t) => {
                              return t.Role === tabRole[state.tab];
                            })"
                            :key="index"
                            link
                            @click="removeRole(user, index)"
                          >
                            <v-list-item-avatar class="my-1">
                              <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                                {{ user.Username[0].toLocaleUpperCase() }}
                              </v-avatar>
                            </v-list-item-avatar>
                            <v-list-item-content class="text-subtitle-1">
                              {{ user.Username }}
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';

  import { useTenantUserList } from '@/composition/tenant';
  import { useUserList } from '@/composition/user';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { ResourceRole } from '@/types/role';
  import { Tenant } from '@/types/tenant';
  import { User } from '@/types/user';
  import { deepCopy } from '@/utils/helpers';

  const i18n = useGlobalI18n();
  const query = useQuery();

  const state = reactive({
    dialog: false,
    tab: 0,
  });

  const tabRole = {
    0: 'ordinary',
    1: 'admin',
  };

  const tabItems = [
    { text: i18n.t('role.tenant.ordinary'), value: 'ordinary' },
    { text: i18n.t('role.tenant.admin'), value: 'admin' },
  ];

  const open = (): void => {
    state.dialog = true;
  };

  const reset = (): void => {
    state.dialog = false;
  };

  const allUserItems = ref<User[]>([]);
  const allUserItemsCopy = ref<User[]>([]);
  const userList = async (): Promise<void> => {
    const data = await useUserList(new User());
    allUserItems.value = data.filter((d) => {
      return !tenantUserItems.value.find((u) => {
        return u.Username === d.Username;
      });
    });
    allUserItemsCopy.value = deepCopy(allUserItems.value);
  };

  const tenantUserItems = ref<User[]>([]);
  const tenantUserItemsCopy = ref<User[]>([]);
  const tenantUserList = async (): Promise<void> => {
    const data = await useTenantUserList(new Tenant({ ID: parseInt(query.value.id as string) }));
    tenantUserItems.value = data;
    tenantUserItemsCopy.value = deepCopy(tenantUserItems.value);
  };

  onMounted(async () => {
    await tenantUserList();
    await userList();
  });

  const tabChanged = async (): Promise<void> => {
    searchForAll.value = '';
    searchForTenant.value = '';
    await tenantUserList();
    await userList();
  };

  const searchForAll = ref<string>('');
  const searchAllUser = (): void => {
    allUserItems.value = allUserItemsCopy.value.filter((u) => {
      return u.Username.indexOf(searchForAll.value) > -1;
    });
  };

  const searchForTenant = ref<string>('');
  const searchTenantUser = (): void => {
    tenantUserItems.value = tenantUserItemsCopy.value.filter((u) => {
      return u.Username.indexOf(searchForTenant.value) > -1 && u.Role === tabRole[state.tab];
    });
  };

  const emit = defineEmits(['refresh']);
  const addRole = async (user, index): Promise<void> => {
    allUserItems.value.splice(index, 1);
    user.Role = state.tab === 0 ? ResourceRole.Ordinary : ResourceRole.Admin;
    tenantUserItems.value.push(user);
    await new Tenant({ ID: parseInt(query.value.id as string) }).addUser(user, user.Role);
    emit('refresh');
  };

  const removeRole = async (user, index): Promise<void> => {
    tenantUserItems.value = tenantUserItems.value.filter((u) => {
      return u.Role === tabRole[state.tab];
    });
    tenantUserItems.value.splice(index, 1);
    allUserItems.value.push(user);
    await new Tenant({ ID: parseInt(query.value.id as string) }).deleteUser(user);
    emit('refresh');
  };

  defineExpose({
    open,
  });
</script>
