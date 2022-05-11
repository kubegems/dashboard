<template>
  <BaseDialog
    v-model="dialog"
    :width="900"
    title="项目成员"
    icon="mdi-account-settings"
    @reset="reset"
  >
    <template #content>
      <v-card flat>
        <v-card-text class="pa-0">
          <BaseSubTitle title="项目成员角色" />
          <v-tabs
            v-model="tab"
            class="pa-2"
            vertical
            height="160px"
            @change="onTabChange"
          >
            <v-tab
              v-for="item in tabItems"
              :key="item.value"
            >
              {{ item.text }}
            </v-tab>
            <v-tab-item
              v-for="item in tabItems"
              :key="item.tab"
              :reverse-transition="false"
              :transition="false"
            >
              <v-row class="pa-0 ma-0">
                <v-col
                  cols="6"
                  class="py-1"
                >
                  <v-card
                    elevation="2"
                    height="550px"
                  >
                    <v-card-text>
                      <v-flex class="px-1 mb-2">租户成员</v-flex>
                      <v-text-field
                        v-model="searchAllUser"
                        class="mx-1"
                        prepend-inner-icon="mdi-magnify"
                        dense
                        hide-details
                        @keyup="onAllUsernameInput"
                      />
                      <v-list
                        dense
                        height="450px"
                        style="overflow-y: auto;"
                      >
                        <v-list-item
                          v-for="(user, index) in allUsers"
                          :key="index"
                          link
                          @click="setRole(user, index)"
                        >
                          <v-list-item-avatar class="my-1">
                            <v-avatar
                              :size="32"
                              color="primary"
                              class="white--text font-weight-medium"
                            >
                              {{
                                user.Username
                                  ? user.Username[0].toLocaleUpperCase()
                                  : 'N'
                              }}
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
                <v-col
                  cols="6"
                  class="py-1"
                >
                  <v-card
                    elevation="2"
                    height="550px"
                  >
                    <v-card-text>
                      <v-flex class="px-1 mb-2">
                        {{ tabItems[tab].text }}
                      </v-flex>
                      <v-text-field
                        v-model="searchRoleUser"
                        class="mx-1"
                        prepend-inner-icon="mdi-magnify"
                        dense
                        hide-details
                        @keyup="onRoleUsernameInput"
                      />
                      <v-list
                        dense
                        height="450px"
                        style="overflow-y: auto;"
                      >
                        <v-list-item
                          v-for="(user, index) in roleUsers"
                          :key="index"
                          link
                          @click="removeRole(user, index)"
                        >
                          <v-list-item-avatar class="my-1">
                            <v-avatar
                              :size="32"
                              color="primary"
                              class="white--text font-weight-medium"
                            >
                              {{
                                user.Username
                                  ? user.Username[0].toLocaleUpperCase()
                                  : 'N'
                              }}
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
import { mapGetters, mapState } from 'vuex'
import {
  getTenantUserList,
  getProjectUserList,
  deleteProjectUser,
  postAddProjectUser,
} from '@/api'
import BaseSelect from '@/mixins/select'

export default {
  name: 'ManageUser',
  mixins: [BaseSelect],
  data: () => ({
    dialog: false,
    tab: 0,
    tabItems: [
      { text: '测试', value: 'test' },
      { text: '开发', value: 'dev' },
      { text: '运维', value: 'ops' },
      { text: '管理员', value: 'admin' },
    ],
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
          return this.devUsers
        case 'test':
          return this.testUsers
        case 'ops':
          return this.opsUsers
        case 'admin':
          return this.adminUsers
        default:
          return []
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async tenantUserList() {
      const data = await getTenantUserList(this.Tenant().ID, {
        size: 1000,
      })
      this.allUsers = data.List.filter((d) => {
        return !this.users.find((u) => {
          return u.Username === d.Username
        })
      })
      this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers))
    },
    async projectUserList() {
      const data = await getProjectUserList(this.Project().ID, {
        size: 1000,
      })
      this.users = data.List
      this.usersCopy = JSON.parse(JSON.stringify(this.users))
      this.testUsers = data.List.filter((d) => {
        return d.Role === 'test'
      })
      this.devUsers = data.List.filter((d) => {
        return d.Role === 'dev'
      })
      this.opsUsers = data.List.filter((d) => {
        return d.Role === 'ops'
      })
      this.adminUsers = data.List.filter((d) => {
        return d.Role === 'admin'
      })
    },
    async setRole(user, index) {
      this.$delete(this.allUsers, index)
      this.roleUsers.push(user)
      await postAddProjectUser(parseInt(this.Project().ID), {
        UserID: user.ID,
        ProjectID: parseInt(this.Project().ID),
        Role: this.tabItems[this.tab].value,
      })
    },
    async removeRole(user, index) {
      this.$delete(this.roleUsers, index)
      this.allUsers.push(user)
      await deleteProjectUser(parseInt(this.Project().ID), user.ID)
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      if (this.Tenant().ID > 0) {
        this.searchAllUser = ''
        this.searchRoleUser = ''
        await this.projectUserList()
        await this.tenantUserList()
      }
    },
    async onTabChange() {
      this.$nextTick(async () => {
        this.searchAllUser = ''
        this.searchRoleUser = ''
        await this.projectUserList()
        await this.tenantUserList()
      })
    },
    onAllUsernameInput() {
      this.allUsers = this.allUsersCopy.filter((u) => {
        return u.Username.indexOf(this.searchAllUser) > -1
      })
    },
    onRoleUsernameInput() {
      const users = this.usersCopy.filter((u) => {
        return (
          u.Username.indexOf(this.searchRoleUser) > -1 &&
          u.Role === this.tabItems[this.tab].value
        )
      })
      switch (this.tabItems[this.tab].value) {
        case 'dev':
          this.devUsers = users
          break
        case 'test':
          this.testUsers = users
          break
        case 'ops':
          this.opsUsers = users
          break
        case 'admin':
          this.adminUsers = users
          break
      }
    },
    reset() {
      this.dialog = false
    },
  },
}
</script>
