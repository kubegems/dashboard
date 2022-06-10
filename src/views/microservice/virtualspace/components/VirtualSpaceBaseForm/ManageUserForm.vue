<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="虚拟空间成员" />
    <v-card-text class="pa-2">
      <v-tabs v-model="tab" class="pa-2" height="60px" vertical @change="onTabChange">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
        <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
          <v-card flat>
            <v-row class="pa-0 ma-0">
              <v-col cols="6" class="py-1">
                <v-card elevation="2" height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">用户</v-flex>
                    <v-text-field
                      v-model="searchAllUser"
                      class="mx-1"
                      prepend-inner-icon="mdi-magnify"
                      dense
                      hide-details
                      @keyup="onAllUsernameInput"
                    />
                    <v-list dense height="450px" style="overflow-y: auto">
                      <v-list-item v-for="(user, index) in allUsers" :key="index" link @click="setRole(user, index)">
                        <v-list-item-avatar class="my-1">
                          <v-avatar :size="32" color="primary" class="white--text font-weight-medium">
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
              <v-col cols="6" class="py-1">
                <v-card elevation="2" height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">
                      {{ tab === 0 ? '普通成员' : '管理员' }}
                    </v-flex>
                    <v-text-field
                      v-model="searchRoleUser"
                      class="mx-1"
                      prepend-inner-icon="mdi-magnify"
                      dense
                      hide-details
                      @keyup="onRoleUsernameInput"
                    />
                    <v-list dense height="450px" style="overflow-y: auto">
                      <v-list-item
                        v-for="(user, index) in tab === 0 ? normalUsers : adminUsers"
                        :key="index"
                        link
                        @click="removeRole(user, index)"
                      >
                        <v-list-item-avatar class="my-1">
                          <v-avatar :size="32" color="primary" class="white--text font-weight-medium">
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
    getVirtualSpaceEnvironmentUser,
    deleteVirtualSpaceUser,
    postAddVirtualSpaceUser,
    getVirtualSpaceUserList,
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
      tabItems: [
        { text: '普通成员', value: 'normal' },
        { text: '管理员', value: 'admin' },
      ],
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
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
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
      // eslint-disable-next-line vue/no-unused-properties
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

      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
    },
  };
</script>
