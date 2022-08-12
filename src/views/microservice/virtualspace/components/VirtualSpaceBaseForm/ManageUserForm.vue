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
    <BaseSubTitle :title="$root.$t('resource.mesh_c', [$root.$t('resource.member')])" />
    <v-card-text class="pa-2">
      <v-tabs v-model="tab" class="pa-2" height="60px" vertical @change="onTabChange">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
        <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
          <v-card flat>
            <v-row class="pa-0 ma-0">
              <v-col class="py-1" cols="6">
                <v-card elevation="2" flat height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">{{ $root.$t('resource.account') }}</v-flex>
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
                      {{ tab === 0 ? $root.$t('role.mesh.normal') : $root.$t('role.mesh.administrator') }}
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
                        v-for="(user, index) in tab === 0 ? normalUsers : adminUsers"
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
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import {
    deleteVirtualSpaceUser,
    getVirtualSpaceEnvironmentUser,
    getVirtualSpaceUserList,
    postAddVirtualSpaceUser,
  } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ManageUserForm',
    mixins: [BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      tab: 0,
      allUsers: [],
      allUsersCopy: [],
      users: [],
      usersCopy: [],
      normalUsers: [],
      adminUsers: [],
      searchAllUser: '',
      searchRoleUser: '',
      obj: {
        ID: 0,
        VirtualSpaceName: '',
        Environments: [],
        Users: [],
      },
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Tenant']),
      EnvironmentID() {
        return this.obj.Environments.map((e) => {
          return e.ID;
        }).join(',');
      },
      tabItems() {
        return [
          { text: this.$root.$t('role.mesh.normal'), value: 'normal' },
          { text: this.$root.$t('role.mesh.administrator'), value: 'admin' },
        ];
      },
    },
    methods: {
      async virtualSpaceEnvironmentUser() {
        const data = await getVirtualSpaceEnvironmentUser(this.EnvironmentID, {});
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async virtualSpaceUserList() {
        const data = await getVirtualSpaceUserList(this.obj.ID, {
          size: 1000,
        });
        this.users = data.List;
        this.usersCopy = JSON.parse(JSON.stringify(this.users));
        this.normalUsers = data.List.filter((d) => {
          return d.Role === 'normal';
        });
        this.adminUsers = data.List.filter((d) => {
          return d.Role === 'admin';
        });
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        this.usersCopy.push(user);
        if (this.tab === 0) {
          this.normalUsers.push(user);
        } else {
          this.adminUsers.push(user);
        }
        if (this.edit) {
          await postAddVirtualSpaceUser(parseInt(this.obj.ID), {
            UserID: user.ID,
            VirtualSpaceID: parseInt(this.obj.ID),
            Role: this.tab === 0 ? 'normal' : 'admin',
          });
        } else {
          this.obj.Users.push({
            ID: user.ID,
            Role: this.tab === 0 ? 'normal' : 'admin',
          });
        }
      },
      async removeRole(user, index) {
        if (this.tab === 0) {
          this.$delete(this.normalUsers, index);
        } else {
          this.$delete(this.adminUsers, index);
        }
        const i = this.usersCopy.findIndex((u) => {
          return u.Username === user.Username;
        });
        this.$delete(this.usersCopy, i);
        this.allUsers.push(user);
        if (this.edit) {
          await deleteVirtualSpaceUser(parseInt(this.obj.ID), user.ID);
        } else {
          const index = this.obj.Users.findIndex((i) => {
            return i.ID === user.ID;
          });
          this.obj.Users.splice(index, 1);
        }
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      async init(data) {
        this.$nextTick(async () => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
          this.searchAllUser = '';
          this.searchRoleUser = '';
          if (this.edit) {
            await this.virtualSpaceUserList();
          }
          await this.virtualSpaceEnvironmentUser();
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      async onTabChange() {
        this.$nextTick(async () => {
          if (this.edit) {
            this.searchAllUser = '';
            this.searchRoleUser = '';
            await this.virtualSpaceUserList();
            await this.virtualSpaceEnvironmentUser();
            this.usersCopy = this.tab === 0 ? this.normalUsers : this.adminUsers;
          }
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        if (this.tab === 0) {
          this.normalUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'normal';
          });
        } else {
          this.adminUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'admin';
          });
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
