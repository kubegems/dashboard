<template>
  <BaseDialog v-model="dialog" :width="900" title="虚拟空间成员" icon="mdi-account-settings" @reset="reset">
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle title="虚拟空间成员角色" />
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
      </v-card>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import {
    getVirtualSpaceUserList,
    deleteVirtualSpaceUser,
    postAddVirtualSpaceUser,
    getVirtualSpaceEnvironmentUser,
  } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ManageUser',
    components: {},
    mixins: [BaseSelect],
    props: {
      virtualspace: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      dialog: false,
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
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['VirtualSpace']),
      EnvironmentID() {
        if (this.virtualspace) {
          return this.virtualspace.Environments.map((e) => {
            return e.ID;
          }).join(',');
        }
        return '';
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
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
        const data = await getVirtualSpaceUserList(this.VirtualSpace().ID, {
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
        if (this.tab === 0) {
          this.normalUsers.push(user);
        } else {
          this.adminUsers.push(user);
        }
        await postAddVirtualSpaceUser(parseInt(this.VirtualSpace().ID), {
          UserID: user.ID,
          VirtualSpaceID: parseInt(this.VirtualSpace().ID),
          Role: this.tab === 0 ? 'normal' : 'admin',
        });
        this.$emit('refresh');
      },
      async removeRole(user, index) {
        if (this.tab === 0) {
          this.$delete(this.normalUsers, index);
        } else {
          this.$delete(this.adminUsers, index);
        }
        this.allUsers.push(user);
        await deleteVirtualSpaceUser(parseInt(this.VirtualSpace().ID), user.ID);
        this.$emit('refresh');
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init() {
        if (this.VirtualSpace().ID > 0) {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.virtualSpaceUserList();
          await this.virtualSpaceEnvironmentUser();
        }
      },
      async onTabChange() {
        this.$nextTick(async () => {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.virtualSpaceUserList();
          await this.virtualSpaceEnvironmentUser();
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
      reset() {
        this.dialog = false;
      },
    },
  };
</script>
