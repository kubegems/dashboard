<template>
  <BaseDialog v-model="dialog" :width="900" title="租户成员" icon="mdi-account-settings" @reset="reset">
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle title="租户成员角色" />
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
                          <v-list-item
                            v-for="(user, index) in allUsers"
                            :key="index"
                            link
                            @click="setRole(user, index)"
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
                            v-for="(user, index) in tab === 0 ? ordinaryUsers : adminUsers"
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
      </v-card>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import BaseSelect from '@/mixins/select';

  import { getTenantUserList, deleteTenantUser, postAddTenantUser, userSelectData } from '@/api';

  export default {
    name: 'ManageUser',
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      tab: 0,
      tabItems: [
        { text: '普通成员', value: 'ordinary' },
        { text: '管理员', value: 'admin' },
      ],
      allUsers: [],
      allUsersCopy: [],
      users: [],
      usersCopy: [],
      ordinaryUsers: [],
      adminUsers: [],
      searchAllUser: '',
      searchRoleUser: '',
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async userList() {
        const data = await userSelectData();
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async tenantUserList() {
        const data = await getTenantUserList(this.Tenant().ID, {
          size: 1000,
        });
        this.users = data.List;
        this.usersCopy = JSON.parse(JSON.stringify(this.users));
        this.ordinaryUsers = data.List.filter((d) => {
          return d.Role === 'ordinary';
        });
        this.adminUsers = data.List.filter((d) => {
          return d.Role === 'admin';
        });
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        if (this.tab === 0) {
          this.ordinaryUsers.push(user);
        } else {
          this.adminUsers.push(user);
        }
        await postAddTenantUser(parseInt(this.Tenant().ID), {
          UserID: user.ID,
          TenantID: parseInt(this.Tenant().ID),
          Role: this.tab === 0 ? 'ordinary' : 'admin',
        });
      },
      async removeRole(user, index) {
        if (this.tab === 0) {
          this.$delete(this.ordinaryUsers, index);
        } else {
          this.$delete(this.adminUsers, index);
        }
        this.allUsers.push(user);
        await deleteTenantUser(parseInt(this.Tenant().ID), user.ID);
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init() {
        if (this.Tenant().ID > 0) {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.tenantUserList();
          await this.userList();
        }
      },
      async onTabChange() {
        this.$nextTick(async () => {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.tenantUserList();
          await this.userList();
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        if (this.tab === 0) {
          this.ordinaryUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'ordinary';
          });
        } else {
          this.adminUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'admin';
          });
        }
      },
      reset() {
        this.dialog = false;
      },
    },
  };
</script>
