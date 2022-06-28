<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型商店管理成员" />
    <v-card-text class="pa-2">
      <v-tabs v-model="tab" class="pa-2" height="30px" vertical @change="onTabChange">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
        <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
          <v-card flat>
            <v-row class="pa-0 ma-0">
              <v-col class="py-1" cols="6">
                <v-card elevation="2" height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">用户</v-flex>
                    <v-text-field
                      v-model="searchAllUser"
                      class="mx-1"
                      dense
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      @keyup="onAllUsernameInput"
                    />
                    <v-list dense height="450px" style="overflow-y: auto">
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
                <v-card elevation="2" height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2"> 管理员 </v-flex>
                    <v-text-field
                      v-model="searchRoleUser"
                      class="mx-1"
                      dense
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      @keyup="onRoleUsernameInput"
                    />
                    <v-list dense height="450px" style="overflow-y: auto">
                      <v-list-item
                        v-for="(user, index) in adminUsers"
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

  import { deleteVirtualSpaceUser, getVirtualSpaceUserList, postAddVirtualSpaceUser, userSelectData } from '@/api';
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
      tabItems: [{ text: '管理员', value: 'admin' }],
      allUsers: [],
      allUsersCopy: [],
      users: [],
      usersCopy: [],
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
      async userList() {
        const data = await userSelectData(this.EnvironmentID, {});
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async modelStoreUserList() {
        const data = await getVirtualSpaceUserList(this.obj.ID, {
          size: 1000,
        });
        this.users = data.List;
        this.usersCopy = JSON.parse(JSON.stringify(this.users));
        this.adminUsers = data.List.filter((d) => {
          return d.Role === 'admin';
        });
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        this.usersCopy.push(user);
        this.adminUsers.push(user);
        if (this.edit) {
          await postAddVirtualSpaceUser(parseInt(this.obj.ID), {
            UserID: user.ID,
            VirtualSpaceID: parseInt(this.obj.ID),
            Role: 'admin',
          });
        } else {
          this.obj.Users.push({
            ID: user.ID,
            Role: 'admin',
          });
        }
      },
      async removeRole(user, index) {
        this.$delete(this.adminUsers, index);
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
        this.adminUsers = this.usersCopy.filter((u) => {
          return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'admin';
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
