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
    v-model="dialog"
    icon="mdi-account-settings"
    :title="$root.$t('form.definition', [$root.$t('resource.project')])"
    :width="900"
    @reset="reset"
  >
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle
            :title="$root.$t('resource.project_c', [$root.$t('resource.member_c', [$root.$t('resource.role')])])"
          />
          <v-tabs v-model="tab" class="pa-2" height="120px" vertical @change="onTabChange">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
            <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
              <v-row class="pa-0 ma-0">
                <v-col class="py-1" cols="6">
                  <v-card elevation="2" flat height="550px">
                    <v-card-text>
                      <v-flex class="px-1 mb-2">
                        {{ $root.$t('resource.project_c', [$root.$t('resource.member')]) }}
                      </v-flex>
                      <v-text-field
                        v-model="searchAllUser"
                        class="mx-1"
                        dense
                        hide-details
                        prepend-inner-icon="mdi-magnify"
                        @keyup="onAllUsernameInput"
                      />
                      <v-list dense height="450px" :style="{ overflowY: `auto` }">
                        <v-list-item v-for="(user, index) in allUsers" :key="index" link @click="setRole(user, index)">
                          <v-list-item-avatar class="my-1">
                            <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                              {{ user.Username ? user.Username[0].toLocaleUpperCase() : 'N' }}
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
                        {{ tabItems[tab].text }}
                      </v-flex>
                      <v-text-field
                        v-model="searchRoleUser"
                        class="mx-1"
                        dense
                        hide-details
                        prepend-inner-icon="mdi-magnify"
                        @keyup="onRoleUsernameInput"
                      />
                      <v-list dense height="450px" :style="{ overflowY: `auto` }">
                        <v-list-item
                          v-for="(user, index) in roleUsers"
                          :key="index"
                          link
                          @click="removeRole(user, index)"
                        >
                          <v-list-item-avatar class="my-1">
                            <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                              {{ user.Username ? user.Username[0].toLocaleUpperCase() : 'N' }}
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

<script>
  import { mapGetters, mapState } from 'vuex';

  import { deleteProjectUser, getProjectUserList, getTenantUserList, postAddProjectUser } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ManageUser',
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      tab: 0,
      allUsers: [],
      allUsersCopy: [],
      users: [],
      usersCopy: [],
      testUsers: [],
      devUsers: [],
      opsUsers: [],
      adminUsers: [],
      searchAllUser: '',
      searchRoleUser: '',
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Tenant', 'Project']),
      roleUsers() {
        switch (this.tabItems[this.tab].value) {
          case 'dev':
            return this.devUsers;
          case 'test':
            return this.testUsers;
          case 'ops':
            return this.opsUsers;
          case 'admin':
            return this.adminUsers;
          default:
            return [];
        }
      },
      tabItems() {
        return [
          { text: this.$root.$t('role.projct.test'), value: 'test' },
          { text: this.$root.$t('role.projct.dev'), value: 'dev' },
          { text: this.$root.$t('role.projct.ops'), value: 'ops' },
          { text: this.$root.$t('role.projct.admin'), value: 'admin' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async tenantUserList() {
        const data = await getTenantUserList(this.Tenant().ID, {
          size: 1000,
        });
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async projectUserList() {
        const data = await getProjectUserList(this.Project().ID, {
          size: 1000,
        });
        this.users = data.List;
        this.usersCopy = JSON.parse(JSON.stringify(this.users));
        this.testUsers = data.List.filter((d) => {
          return d.Role === 'test';
        });
        this.devUsers = data.List.filter((d) => {
          return d.Role === 'dev';
        });
        this.opsUsers = data.List.filter((d) => {
          return d.Role === 'ops';
        });
        this.adminUsers = data.List.filter((d) => {
          return d.Role === 'admin';
        });
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        this.roleUsers.push(user);
        await postAddProjectUser(parseInt(this.Project().ID), {
          UserID: user.ID,
          ProjectID: parseInt(this.Project().ID),
          Role: this.tabItems[this.tab].value,
        });
      },
      async removeRole(user, index) {
        this.$delete(this.roleUsers, index);
        this.allUsers.push(user);
        await deleteProjectUser(parseInt(this.Project().ID), user.ID);
      },
      async init() {
        if (this.Tenant().ID > 0) {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.projectUserList();
          await this.tenantUserList();
        }
      },
      async onTabChange() {
        this.$nextTick(async () => {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.projectUserList();
          await this.tenantUserList();
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        const users = this.usersCopy.filter((u) => {
          return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === this.tabItems[this.tab].value;
        });
        switch (this.tabItems[this.tab].value) {
          case 'dev':
            this.devUsers = users;
            break;
          case 'test':
            this.testUsers = users;
            break;
          case 'ops':
            this.opsUsers = users;
            break;
          case 'admin':
            this.adminUsers = users;
            break;
        }
      },
      reset() {
        this.dialog = false;
      },
    },
  };
</script>
