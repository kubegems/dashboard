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
  <v-flex>
    <v-card v-for="(cluster, index) in clusters" :key="index" :class="`${index > 0 ? 'mt-3' : 'mt-6'}`" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="`${$root.$t('resource.cluster')} ${cluster.ClusterName}`">
        <template #action>
          <v-switch
            v-if="m_permisson_resourceAllow"
            v-model="cluster.Isolation"
            class="float-right mt-2 mr-4"
            color="primary"
            hide-details
            @change="onNetworkPolicyChange(cluster, 'project')"
            @click.stop
          >
            <template #label>
              <span class="text-subtitle-2">
                {{
                  $root.$t('operate.open_c', [
                    $root.$t('resource.project_c', [$t('environment.table.network_isolation')]),
                  ])
                }}
              </span>
            </template>
          </v-switch>
        </template>
      </BaseSubTitle>

      <v-card-text>
        <v-data-table
          class="px-2"
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items[cluster.ClusterName]"
          :items-per-page="100"
          :no-data-text="$root.$t('data.no_data')"
        >
          <template #[`item.environmentName`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="environmentDetail(item)">
              {{ item.EnvironmentName }}
            </a>
          </template>
          <template #[`item.metaType`]="{ item }">
            <v-chip
              :color="
                $METATYPE_CN[item.MetaType] && $METATYPE_CN[item.MetaType].color
                  ? $METATYPE_CN[item.MetaType].color
                  : 'grey'
              "
              label
              small
            >
              {{ $t(`environment.type.${item.MetaType}`) }}
            </v-chip>
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.Creator.Username }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.Namespace }}
          </template>
          <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
          <template #[`item.memory`]="{ item }"> {{ item.Memory }} Gi </template>
          <template #[`item.storage`]="{ item }"> {{ item.Storage }} Gi </template>
          <template #[`item.usedCpu`]="{ item }">
            {{ item.UsedCpu.toFixed(1) }} core
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.CpuPercentage)"
              height="15"
              :value="item.CpuPercentage"
            >
              <span class="white--text"> {{ item.CpuPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedMemory`]="{ item }">
            {{ item.UsedMemory.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.MemoryPercentage)"
              height="15"
              :value="item.MemoryPercentage"
            >
              <span class="white--text"> {{ item.MemoryPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedStorage`]="{ item }">
            {{ item.UsedStorage.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.StoragePercentage)"
              height="15"
              :value="item.StoragePercentage"
            >
              <span class="white--text"> {{ item.StoragePercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.isolation`]="{ item }">
            <v-switch
              v-model="item.Isolation"
              class="float-right mt-0 mr-2"
              color="primary"
              dense
              hide-details
              @change="onNetworkPolicyChange(item, 'environment')"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import {
    getNetworkPolicyDetail,
    getProjectEnvironmentAggregation,
    postUpdateEnvironmentNetworkPolicy,
    postUpdateProjectNetworkPolicy,
  } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'EnvironmentList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseSelect],
    inject: ['reload'],
    props: {
      ready: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      items: {},
      clusters: [],
      params: {
        page: 1,
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport']),
      ...mapGetters(['Project', 'Tenant', 'Cluster']),
      headers() {
        const items = [
          {
            text: this.$t('environment.table.environment_space'),
            value: 'environmentName',
            align: 'start',
            width: 180,
          },
          { text: this.$t('environment.table.environment_type'), value: 'metaType', align: 'start' },
          { text: this.$t('environment.table.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('environment.table.creator'), value: 'creator', align: 'start' },
          { text: this.$root.$t('resource.cpu'), value: 'cpu', align: 'start' },
          { text: this.$root.$t('resource.memory'), value: 'memory', align: 'start' },
          { text: this.$root.$t('resource.storage'), value: 'storage', align: 'start' },
          {
            text: this.$t('environment.table.used', [this.$root.$t('resource.cpu')]),
            value: 'usedCpu',
            align: 'start',
            width: 150,
          },
          {
            text: this.$t('environment.table.used', [this.$root.$t('resource.memory')]),
            value: 'usedMemory',
            align: 'start',
            width: 150,
          },
          {
            text: this.$t('environment.table.used', [this.$root.$t('resource.storage')]),
            value: 'usedStorage',
            align: 'start',
            width: 150,
          },
        ];
        if (this.m_permisson_resourceAllow) {
          items.push({
            text: this.$t('environment.table.network_isolation'),
            value: 'isolation',
            align: 'center',
            width: 100,
          });
        }
        return items;
      },
    },
    watch: {
      ready() {
        if (this.ready) {
          if (this.Tenant().ID > 0) {
            Object.assign(this.params, this.$route.query);
            this.environmentList();
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.tenant_creat_or_join'),
              color: 'warning',
            });
          }
        }
      },
    },
    methods: {
      async projectEnvironmentAggregation() {
        const data = await getProjectEnvironmentAggregation(this.Project().ID, {
          noprocessing: true,
        });
        if (data) {
          for (const key in data) {
            this.clusters.push({
              ClusterName: key,
              ClusterID: data[key].ClusterID,
            });
            const envs = [];
            data[key].Environments.forEach((e) => {
              e.EnvironmentName = e.Env.EnvironmentName;
              e.MetaType = e.Env.MetaType;
              e.Namespace = e.Env.Namespace;
              e.Creator = e.Env.Creator;
              if (e.ResourceQuota && e.ResourceQuota.status.hard) {
                e.Cpu = e.ResourceQuota.status.hard['limits.cpu']
                  ? parseFloat(sizeOfCpu(e.ResourceQuota.status.hard['limits.cpu']))
                  : 0;
                e.Memory = e.ResourceQuota.status.hard['limits.memory']
                  ? parseFloat(sizeOfStorage(e.ResourceQuota.status.hard['limits.memory']))
                  : 0;
                e.Storage = e.ResourceQuota.status.hard['requests.storage']
                  ? parseFloat(sizeOfStorage(e.ResourceQuota.status.hard['requests.storage']))
                  : 0;
              } else {
                e.Cpu = 0;
                e.Memory = 0;
                e.Storage = 0;
              }
              if (e.ResourceQuota && e.ResourceQuota.status.used) {
                e.UsedCpu = e.ResourceQuota.status.used['limits.cpu']
                  ? parseFloat(sizeOfCpu(e.ResourceQuota.status.used['limits.cpu']))
                  : 0;
                e.UsedMemory = e.ResourceQuota.status.used['limits.memory']
                  ? parseFloat(sizeOfStorage(e.ResourceQuota.status.used['limits.memory']))
                  : 0;
                e.UsedStorage = e.ResourceQuota.status.used['requests.storage']
                  ? parseFloat(sizeOfStorage(e.ResourceQuota.status.used['requests.storage']))
                  : 0;
              } else {
                e.UsedCpu = 0;
                e.UsedMemory = 0;
                e.UsedStorage = 0;
              }
              e.CpuPercentage = e.Cpu > 0 ? ((e.UsedCpu / e.Cpu) * 100).toFixed(1) : 0;
              e.MemoryPercentage = e.Memory > 0 ? ((e.UsedMemory / e.Memory) * 100).toFixed(1) : 0;
              e.StoragePercentage = e.Storage > 0 ? ((e.UsedStorage / e.Storage) * 100).toFixed(1) : 0;
              envs.push(e);
              this.items[key] = envs;
            });
          }
        }
      },
      async environmentList() {
        await this.projectEnvironmentAggregation();
        await this.networkPolicyDetail();
      },
      async networkPolicyDetail() {
        for (const clusterName in this.items) {
          const data = await getNetworkPolicyDetail(clusterName, this.Tenant().TenantName, {
            noprocessing: true,
          });
          const index = this.clusters.findIndex((c) => {
            return c.ClusterName === clusterName;
          });
          if (index > -1) {
            const item = this.clusters[index];
            item.Metadata = data.metadata;
            if (data.spec.projectNetworkPolicies) {
              const policy = data.spec.projectNetworkPolicies.find((n) => {
                return n.name === this.Project().ProjectName;
              });
              if (policy) {
                item.Isolation = true;
              } else {
                item.Isolation = false;
              }
            }
            this.$set(this.clusters, index, item);
          }
          if (data.spec.environmentNetworkPolicies) {
            this.items[clusterName].forEach((i, index) => {
              const policy = data.spec.environmentNetworkPolicies.find((n) => {
                return n.name === i.EnvironmentName;
              });
              const item = this.items[clusterName][index];
              if (policy) {
                item.Isolation = true;
              } else {
                item.Isolation = false;
              }
              this.$set(this.items[clusterName], index, item);
            });
          }
        }
      },
      async onNetworkPolicyChange(item, type) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.update_c', [
            this.$root.$t('resource.project_c', [this.$t('environment.table.network_isolation')]),
          ]),
          content: {
            text: `${this.$root.$t('operate.update_c', [
              ` ${type === 'project' ? this.Project().ProjectName : item.Env.EnvironmentName}`,
            ])} ${this.$t('environment.table.network_isolation')} ${this.$t('tip.policy')}`,
            type: 'confirm',
          },
          param: { item, type },
          doFunc: async (param) => {
            if (param.type === 'project') {
              await postUpdateProjectNetworkPolicy(this.Project().ID, {
                cluster_id: param.item.ClusterID,
                isolate: param.item.Isolation,
              });
            } else if (param.type === 'environment') {
              await postUpdateEnvironmentNetworkPolicy(param.item.Env.ID, {
                isolate: param.item.Isolation,
              });
            }
          },
          doClose: (param) => {
            if (param.type === 'project') {
              const index = this.clusters.findIndex((t) => {
                return t.ClusterName === param.item.ClusterName;
              });
              if (index > -1) {
                const cluster = this.clusters[index];
                cluster.Isolation = !cluster.Isolation;
                this.$set(this.clusters, index, cluster);
              }
            } else if (param.type === 'environment') {
              const index = this.items[param.item.Env.Cluster.ClusterName].findIndex((n) => {
                return n.EnvironmentName === param.item.EnvironmentName;
              });
              if (index > -1) {
                const env = this.items[param.item.Env.Cluster.ClusterName][index];
                env.Isolation = !env.Isolation;
                this.$set(this.items[param.item.Env.Cluster.ClusterName], index, env);
              }
            }
          },
        });
      },
      async environmentDetail(item) {
        this.$router.push({
          name: 'environment-detail',
          params: {
            tenant: this.Tenant().TenantName,
            project: this.Project().ProjectName,
            environment: item.Env.EnvironmentName,
          },
        });
      },
      getColor(percentage) {
        return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
      },
    },
  };
</script>

<style>
  .v-data-table .v-input__slot {
    background: none !important;
  }
  .v-expansion-panel-header .v-input__slot {
    background: none !important;
  }
</style>
