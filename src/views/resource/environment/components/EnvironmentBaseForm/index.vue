<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <AddNamespace
      ref="addNamespace"
      :data="obj.data.ClusterID"
      @addData="addNamespaceData"
      @closeOverlay="closeExpand"
    />
    <v-flex v-if="step === 0">
      <BaseSubTitle title="环境定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.data.EnvironmentName"
              class="my-0"
              :rules="objRules.environmentNameRules"
              required
              label="名称"
              :readonly="edit"
            />
          </v-col>
          <v-col
            v-if="AdminViewport"
            cols="6"
          >
            <v-autocomplete
              v-model="obj.data.ProjectID"
              color="primary"
              :items="projectSelect"
              :rules="objRules.projectIDRules"
              label="项目"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :readonly="edit"
              @focus="onProjectSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.ClusterID"
              color="primary"
              :items="tenantClusterSelect"
              :rules="objRules.clusterIDRules"
              label="集群"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :readonly="edit"
              @focus="onTenantClusterSelectFocus(Tenant().ID)"
              @change="onClusterChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.data.Namespace"
              class="my-0"
              :rules="objRules.namespaceRules"
              required
              label="命名空间"
              :readonly="edit"
            >
              <template #append>
                <v-btn
                  v-if="!edit"
                  small
                  text
                  color="primary"
                  class="mt-n1"
                  @click.stop="openExpaned('AddNamespace')"
                >
                  <v-icon
                    left
                    small
                  >
                    mdi-link
                  </v-icon>
                  绑定NS
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.MetaType"
              color="primary"
              :items="environmentTypeSelect"
              :rules="objRules.metaTypeRules"
              label="类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.DeletePolicy"
              color="primary"
              :items="environmentDeletePolicySelect"
              :rules="objRules.deletePolicyRules"
              label="删除策略"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-textarea
              v-model="obj.data.Remark"
              class="my-0"
              auto-grow
              required
              label="说明"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-flex>

    <v-flex v-else-if="step === 1">
      <v-card-text class="pa-0">
        <BaseSubTitle title="环境成员角色" />
        <v-tabs
          v-model="tab"
          class="pa-2"
          vertical
          height="80px"
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
                    <v-flex class="px-1 mb-2">项目成员</v-flex>
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
                      {{ tab === 0 ? '只读成员' : '操作成员' }}
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
                        v-for="(user, index) in tab === 0
                          ? readerUsers
                          : operatorUsers"
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
    </v-flex>

    <v-flex v-else-if="step === 2 && !edit">
      <BaseSubTitle title="租户在集群上已分配资源" />
      <v-card-text>
        <ResourceChart
          ref="resourceChart"
          :statistics="obj.statistics"
        />
      </v-card-text>

      <BaseSubTitle title="资源配额(ResourceQuota)" />
      <v-card-text class="px-2 py-2">
        <ResourceQuota
          ref="resourceQuota"
          :data="obj.data"
          :statistics="obj.statistics"
        />
      </v-card-text>

      <LimitRange
        ref="limitRange"
        :data="obj"
        @addData="addLimitRangeData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle
        title="资源限制(LimitRange)"
        class="mt-4"
      >
        <template #action>
          <v-btn
            small
            text
            color="primary"
            class="float-right mr-2"
            @click="openExpaned('limitRange')"
          >
            <v-icon
              left
              small
            >
              mdi-pencil
            </v-icon>
            修改限制
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-card-text class="pa-0">
        <LimitRangeCard :obj="obj.data" />
      </v-card-text>
    </v-flex>
  </v-form>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getEnvironmentUserList,
  deleteEnvironmentUser,
  postAddEnvironmentUser,
  getProjectUserList,
} from '@/api'
import ResourceChart from '@/views/resource/environment/components/base/ResourceChart'
import LimitRange from '@/views/resource/environment/components/base/LimitRange'
import LimitRangeCard from '@/views/resource/environment/components/base/LimitRangeCard'
import ResourceQuota from '@/views/resource/environment/components/base/ResourceQuota'
import AddNamespace from './AddNamespace'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sLabel, required } from '@/utils/rules'

