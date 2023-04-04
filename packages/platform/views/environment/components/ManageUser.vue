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
    :title="i18n.t('resource.environment_c', [i18n.t('resource.member')])"
    :width="900"
    @reset="reset"
  >
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle
            :title="i18n.t('resource.environment_c', [i18n.t('resource.member_c', [i18n.t('resource.role')])])"
          />
          <v-tabs v-model="tab" class="pa-2" height="60px" vertical @change="tabChanged">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
            <v-tab-item v-for="item in tabItems" :key="item.value" :reverse-transition="false" :transition="false">
              <v-row class="pa-0 ma-0">
                <v-col class="py-1" cols="6">
                  <v-card elevation="2" flat height="550px">
                    <v-card-text>
                      <v-flex class="px-1 mb-2">
                        {{ i18n.t('resource.project_c', [i18n.t('resource.member')]) }}
                      </v-flex>
                      <v-text-field
                        v-model="searchAllUser"
                        class="mx-1"
                        dense
                        hide-details
                        prepend-inner-icon="mdi-magnify"
                        @keyup="allUsernameInput"
                      />
                      <v-list dense height="450px" :style="{ overflowY: `auto` }">
                        <v-list-item v-for="(user, index) in allUsers" :key="index" link @click="setRole(user, index)">
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
                        {{ tab === 0 ? i18n.t('role.environment.reader') : i18n.t('role.environment.operator') }}
                      </v-flex>
                      <v-text-field
                        v-model="searchRoleUser"
                        class="mx-1"
                        dense
                        hide-details
                        prepend-inner-icon="mdi-magnify"
                        @keyup="roleUsernameInput"
                      />
                      <v-list dense height="450px" :style="{ overflowY: `auto` }">
                        <v-list-item v-for="(user, index) in users" :key="index" link @click="removeRole(user, index)">
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
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useEnvironmentUserList } from '@kubegems/api/hooks/environment';
  import { useProjectUserList } from '@kubegems/api/hooks/project';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Project } from '@kubegems/api/typed/project';
  import { ResourceRole } from '@kubegems/api/typed/role';
  import { User } from '@kubegems/api/typed/user';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
  });

  const tab = ref(0);
  const tabItems = [
    { text: i18n.t('role.environment.reader'), value: 'reader' },
    { text: i18n.t('role.environment.operator'), value: 'operator' },
  ];
  const tabRole = {
    0: 'reader',
    1: 'operator',
  };

  const users = ref<User[]>([]);
  const usersCopy = ref<User[]>([]);
  const getEnvironmentUserList = async () => {
    const data = await useEnvironmentUserList(new Environment({ ID: store.getters.Environment().ID }));
    users.value = data;
    usersCopy.value = deepCopy(users.value);
  };

  const allUsers = ref<User[]>([]);
  const allUsersCopy = ref<User[]>([]);
  const getProjectUserList = async () => {
    const data = await useProjectUserList(new Project({ ID: store.getters.Project().ID }));
    allUsers.value = data.filter((d) => {
      return !users.value.find((u) => {
        return u.Username === d.Username;
      });
    });
    allUsersCopy.value = deepCopy(allUsers.value);
  };

  const setRole = async (user: User, index: number): Promise<void> => {
    allUsers.value.splice(index, 1);
    users.value.push(user);
    user.Role = ResourceRole[tabRole[tab.value]];
    await new Environment({ ID: store.getters.Environment().ID }).addUser(user, user.Role);
  };

  const removeRole = async (user: User, index: number): Promise<void> => {
    users.value.splice(index, 1);
    allUsers.value.push(user);
    await await new Environment({ ID: store.getters.Environment().ID }).deleteUser(user);
  };

  const searchAllUser = ref('');
  const searchRoleUser = ref('');
  const tabChanged = async (): Promise<void> => {
    searchAllUser.value = '';
    searchRoleUser.value = '';
    await getEnvironmentUserList();
    await getProjectUserList();
  };

  const allUsernameInput = (): void => {
    allUsers.value = allUsersCopy.value.filter((u) => {
      return u.Username.indexOf(searchAllUser.value) > -1;
    });
  };

  const roleUsernameInput = (): void => {
    users.value = usersCopy.value.filter((u) => {
      return u.Username.indexOf(searchRoleUser.value) > -1 && u.Role === tabRole[tab.value];
    });
  };

  const open = (): void => {
    state.dialog = true;
  };

  const init = async (): Promise<void> => {
    if (store.getters.Project().ID > 0) {
      searchAllUser.value = '';
      searchRoleUser.value = '';
      await getEnvironmentUserList();
      await getProjectUserList();
    }
  };

  defineExpose({
    init,
    open,
  });

  const reset = (): void => {
    state.dialog = false;
  };
</script>
