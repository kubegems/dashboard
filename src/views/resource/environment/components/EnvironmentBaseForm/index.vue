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
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <AddNamespace
      ref="addNamespace"
      :data="obj.data.ClusterID"
      @addData="addNamespaceData"
      @closeOverlay="closeExpand"
    />
    <v-flex v-if="step === 0">
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.environment')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.trim="obj.data.EnvironmentName"
              class="my-0"
              :label="$t('form.name')"
              :readonly="edit"
              required
              :rules="objRules.environmentNameRules"
            />
          </v-col>
          <v-col v-if="AdminViewport" cols="6">
            <v-autocomplete
              v-model="obj.data.ProjectID"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_projectItems"
              :label="$root.$t('resource.project')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.projectIDRules"
              @focus="onProjectSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.ClusterID"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_tenantClusterItems"
              :label="$root.$t('resource.cluster')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.clusterIDRules"
              @change="onClusterChange"
              @focus="onTenantClusterSelectFocus(Tenant().ID)"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.trim="obj.data.Namespace"
              class="my-0"
              :label="$root.$t('resource.namespace')"
              :readonly="edit"
              required
              :rules="objRules.namespaceRules"
            >
              <template #append>
                <v-btn v-if="!edit" class="mt-n1" color="primary" small text @click.stop="openExpaned('addNamespace')">
                  <v-icon left small> mdi-link </v-icon>
                  {{ $t('operate.bind_ns') }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.MetaType"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_environmentTypeItems"
              :label="$root.$t('resource.type')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.metaTypeRules"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.data.DeletePolicy"
              class="my-0"
              color="primary"
              hide-selected
              :items="environmentDeletePolicySelect"
              :label="$t('form.delete_policy')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.deletePolicyRules"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-textarea v-model="obj.data.Remark" auto-grow class="my-0" :label="$t('form.remark')" required />
          </v-col>
        </v-row>
      </v-card-text>
    </v-flex>

    <v-flex v-else-if="step === 1">
      <v-card-text class="pa-0">
        <BaseSubTitle
          :title="$root.$t('resource.environment_c', [$root.$t('resource.member_c', [$root.$t('resource.role')])])"
        />
        <v-tabs v-model="tab" class="pa-2" height="60px" vertical @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
          <v-tab-item v-for="item in tabItems" :key="item.tab" :reverse-transition="false" :transition="false">
            <v-row class="pa-0 ma-0">
              <v-col class="py-1" cols="6">
                <v-card elevation="2" flat height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">
                      {{ $root.$t('resource.project_c', [$root.$t('resource.member')]) }}
                    </v-flex>
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
                      {{ tab === 0 ? $root.$t('role.environment.reader') : $root.$t('role.environment.operator') }}
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
    </v-flex>

    <v-flex v-else-if="step === 2 && !edit">
      <BaseSubTitle :title="$t('tip.tenant_resource_allocated')" />
      <v-card-text>
        <ResourceChart ref="resourceChart" :statistics="obj.statistics" />
      </v-card-text>

      <BaseSubTitle :title="$t('tip.resource_quota')" />
      <v-card-text class="px-2 py-2">
        <ResourceQuota ref="resourceQuota" :data="obj.data" :statistics="obj.statistics" />
      </v-card-text>

      <LimitRange ref="limitRange" :data="obj" @addData="addLimitRangeData" @closeOverlay="closeExpand" />
      <BaseSubTitle class="mt-4" :title="$t('tip.limit_range')">
        <template #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="openExpaned('limitRange')">
            <v-icon left small> mdi-pencil </v-icon>
            {{ $t('operate.edit_limit') }}
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
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AddNamespace from './AddNamespace';
  import { deleteEnvironmentUser, getEnvironmentUserList, getProjectUserList, postAddEnvironmentUser } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';
  import LimitRange from '@/views/resource/environment/components/base/LimitRange';
  import LimitRangeCard from '@/views/resource/environment/components/base/LimitRangeCard';
  import ResourceChart from '@/views/resource/environment/components/base/ResourceChart';
  import ResourceQuota from '@/views/resource/environment/components/base/ResourceQuota';

  export default {
    name: 'EnvironmentBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      AddNamespace,
      LimitRange,
      LimitRangeCard,
      ResourceChart,
      ResourceQuota,
    },
    mixins: [BaseResource, BaseSelect],
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
      tab: 0,
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
          environmentNameRules: [required, (v) => !!(v && v.length <= 20) || this.$t('form.limit_20_rule'), k8sName],
          clusterIDRules: [required],
          projectIDRules: [required],
          metaTypeRules: [required],
          namespaceRules: [required, k8sName],
          deletePolicyRules: [required],
        };
      },
      environmentDeletePolicySelect() {
        return [
          { text: this.$t('tip.delete_all_select'), value: 'delNamespace' },
          { text: this.$t('tip.delete_cascade_select'), value: 'delLabels' },
        ];
      },
      tabItems() {
        return [
          { text: this.$root.$t('role.environment.reader'), value: 'reader' },
          { text: this.$root.$t('role.environment.operator'), value: 'operator' },
        ];
      },
    },
    methods: {
      addNamespaceData(data) {
        this.$set(this.obj.data, 'Namespace', data);
        this.$refs.addNamespace.closeCard();
      },
      async onClusterChange(ClusterID = null) {
        const cluster = this.m_select_tenantClusterItems.find((c) => {
          return c.value === ClusterID;
        });
        if (cluster) {
          this.obj.statistics = await this.m_resource_tenantResourceQuota(cluster.text, this.Tenant().TenantName, {
            noprocessing: true,
          });
          this.obj.quota = await this.m_resource_clusterQuota(cluster.value, {
            NowCpu: this.obj.statistics?.Cpu || 0,
            NowMemory: this.obj.statistics?.Memory || 0,
            NowStorage: this.obj.statistics?.Storage || 0,
          });
        }
      },
      openExpaned(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      async addLimitRangeData(data) {
        this.obj.data.LimitRange = data.LimitRange;
        this.$refs.limitRange.closeCard();
      },
      reset() {
        if (this.$refs.addNamespace) this.$refs.addNamespace.closeCard();
        if (this.$refs.limitRange) this.$refs.limitRange.closeCard();
        this.dialog = false;
        this.$refs.form.reset();
        this.obj.data.EnvironmentName = '';
        this.obj.data.MetaType = '';
        this.obj.data.Remark = '';
        this.obj.data.ClusterID = null;
        this.obj.data.Namespace = '';
        this.obj.data.DeletePolicy = 'delLabels';
        this.users = [];
        this.readerUsers = [];
        this.operatorUsers = [];
      },
      checkSaved() {
        if (this.step === 0) {
          if (this.$refs.addNamespace.expand) {
            return !this.$refs.addNamespace.expand;
          }
        } else {
          if (this.$refs.limitRange && this.$refs.limitRange.expand) {
            return !this.$refs.limitRange.expand;
          }
        }
        return true;
      },
      async init(item) {
        this.obj.data = deepCopy(item);
        this.obj.statistics = await this.m_resource_tenantResourceQuota(this.ThisCluster, this.Tenant().TenantName, {
          noprocessing: true,
        });
        this.obj.quota = await this.m_resource_clusterQuota(this.obj.data.ClusterID, {
          NowCpu: this.obj.statistics.Cpu,
          NowMemory: this.obj.statistics.Memory,
          NowStorage: this.obj.statistics.Storage,
          NowNvidiaGpu: this.obj.statistics.NvidiaGpu,
          NowTkeGpu: this.obj.statistics.TkeGpu,
          NowTkeMemory: this.obj.statistics.TkeMemory,
        });
        await this.m_select_tenantClusterSelectData(this.Tenant().ID);
        await this.onClusterChange(this.obj.data.ClusterID);
        if (this.AdminViewport) {
          this.m_select_projectSelectData();
        }
      },
      async initUser(projectID) {
        this.searchAllUser = '';
        this.searchRoleUser = '';
        if (this.edit) {
          await this.environmentUserList();
        }
        await this.projectUserList(projectID);
      },
      async projectUserList(projectID) {
        const data = await getProjectUserList(projectID, {
          size: 1000,
          noprocessing: true,
        });
        this.allUsers = data.List.filter((d) => {
          return !this.users.find((u) => {
            return u.Username === d.Username;
          });
        });
        this.allUsersCopy = JSON.parse(JSON.stringify(this.allUsers));
      },
      async environmentUserList() {
        const data = await getEnvironmentUserList(this.obj.data.ID, {
          size: 1000,
          noprocessing: true,
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
        this.usersCopy.push(user);
        if (this.edit) {
          await postAddEnvironmentUser(this.obj.data.ID, {
            UserID: user.ID,
            EnvironmentID: this.obj.data.ID,
            Role: this.tab === 0 ? 'reader' : 'operator',
          });
        } else {
          this.obj.data.Users.push({
            ID: user.ID,
            Role: this.tab === 0 ? 'reader' : 'operator',
          });
        }
      },
      async removeRole(user, index) {
        if (this.tab === 0) {
          this.$delete(this.readerUsers, index);
        } else {
          this.$delete(this.operatorUsers, index);
        }
        const i = this.usersCopy.findIndex((u) => {
          return u.Username === user.Username;
        });
        this.$delete(this.usersCopy, i);
        this.allUsers.push(user);
        if (this.edit) {
          await deleteEnvironmentUser(this.obj.data.ID, user.ID);
        } else {
          const index = this.obj.data.Users.findIndex((i) => {
            return i.ID === user.ID;
          });
          this.obj.data.Users.splice(index, 1);
        }
      },
      async onTabChange() {
        this.$nextTick(async () => {
          if (this.edit) {
            this.searchAllUser = '';
            this.searchRoleUser = '';
            await this.environmentUserList();
            await this.projectUserList();
            if (this.tab === 0) {
              this.usersCopy = this.readerUsers;
            } else {
              this.usersCopy = this.operatorUsers;
            }
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
          this.readerUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1;
          });
        } else {
          this.operatorUsers = this.usersCopy.filter((u) => {
            return u.Username.indexOf(this.searchRoleUser) > -1;
          });
        }
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
      onTenantClusterSelectFocus(tenantid) {
        this.m_select_tenantClusterSelectData(tenantid);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      generateUnit() {
        return this.$refs.resourceQuota.generateUnit();
      },
    },
  };
</script>
