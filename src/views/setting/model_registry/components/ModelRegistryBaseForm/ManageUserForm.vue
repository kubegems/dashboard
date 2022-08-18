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
    <BaseSubTitle :title="$t('tip.model_admin')" />
    <v-card-text class="pa-2">
      <v-tabs v-model="tab" class="pa-2" height="30px" vertical @change="onTabChange">
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
                    <v-flex class="px-1 mb-2"> {{ $root.$t('role.model.admin') }} </v-flex>
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
                        v-for="(username, index) in adminUsers"
                        :key="index"
                        link
                        @click="removeRole(username, index)"
                      >
                        <v-list-item-avatar class="my-1">
                          <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                            {{ username[0].toLocaleUpperCase() }}
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content class="text-subtitle-1">
                          {{ username }}
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

  import messages from '../../i18n';
  import { deleteModelStoreAdminList, getModelStoreAdminList, postModelStoreAdminList, userSelectData } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ManageUserForm',
    i18n: {
      messages: messages,
    },
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
      adminUsers: [],
      searchAllUser: '',
      searchRoleUser: '',
      obj: {
        name: '',
        users: [],
      },
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Tenant']),
      tabItems() {
        return [{ text: this.$root.$t('role.model.admin'), value: 'admin' }];
      },
    },
    methods: {
      async userList() {
        const data = await userSelectData();
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((username) => {
            return username === d.Username;
          });
        });
        this.allUsersCopy = deepCopy(this.allUsers);
      },
      async modelStoreUserList() {
        const data = await getModelStoreAdminList(this.obj.name, {
          size: 1000,
        });
        this.users = data;
        this.usersCopy = deepCopy(this.users);
        this.adminUsers = data;
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        this.usersCopy.push(user);
        this.adminUsers.push(user.Username);
        if (this.edit) {
          await postModelStoreAdminList(this.obj.name, user.Username);
        } else {
          this.obj.users.push(user.Username);
        }
      },
      async removeRole(username, index) {
        this.$delete(this.adminUsers, index);
        const i = this.usersCopy.indexOf(username);
        this.$delete(this.usersCopy, i);
        this.allUsers.push({ Username: username });
        if (this.edit) {
          await deleteModelStoreAdminList(this.obj.name, username);
        } else {
          const index = this.obj.users.indexOf(username);
          this.obj.users.splice(index, 1);
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
            await this.modelStoreUserList();
          }
          await this.userList();
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
            await this.modelStoreUserList();
            await this.userList();
            this.usersCopy = this.adminUsers;
          }
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        this.adminUsers = this.usersCopy.filter((username) => {
          return username.indexOf(this.searchRoleUser) > -1;
        });
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
