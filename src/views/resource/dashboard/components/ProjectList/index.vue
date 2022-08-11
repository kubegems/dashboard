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
  <v-card>
    <BaseSubTitle class="pt-2" :divider="false" :title="$root.$t('resource.project')">
      <template #action>
        <v-btn v-if="m_permisson_tenantAllow" class="float-right mr-2" color="primary" small text @click="addProject">
          <v-icon left small> mdi-plus-box </v-icon>
          {{ $root.$t('operate.create_c', [$root.$t('resource.project')]) }}
        </v-btn>
      </template>
    </BaseSubTitle>
    <v-flex class="px-2">
      <v-expansion-panels v-if="pageCount > 0" v-model="expand" accordion class="project-panel" focusable>
        <v-expansion-panel v-for="(item, index) in projectItems" :key="index">
          <v-expansion-panel-header @click="projectEnvironmentList(item)">
            <v-flex class="text-subtitle-1">
              {{ item.ProjectName }}
              <span class="text-body-2 ml-3">{{ $t('project.table.alias') }} : {{ item.ProjectAlias }}</span>
              <span class="text-body-2 ml-3">{{ $t('project.table.remark') }} : {{ item.Remark }}</span>
              <v-btn
                v-if="m_permisson_projectAllow"
                class="float-right"
                color="primary"
                depressed
                small
                text
                @click.stop="addEnvironment(item)"
              >
                <v-icon left small> mdi-plus-box </v-icon>
                {{ $root.$t('operate.create_c', [$root.$t('resource.environment')]) }}
              </v-btn>
              <v-btn class="float-right" color="primary" depressed small text @click.stop="projectDetail(item)">
                <v-icon left small> mdi-login </v-icon>
                {{ $root.$t('operate.enter', [$root.$t('resource.project')]) }}
              </v-btn>
            </v-flex>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-data-table
              disable-sort
              :headers="headers"
              hide-default-footer
              :items="environmentItems"
              :no-data-text="$root.$t('data.no_data')"
            >
              <template #[`item.environmentName`]="{ item }">
                <BaseMarquee :content="item.EnvironmentName" :speed="20">
                  <a class="font-weight-medium" @click.stop="environmentDetail(item)">
                    {{ item.EnvironmentName }}
                  </a>
                </BaseMarquee>
              </template>
              <template #[`item.type`]="{ item }">
                <v-chip
                  :color="
                    $METATYPE_CN[item.MetaType] && $METATYPE_CN[item.MetaType].color
                      ? $METATYPE_CN[item.MetaType].color
                      : 'grey'
                  "
                  label
                  x-small
                >
                  {{ $t(`project.table.${item.MetaType}`) }}
                </v-chip>
              </template>
              <template #[`item.workload`]="{ item }">
                {{ item.Workload ? item.Workload : 0 }}
              </template>
              <template #[`item.job`]="{ item }">
                {{ item.Job ? item.Job : 0 }}
              </template>
              <template #[`item.configMap`]="{ item }">
                {{ item.ConfigMap ? item.ConfigMap : 0 }}
              </template>
              <template #[`item.secret`]="{ item }">
                {{ item.Secret ? item.Secret : 0 }}
              </template>
              <template #[`item.service`]="{ item }">
                {{ item.Service ? item.Service : 0 }}
              </template>
              <template #[`item.persistentvolumeclaims`]="{ item }">
                {{ item.Persistentvolumeclaims ? item.Persistentvolumeclaims : 0 }}
              </template>
              <template #[`item.ingress`]="{ item }">
                {{ item.Ingress ? item.Ingress : 0 }}
              </template>
              <template #[`item.pod`]="{ item }">
                {{ item.Pod ? item.Pod : 0 }}
              </template>
              <template #[`item.cpu`]="{ item }">
                <v-flex>
                  {{ item.LatestCpu ? item.LatestCpu : 0 }}
                </v-flex>
                <v-sparkline
                  auto-draw
                  :auto-draw-duration="200"
                  auto-line-width
                  color="rgba(29, 136, 229, 0.6)"
                  fill
                  :line-width="5"
                  smooth
                  type="trend"
                  :value="item.CpuUsed ? item.CpuUsed : []"
                />
              </template>
              <template #[`item.memory`]="{ item }">
                <v-flex>
                  {{ item.LatestMemory ? item.LatestMemory : 0 }}
                </v-flex>
                <v-sparkline
                  auto-draw
                  :auto-draw-duration="200"
                  auto-line-width
                  color="rgba(29, 136, 229, 0.6)"
                  fill
                  :line-width="5"
                  smooth
                  type="trend"
                  :value="item.MemoryUsed ? item.MemoryUsed : []"
                />
              </template>
              <template #[`item.in`]="{ item }">
                <v-flex>
                  {{ item.LatestNetwokrIn ? item.LatestNetwokrIn : 0 }}
                </v-flex>
                <v-sparkline
                  auto-draw
                  :auto-draw-duration="200"
                  auto-line-width
                  color="rgba(29, 136, 229, 0.6)"
                  fill
                  :line-width="5"
                  smooth
                  type="trend"
                  :value="item.NetworkInUsed ? item.NetworkInUsed : []"
                />
              </template>
              <template #[`item.out`]="{ item }">
                <v-flex>
                  {{ item.LatestNetwokrOut ? item.LatestNetwokrOut : 0 }}
                </v-flex>
                <v-sparkline
                  auto-draw
                  :auto-draw-duration="200"
                  auto-line-width
                  color="rgba(29, 136, 229, 0.6)"
                  fill
                  :line-width="5"
                  smooth
                  type="trend"
                  :value="item.NetwokrOutUsed ? item.NetwokrOutUsed : []"
                />
              </template>
              <template #[`item.action`]="{ item }">
                <span class="pa-2">
                  <v-btn color="primary" text x-small @click.stop="environmentDetail(item)">
                    <v-icon left small> mdi-login </v-icon>
                    {{ $root.$t('operate.enter', [$root.$t('resource.environment')]) }}
                  </v-btn>
                </span>
              </template>
            </v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <div v-else class="text-body-2" :style="{ position: 'relative', height: '300px' }">
        <span class="kubegems__full-center kubegems__text"> {{ $root.$t('data.no_data') }} </span>
      </div>

      <Pagination
        v-if="pageCount >= 1"
        v-model="pageParams.page"
        :page-count="pageCount"
        :size="pageParams.size"
        @changepage="onPageIndexChange"
        @loaddata="projectList"
      />

      <AddEnvironment ref="addEnvironment" @refresh="refreshEnvironmentList" />

      <AddProject ref="addProject" @refresh="refreshProjectList" />
    </v-flex>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import Pagination from '../Pagination';
  import { getProjectEnvironmentList, getProjectEnvironmentQuotaList, getProjectList } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { beautifyCpuUnit, beautifyNetworkUnit, beautifyStorageUnit } from '@/utils/helpers';
  import {
    ENVIRONMENT_CPU_USAGE_PROMQL,
    ENVIRONMENT_MEMORY_USAGE_PROMQL,
    ENVIRONMENT_NETWORK_IN_PROMQL,
    ENVIRONMENT_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';
  import AddEnvironment from '@/views/resource/environment/components/AddEnvironment';
  import AddProject from '@/views/resource/project/components/AddProject';

  export default {
    name: 'ProjectList',
    i18n: {
      messages: messages,
    },
    components: {
      AddEnvironment,
      AddProject,
      Pagination,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    inject: ['reload'],
    data: () => ({
      projectItems: [],
      environmentItems: [],
      pageCount: 0,
      pageParams: {
        page: 1,
        size: 5,
      },
      params: {
        start: '',
        end: '',
      },
      expand: null,
    }),
    computed: {
      ...mapState(['JWT', 'Admin']),
      ...mapGetters(['Tenant', 'Project']),
      headers() {
        return [
          { text: this.$root.$t('resource.environment'), value: 'environmentName', align: 'start', width: 100 },
          { text: this.$t('project.table.type'), value: 'type', align: 'start' },
          { text: this.$root.$t('resource.workload'), value: 'workload', align: 'start' },
          { text: this.$root.$t('resource.job'), value: 'job', align: 'start' },
          { text: this.$root.$t('resource.persistentvolumeclaim'), value: 'persistentvolumeclaims', align: 'start' },
          { text: this.$root.$t('resource.configmap'), value: 'configMap', align: 'start' },
          { text: this.$root.$t('resource.secret'), value: 'secret', align: 'start' },
          { text: this.$root.$t('resource.service'), value: 'service', align: 'start' },
          { text: this.$root.$t('resource.ingress'), value: 'ingress', align: 'start' },
          { text: this.$root.$t('resource.pod'), value: 'pod', align: 'start' },
          { text: this.$root.$t('resource.cpu'), value: 'cpu', align: 'start', width: 100 },
          { text: this.$root.$t('resource.memory'), value: 'memory', align: 'start', width: 100 },
          { text: this.$t('project.table.traffic_in'), value: 'in', align: 'start', width: 100 },
          { text: this.$t('project.table.traffic_out'), value: 'out', align: 'start', width: 100 },
          { text: this.$root.$t('operate.operate'), value: 'action', align: 'center', width: 100 },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        if (this.Tenant().ID > 0) {
          this.projectList();
          const end = new Date();
          const start = new Date(new Date().setMinutes(new Date().getMinutes() - 15));
          this.params.start = this.$moment(start).utc().format();
          this.params.end = this.$moment(end).utc().format();
        }
      }
    },
    methods: {
      async projectList() {
        const data = await getProjectList(
          this.Tenant().ID,
          Object.assign(this.pageParams, {
            noprocessing: true,
          }),
        );
        this.projectItems = data.List;
        this.pageCount = Math.ceil(data.Total / this.pageParams.size);
        this.pageParams.page = data.CurrentPage;
        if (this.projectItems.length > 0) {
          this.expand = 0;
          this.projectEnvironmentList(this.projectItems[0]);
        }
      },
      onPageIndexChange(page) {
        this.pageParams.page = page;
      },
      async projectEnvironmentList(item) {
        this.environmentItems = [];
        const data = await getProjectEnvironmentList(item.ID, { noprocessing: true });
        data.List.sort(function (a, b) {
          if (a.EnvironmentName < b.EnvironmentName) {
            return -1;
          }
          if (a.EnvironmentName > b.EnvironmentName) {
            return 1;
          }
          return 0;
        });
        this.environmentItems = data.List;
        await this.projectEnvironmentQuotaList(item);
        const envdict = {};
        this.environmentItems.forEach((e) => {
          if (Object.prototype.hasOwnProperty.call(envdict, e.Cluster.ClusterName)) {
            envdict[e.Cluster.ClusterName].push(e.EnvironmentName);
          } else {
            envdict[e.Cluster.ClusterName] = [e.EnvironmentName];
          }
        });
        for (const key in envdict) {
          this.environmentCPUUsage(key, envdict[key].join('|'));
          this.environmentMemoryUsage(key, envdict[key].join('|'));
          this.environmentNetworkIn(key, envdict[key].join('|'));
          this.environmentNetworkOut(key, envdict[key].join('|'));
        }
      },
      refreshEnvironmentList(item) {
        this.projectEnvironmentList(item);
        this.$emit('refresh');
      },
      async projectEnvironmentQuotaList(item) {
        const data = await getProjectEnvironmentQuotaList(item.ID, {
          noprocessing: true,
        });
        for (const key in data) {
          const index = this.environmentItems.findIndex((e) => {
            return e.EnvironmentName === key;
          });
          if (index > -1) {
            const env = this.environmentItems[index];
            env.Workload =
              data[key].quota && data[key].quota.status.used
                ? parseInt(data[key].quota.status.used['count/daemonsets.apps']) +
                  parseInt(data[key].quota.status.used['count/deployments.apps']) +
                  parseInt(data[key].quota.status.used['count/statefulsets.apps'])
                : 0;
            env.Job =
              data[key].quota && data[key].quota.status.used ? data[key].quota.status.used['count/jobs.batch'] : 0;
            env.ConfigMap =
              data[key].quota && data[key].quota.status.used ? data[key].quota.status.used['count/configmaps'] : 0;
            env.Secret =
              data[key].quota && data[key].quota.status.used ? data[key].quota.status.used['count/secrets'] : 0;
            env.Service =
              data[key].quota && data[key].quota.status.used ? data[key].quota.status.used['count/services'] : 0;
            env.Ingress =
              data[key].quota && data[key].quota.status.used
                ? data[key].quota.status.used['count/ingresses.extensions']
                : 0;
            env.Persistentvolumeclaims =
              data[key].quota && data[key].quota.status.used
                ? data[key].quota.status.used['count/persistentvolumeclaims']
                : 0;
            env.Pod = data[key].quota && data[key].quota.status.used ? data[key].quota.status.used['count/pods'] : 0;
            this.$set(this.environmentItems, index, env);
          }
        }
      },
      addEnvironment(item) {
        this.$refs.addEnvironment.setProjectId(item.ID);
        this.$refs.addEnvironment.open();
        this.$refs.addEnvironment.init(item.ID);
      },
      async environmentDetail(item) {
        this.$router.push({
          name: 'environment-detail',
          params: {
            tenant: this.Tenant().TenantName,
            project: item.Project.ProjectName,
            environment: item.EnvironmentName,
          },
        });
      },
      projectDetail(item) {
        this.$router.push({
          name: 'project-detail',
          query: {
            name: item.ProjectName,
          },
          params: {
            tenant: this.Tenant().TenantName,
            project: item.ProjectName,
          },
        });
      },
      async environmentCPUUsage(cluster, environments) {
        const data = await this.m_permission_matrix(
          cluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_CPU_USAGE_PROMQL.replaceAll('$1', environments),
            noprocessing: true,
          }),
        );
        data.forEach((d) => {
          const index = this.environmentItems.findIndex((e) => {
            return e.EnvironmentName === d.metric.environment;
          });
          if (index > -1) {
            const values = [];
            d.values.forEach((v) => {
              values.push(Math.floor(parseFloat(v[1]) * 1000) / 1000);
            });
            const item = this.environmentItems[index];
            item.LatestCpu = values.length > 0 ? beautifyCpuUnit(values[values.length - 1]) : 0;
            item.CpuUsed = values;
            this.$set(this.environmentItems, index, item);
          }
        });
      },
      async environmentMemoryUsage(cluster, environments) {
        const data = await this.m_permission_matrix(
          cluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_MEMORY_USAGE_PROMQL.replaceAll('$1', environments),
            noprocessing: true,
          }),
        );
        data.forEach((d) => {
          const index = this.environmentItems.findIndex((e) => {
            return e.EnvironmentName === d.metric.environment;
          });
          if (index > -1) {
            const values = [];
            d.values.forEach((v) => {
              values.push(Math.floor(parseFloat(v[1]) * 1000) / 1000);
            });
            const item = this.environmentItems[index];
            item.LatestMemory = values.length > 0 ? beautifyStorageUnit(values[values.length - 1]) : 0;
            item.MemoryUsed = values;
            this.$set(this.environmentItems, index, item);
          }
        });
      },
      async environmentNetworkIn(cluster, environments) {
        const data = await this.m_permission_matrix(
          cluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_NETWORK_IN_PROMQL.replaceAll('$1', environments),
            noprocessing: true,
          }),
        );
        data.forEach((d) => {
          const index = this.environmentItems.findIndex((e) => {
            return e.EnvironmentName === d.metric.environment;
          });
          if (index > -1) {
            const values = [];
            d.values.forEach((v) => {
              values.push(Math.floor((parseFloat(v[1]) / 1000) * 1000));
            });
            const item = this.environmentItems[index];
            item.LatestNetwokrIn = values.length > 0 ? beautifyNetworkUnit(values[values.length - 1]) : 0;
            item.NetworkInUsed = values;
            this.$set(this.environmentItems, index, item);
          }
        });
      },
      async environmentNetworkOut(cluster, environments) {
        const data = await this.m_permission_matrix(
          cluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_NETWORK_OUT_PROMQL.replaceAll('$1', environments),
            noprocessing: true,
          }),
        );
        data.forEach((d) => {
          const index = this.environmentItems.findIndex((e) => {
            return e.EnvironmentName === d.metric.environment;
          });
          if (index > -1) {
            const values = [];
            d.values.forEach((v) => {
              values.push(Math.floor((parseFloat(v[1]) / 1000) * 1000));
            });
            const item = this.environmentItems[index];
            item.LatestNetwokrOut = values.length > 0 ? beautifyNetworkUnit(values[values.length - 1]) : 0;
            item.NetwokrOutUsed = values;
            this.$set(this.environmentItems, index, item);
          }
        });
      },
      addProject() {
        if (this.Tenant().ID > 0) {
          this.$refs.addProject.open();
          this.$refs.addProject.init();
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或加入租户`,
            color: 'warning',
          });
        }
      },
      refreshProjectList() {
        this.projectList();
        this.$emit('refresh');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .project-panel {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
