<template>
  <BaseDialog v-model="dialog" icon="mdi-account-settings" title="环境成员" :width="900" @reset="reset">
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle title="环境成员角色" />
          <v-tabs v-model="tab" class="pa-2" height="60px" vertical @change="onTabChange">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
            <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
              <v-row class="pa-0 ma-0">
                <v-col class="py-1" cols="6">
                  <v-card elevation="2" flat height="550px">
                    <v-card-text>
                      <v-flex class="px-1 mb-2">项目成员</v-flex>
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
                        {{ tab === 0 ? '只读成员' : '操作成员' }}
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
                          v-for="(user, index) in tab === 0 ? readerUsers : operatorUsers"
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
      </v-card>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { deleteEnvironmentUser, getEnvironmentUserList, getProjectUserList, postAddEnvironmentUser } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ManageUser',
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      tab: 0,
      tabItems: [
        { text: '只读成员', value: 'reader' },
        { text: '操作成员', value: 'operator' },
      ],
      allUsers: [],
      allUsersCopy: [],
      users: [],
      usersCopy: [],
      readerUsers: [],
      operatorUsers: [],
      searchAllUser: '',
      searchRoleUser: '',
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Project', 'Environment']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async projectUserList() {
        const data = await getProjectUserList(this.Project().ID, {
          size: 1000,
        });
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async environmentUserList() {
        const data = await getEnvironmentUserList(this.Environment().ID, {
          size: 1000,
        });
        this.users = data.List;
        this.usersCopy = JSON.parse(JSON.stringify(this.users));
        this.readerUsers = data.List.filter((d) => {
          return d.Role === 'reader';
        });
        this.operatorUsers = data.List.filter((d) => {
          return d.Role === 'operator';
        });
      },
      async setRole(user, index) {
        this.$delete(this.allUsers, index);
        if (this.tab === 0) {
          this.readerUsers.push(user);
        } else {
          this.operatorUsers.push(user);
        }
        await postAddEnvironmentUser(parseInt(this.Environment().ID), {
          UserID: user.ID,
          EnvironmentID: parseInt(this.Environment().ID),
          Role: this.tab === 0 ? 'reader' : 'operator',
        });
      },
      async removeRole(user, index) {
        if (this.tab === 0) {
          this.$delete(this.readerUsers, index);
        } else {
          this.$delete(this.operatorUsers, index);
        }
        this.allUsers.push(user);
        await deleteEnvironmentUser(parseInt(this.Environment().ID), user.ID);
      },
      async init() {
        if (this.Project().ID > 0) {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.environmentUserList();
          await this.projectUserList();
        }
      },
      async onTabChange() {
        this.$nextTick(async () => {
          this.searchAllUser = '';
          this.searchRoleUser = '';
          await this.environmentUserList();
          await this.projectUserList();
        });
      },
      onAllUsernameInput() {
        this.allUsers = this.allUsersCopy.filter((u) => {
          return u.Username.indexOf(this.searchAllUser) > -1;
        });
      },
      onRoleUsernameInput() {
        if (this.tab === 0) {
          this.readerUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'reader';
          });
        } else {
          this.operatorUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1 && u.Role === 'operator';
          });
        }
      },
      reset() {
        this.dialog = false;
      },
    },
  };
</script>
