<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <template v-if="step === 0">
      <BaseSubTitle title="项目定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.ProjectName"
              class="my-0"
              :rules="objRules.projectNameRules"
              required
              label="名称"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.ProjectAlias"
              class="my-0"
              required
              label="别名"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-textarea
              v-model="obj.Remark"
              class="my-0"
              auto-grow
              required
              label="说明"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <template v-else-if="step === 1">
      <BaseSubTitle title="项目成员角色" />
      <v-card-text class="pa-0">
        <v-tabs
          v-model="tab"
          class="pa-2"
          vertical
          height="120px"
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
import { mapGetters, mapState } from 'vuex'
import {
  getTenantUserList,
  getProjectUserList,
  deleteProjectUser,
  postAddProjectUser,
} from '@/api'
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'
import BaseResource from '@/mixins/resource'
import { k8sLabel, required } from '@/utils/rules'

export default {
  name: 'ProjectBaseForm',
  mixins: [BaseSelect, BasePermission, BaseResource],
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
    ...mapState(['Admin', 'JWT', 'Scale']),
    ...mapGetters(['Tenant', 'Project']),
    objRules() {
      return {
        projectNameRules: [
          required,
          (v) => !!(v && v.length <= 20) || '超出20字符限制',
          k8sLabel,
        ],
      }
    },
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
    validated() {
      return this.$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.testUsers = []
      this.devUsers = []
      this.opsUsers = []
      this.adminUsers = []
      this.obj = {
        ProjectName: '',
        ProjectAlias: '',
        Remark: '',
        Users: [],
      }
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
      const data = await getProjectUserList(this.obj.ProjectID, {
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
      this.usersCopy.push(user)
      if (this.edit) {
        await postAddProjectUser(this.obj.ProjectID, {
          UserID: user.ID,
          ProjectID: this.obj.ProjectID,
          Role: this.tabItems[this.tab].value,
        })
      } else {
        this.obj.Users.push({
          ID: user.ID,
          Role: this.tabItems[this.tab].value,
        })
      }
    },
    async removeRole(user, index) {
      this.$delete(this.roleUsers, index)
      const i = this.usersCopy.findIndex((u) => {
        return u.Username === user.Username
      })
      this.$delete(this.usersCopy, i)
      this.allUsers.push(user)
      if (this.edit) {
        await deleteProjectUser(this.obj.ProjectID, user.ID)
      } else {
        const index = this.obj.Users.findIndex((i) => {
          return i.ID === user.ID
        })
        this.obj.Users.splice(index, 1)
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.$nextTick(async () => {
        this.searchAllUser = ''
        this.searchRoleUser = ''
        if (this.edit) {
          await this.projectUserList()
        }
        await this.tenantUserList()
      })
    },
    async onTabChange() {
      this.$nextTick(async () => {
        if (this.edit) {
          this.searchAllUser = ''
          this.searchRoleUser = ''
          await this.projectUserList()
          await this.tenantUserList()
          this.usersCopy = this.roleUsers
        }
      })
    },
    onAllUsernameInput() {
      this.allUsers = this.allUsersCopy.filter((u) => {
        return u.Username.indexOf(this.searchAllUser) > -1
      })
    },
    onRoleUsernameInput() {
      const users = this.usersCopy.filter((u) => {
        return u.Username.indexOf(this.searchRoleUser) > -1
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
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
