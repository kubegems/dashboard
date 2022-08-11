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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <template v-if="step === 0">
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.project')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.trim="obj.ProjectName"
              class="my-0"
              :label="$t('form.project.name')"
              :readonly="edit"
              required
              :rules="objRules.projectNameRules"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="obj.ProjectAlias" class="my-0" :label="$t('form.project.alias')" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-textarea v-model="obj.Remark" auto-grow class="my-0" :label="$t('form.project.remark')" required />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <template v-else-if="step === 1">
      <BaseSubTitle
        :title="$root.$t('resource.project_c', [$root.$t('resource.member_c', [$root.$t('resource.role')])])"
      />
      <v-card-text class="pa-0">
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
    </template>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { deleteProjectUser, getProjectUserList, getTenantUserList, postAddProjectUser } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'ProjectBaseForm',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      obj: {
        ProjectName: '',
        ProjectAlias: '',
        Remark: '',
        Users: [],
      },
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
      ...mapState(['Admin', 'JWT', 'Scale']),
      ...mapGetters(['Tenant', 'Project']),
      objRules() {
        return {
          projectNameRules: [required, (v) => !!(v && v.length <= 20) || this.$t('form.project.nameRule'), k8sName],
        };
      },
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
      validate() {
        return this.$refs.form.validate(true);
      },
      reset() {
        this.testUsers = [];
        this.devUsers = [];
        this.opsUsers = [];
        this.adminUsers = [];
        this.obj = {
          ProjectName: '',
          ProjectAlias: '',
          Remark: '',
          Users: [],
        };
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
        const data = await getProjectUserList(this.obj.ProjectID, {
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
        this.usersCopy.push(user);
        if (this.edit) {
          await postAddProjectUser(this.obj.ProjectID, {
            UserID: user.ID,
            ProjectID: this.obj.ProjectID,
            Role: this.tabItems[this.tab].value,
          });
        } else {
          this.obj.Users.push({
            ID: user.ID,
            Role: this.tabItems[this.tab].value,
          });
        }
      },
      async removeRole(user, index) {
        this.$delete(this.roleUsers, index);
        const i = this.usersCopy.findIndex((u) => {
          return u.Username === user.Username;
        });
        this.$delete(this.usersCopy, i);
        this.allUsers.push(user);
        if (this.edit) {
          await deleteProjectUser(this.obj.ProjectID, user.ID);
        } else {
          const index = this.obj.Users.findIndex((i) => {
            return i.ID === user.ID;
          });
          this.obj.Users.splice(index, 1);
        }
      },
      init() {
        this.$nextTick(async () => {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          if (this.edit) {
            await this.projectUserList();
          }
          await this.tenantUserList();
        });
      },
      async onTabChange() {
        this.$nextTick(async () => {
          if (this.edit) {
            this.searchAllUser = '';
            this.searchRoleUser = '';
            await this.projectUserList();
            await this.tenantUserList();
            this.usersCopy = this.roleUsers;
          }
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        const users = this.usersCopy.filter((u) => {
          return u.Username.indexOf(this.searchRoleUser) > -1;
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
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