export default {
  name: 'EnvironmentBaseForm',
  components: {
    ResourceChart,
    LimitRange,
    LimitRangeCard,
    ResourceQuota,
    AddNamespace,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    step: {
      type: Number,
      default: () => 0,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    obj: {
      data: {
        EnvironmentName: '',
        ClusterID: null,
        MetaType: '',
        Namespace: '',
        DeletePolicy: 'delLabels',
        ProjectID: 0,
        Remark: '',
        CreatorID: 0,
        Users: [],
        ResourceQuota: {
          'requests.cpu': 0,
          'limits.cpu': 0,
          'requests.memory': 0,
          'limits.memory': 0,
          'requests.storage': 0,
          'count/pods': 100,
        },
        LimitRange: {
          Container: {
            default: {
              cpu: '500m',
              memory: '1Gi',
            },
            defaultRequest: {
              cpu: '10m',
              memory: '10Mi',
            },
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '24',
              memory: '48Gi',
            },
          },
          Pod: {
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '48',
              memory: '64Gi',
            },
          },
          PersistentVolumeClaim: {
            min: {
              storage: '0Mi',
            },
            max: {
              storage: '1Ti',
            },
          },
        },
      },
      statistics: null,
      quota: null,
    },
    environmentDeletePolicySelect: [
      { text: '删除整个命名空间', value: 'delNamespace' },
      { text: '仅删除关联', value: 'delLabels' },
    ],
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
    ...mapState(['User', 'AdminViewport', 'JWT', 'Scale']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
    objRules() {
      return {
        environmentNameRules: [
          required,
          (v) => !!(v && v.length <= 20) || '超出20字符限制',
          k8sLabel,
        ],
        clusterIDRules: [required],
        projectIDRules: [required],
        metaTypeRules: [required],
        namespaceRules: [required],
        deletePolicyRules: [required],
      }
    },
  },
  methods: {
    addNamespaceData(data) {
      this.$set(this.obj.data, 'Namespace', data)
      this.$refs.addNamespace.closeCard()
    },
    async onClusterChange(ClusterID = null) {
      const cluster = this.tenantClusterSelect.find((c) => {
        return c.value === ClusterID
      })
      if (cluster) {
        this.obj.statistics = await this.tenantResourceQuota(
          cluster.text,
          this.Tenant().TenantName,
          { noprocessing: true },
        )
        this.obj.quota = await this.clusterQuota(cluster.value, {
          NowCpu: this.obj.statistics.Cpu,
          NowMemory: this.obj.statistics.Memory,
          NowStorage: this.obj.statistics.Storage,
        })
      }
    },
    openExpaned(formComponent) {
      this.$nextTick(() => {
        this.$refs[formComponent].expand = true
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    async addLimitRangeData(data) {
      this.obj.data.LimitRange = data.LimitRange
      this.$refs.limitRange.closeCard()
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      if (this.$refs.addNamespace) this.$refs.addNamespace.closeCard()
      if (this.$refs.limitRange) this.$refs.limitRange.closeCard()
      this.dialog = false
      this.$refs.form.reset()
      this.obj.data.EnvironmentName = ''
      this.obj.data.MetaType = ''
      this.obj.data.Remark = ''
      this.obj.data.ClusterID = null
      this.obj.data.Namespace = ''
      this.obj.data.DeletePolicy = 'delLabels'
      this.users = []
      this.readerUsers = []
      this.operatorUsers = []
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.step === 0) {
        if (this.$refs.addNamespace.expand) {
          return !this.$refs.addNamespace.expand
        }
      } else {
        if (this.$refs.limitRange && this.$refs.limitRange.expand) {
          return !this.$refs.limitRange.expand
        }
      }
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.obj.data = deepCopy(item)
      this.obj.statistics = await this.tenantResourceQuota(
        this.ThisCluster,
        this.Tenant().TenantName,
        { noprocessing: true },
      )
      this.obj.quota = await this.clusterQuota(this.obj.data.ClusterID, {
        NowCpu: this.obj.statistics.Cpu,
        NowMemory: this.obj.statistics.Memory,
        NowStorage: this.obj.statistics.Storage,
      })
      await this.tenantClusterSelectData(this.Tenant().ID)
      await this.onClusterChange(this.obj.data.ClusterID)
      if (this.AdminViewport) {
        this.projectSelectData()
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async initUser(projectID) {
      this.searchAllUser = ''
      this.searchRoleUser = ''
      if (this.edit) {
        await this.environmentUserList()
      }
      await this.projectUserList(projectID)
    },
    async projectUserList(projectID) {
      const data = await getProjectUserList(projectID, {
        size: 1000,
        noprocessing: true,
      })
      this.allUsers = data.List.filter((d) => {
        return !this.users.find((u) => {
          return u.Username === d.Username
        })
      })
      this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers))
    },
    async environmentUserList() {
      const data = await getEnvironmentUserList(this.obj.data.ID, {
        size: 1000,
        noprocessing: true,
      })
      this.users = data.List
      this.usersCopy = JSON.parse(JSON.stringify(this.users))
      this.readerUsers = data.List.filter((d) => {
        return d.Role === 'reader'
      })
      this.operatorUsers = data.List.filter((d) => {
        return d.Role === 'operator'
      })
    },
    async setRole(user, index) {
      this.$delete(this.allUsers, index)
      if (this.tab === 0) {
        this.readerUsers.push(user)
      } else {
        this.operatorUsers.push(user)
      }
      this.usersCopy.push(user)
      if (this.edit) {
        await postAddEnvironmentUser(this.obj.data.ID, {
          UserID: user.ID,
          EnvironmentID: this.obj.data.ID,
          Role: this.tab === 0 ? 'reader' : 'operator',
        })
      } else {
        this.obj.data.Users.push({
          ID: user.ID,
          Role: this.tab === 0 ? 'reader' : 'operator',
        })
      }
    },
    async removeRole(user, index) {
      if (this.tab === 0) {
        this.$delete(this.readerUsers, index)
      } else {
        this.$delete(this.operatorUsers, index)
      }
      const i = this.usersCopy.findIndex((u) => {
        return u.Username === user.Username
      })
      this.$delete(this.usersCopy, i)
      this.allUsers.push(user)
      if (this.edit) {
        await deleteEnvironmentUser(this.obj.data.ID, user.ID)
      } else {
        const index = this.obj.data.Users.findIndex((i) => {
          return i.ID === user.ID
        })
        this.obj.data.Users.splice(index, 1)
      }
    },
    async onTabChange() {
      this.$nextTick(async () => {
        if (this.edit) {
          this.searchAllUser = ''
          this.searchRoleUser = ''
          await this.environmentUserList()
          await this.projectUserList()
          if (this.tab === 0) {
            this.usersCopy = this.readerUsers
          } else {
            this.usersCopy = this.operatorUsers
          }
        }
      })
    },
    onAllUsernameInput() {
      this.allUsers = this.allUsersCopy.filter((u) => {
        return u.Username.indexOf(this.searchAllUser) > -1
      })
    },
    onRoleUsernameInput() {
      if (this.tab === 0) {
        this.readerUsers = this.usersCopy.filter((u) => {
          return u.Username.indexOf(this.searchRoleUser) > -1
        })
      } else {
        this.operatorUsers = this.usersCopy.filter((u) => {
          return u.Username.indexOf(this.searchRoleUser) > -1
        })
      }
    },
    onProjectSelectFocus() {
      this.projectSelectData()
    },
    onTenantClusterSelectFocus(tenantid) {
      this.tenantClusterSelectData(tenantid)
    },
  },
}
</script>
