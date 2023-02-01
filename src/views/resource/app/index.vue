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
  <v-container fluid>
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.app_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow && tab === 0" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="linkApp">
                  <v-icon left>mdi-link</v-icon>
                  {{ $t('operate.link_c', [$root.$t('resource.app')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="deployApp">
                  <v-icon left>mdi-send</v-icon>
                  {{ $root.$t('operate.deploy_c', [$root.$t('resource.app')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>

        <v-data-table
          calculate-widths
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="params.size"
          :no-data-text="$root.$t('data.no_data')"
          :page.sync="params.page"
          @update:sort-by="m_table_sortBy"
          @update:sort-desc="m_table_sortDesc"
        >
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="appDetail(item)">
              {{ item.name }}
            </a>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind }}
          </template>
          <template #[`item.chart`]="{ item }">
            {{ item.chart }}
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.creator }}
          </template>
          <template #[`item.repo`]="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-1"
                :icon-name="item.runtime.annotations['application.kubegems.io/repo'] || 'helm'"
                :ml="0"
                :style="{ marginTop: '0px' }"
                :width="18"
              />
            </div>
            <div class="float-left">
              {{ item.runtime.annotations['application.kubegems.io/repo'] || '--' }}
            </div>
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex v-for="(value, index) in item.runtime.images" :key="index">
              {{ value }}
            </v-flex>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.runtime.createAt ? $moment(item.runtime.createAt).format('lll') : '' }}
          </template>
          <template #[`item.taskStatus`]="{ item, index }">
            <TaskStatusTip
              :index="index"
              :item="item"
              :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
            />
          </template>
          <template #[`item.appStatus`]="{ item, index }">
            <v-flex :id="`e${item.name}`" />
            <AppStatusTip :item="item" :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)">
              <template #trigger>
                <span
                  :class="`v-avatar mr-1 ${item.runtime.status === 'Progressing' ? 'kubegems__waiting-flashing' : ''}`"
                  :style="{
                    height: '10px',
                    minWidth: '10px',
                    width: '10px',
                    backgroundColor: `${
                      ARGO_STATUS_COLOR[item.runtime.status] ? ARGO_STATUS_COLOR[item.runtime.status] : 'grey'
                    }`,
                  }"
                />
                {{ item.runtime.status ? item.runtime.status : '' }}
                {{ getStatus(item) }}
              </template>
            </AppStatusTip>
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.name}`" />
            <v-menu :attach="`#r${item.name}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="error" small text @click="removeApp(item)"> {{ $root.$t('operate.delete') }}</v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>

          <template #[`item.instanceName`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="appDetail(item)">
              {{ item && item.metadata ? item.metadata.name : '' }}
            </a>
          </template>
          <template #[`item.modelName`]="{ item }">
            {{ item.spec ? item.spec.model.name : '' }}
          </template>
          <template #[`item.modelVersion`]="{ item }">
            {{ item.spec.model.version }}
          </template>
          <template #[`item.source`]="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-1"
                :icon-name="item.spec.model.source"
                :ml="0"
                :style="{ marginTop: '0px' }"
                :width="18"
              />
            </div>
            <div class="float-left">
              {{ item.spec.model.source }}
            </div>
          </template>
          <template #[`item.task`]="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-1"
                default-logo="task"
                :icon-name="item.spec.model.task"
                :ml="0"
                :style="{ marginTop: '0px' }"
                :width="18"
              />
            </div>
            <div class="float-left">
              {{ item.spec.model.task }}
            </div>
          </template>
          <template #[`item.phase`]="{ item }">
            <span
              :class="`v-avatar mr-2 ${
                ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(item.status.phase) > -1
                  ? 'kubegems__waiting-flashing'
                  : ''
              }`"
              :style="{
                height: '10px',
                minWidth: '10px',
                width: '10px',
                backgroundColor: `${POD_STATUS_COLOR[item.status.phase] || '#ff5252'}`,
              }"
            />
            <span>
              {{ item.status.phase || 'No Status' }}
            </span>
          </template>
          <template #[`item.url`]="{ item }">
            {{ item.status.url }}
            <v-btn v-clipboard:copy="item.status.url" v-clipboard:success="onCopy" color="primary" icon small>
              <v-icon color="primary" small> mdi-content-copy </v-icon>
            </v-btn>
          </template>
          <template #[`item.replicas`]="{ item }">
            {{ item.spec.replicas }}
          </template>
          <template #[`item.creationTimestamp`]="{ item }">
            {{ $moment(item.metadata.creationTimestamp).format('lll') }}
          </template>
          <template #[`item.modelAction`]="{ item }">
            <v-flex :id="`r${item.metadata.name}m`" />
            <v-menu :attach="`#r${item.metadata.name}m`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateModelRuntime(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeModelRuntime(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
          <template #[`item.preview`]="{ item }">
            <v-btn
              v-if="
                item &&
                item.status.phase === 'Running' &&
                (item.spec.model.source === 'huggingface' || item.spec.model.source === 'openmmlab')
              "
              color="primary"
              small
              text
              @click="experienceModel(item)"
            >
              <v-icon color="primary" left> mdi-eye </v-icon>
              {{ $t('operate.experience') }}
            </v-btn>
          </template>
        </v-data-table>
        <BasePagination
          v-if="pageCount >= 1"
          v-model="params.page"
          :page-count="pageCount"
          :size="params.size"
          @changepage="onPageIndexChange"
          @changesize="onPageSizeChange"
          @loaddata="appRunningList"
        />
      </v-card-text>
    </v-card>

    <LinkApp ref="linkApp" @refresh="appRunningList" />
    <DeployApp ref="deployApp" @refresh="appRunningList" />
    <UpdateModelRuntime ref="updateModelRuntime" @refresh="appRunningList" />
    <ModelExperience ref="modelExperience" :item="item" />
  </v-container>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapGetters, mapState } from 'vuex';

  import AppStatusTip from './components/AppStatusTip';
  import TaskStatusTip from './components/TaskStatusTip';
  import UpdateModelRuntime from './components/UpdateModelRuntime';
  import messages from './i18n';
  import {
    deleteApp,
    deleteAppStoreApp,
    deleteModelRuntime,
    getAppRunningList,
    getAppStoreRunningList,
    getAppTaskList,
    getModelRuntimePodList,
    getModelStoreDetail,
  } from '@/api';
  import { ARGO_STATUS_COLOR, POD_STATUS_COLOR } from '@/constants/resource';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import ModelExperience from '@/views/modelstore/components/detail_tabs/Runtime/components/ModelExperience';
  import DeployApp from '@/views/resource/appmanifest/components/DeployApp';
  import LinkApp from '@/views/resource/appmanifest/components/LinkApp';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'App',
    i18n: {
      messages: messages,
    },
    components: {
      AppStatusTip,
      DeployApp,
      LinkApp,
      ModelExperience,
      NamespaceFilter,
      TaskStatusTip,
      UpdateModelRuntime,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data() {
      this.tabMap = {
        app: 0,
        appstore: 1,
        modelstore: 2,
      };
      this.ARGO_STATUS_COLOR = ARGO_STATUS_COLOR;
      this.POD_STATUS_COLOR = POD_STATUS_COLOR;

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
        tab: this.tabMap[this.$route.query.tab] || 0,
        item: {},
      };
    },
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport', 'MessageStreamWS']),
      ...mapGetters(['Tenant', 'Environment', 'Project']),
      tabItems() {
        if (this.ThisAppEnvironmentID > 0) {
          return [
            { text: this.$t('tip.platform_app'), value: 'AppList', tab: 'app' },
            { text: this.$t('tip.app_store_app'), value: 'AppStoreList', tab: 'appstore' },
            { text: this.$t('tip.model_store_app'), value: 'ModelStoreList', tab: 'modelstore' },
          ];
        } else {
          return [{ text: this.$t('tip.platform_app'), value: 'AppList', tab: 'app' }];
        }
      },
      headers() {
        let items = [];
        if (this.tabItems[this.tab].value === 'AppList' || this.tabItems[this.tab].value === 'AppStoreList') {
          items = [
            { text: this.$t('table.name'), value: 'name', align: 'start' },
            { text: this.$t('table.kind'), value: 'kind', align: 'start', sortable: false },
            {
              text: this.$t('table.image_version'),
              value: 'images',
              align: 'start',
              sortable: false,
            },
            {
              text: this.$t('table.status'),
              value: 'appStatus',
              align: 'start',
              width: 220,
              sortable: false,
            },
            {
              text: this.$t('table.publisher'),
              value: 'creator',
              align: 'start',
              sortable: false,
            },
            { text: this.$t('table.publish_at'), value: 'createAt', align: 'start' },
          ];
          if (this.tabItems[this.tab].value === 'AppList') {
            items.splice(3, 0, {
              text: this.$t('table.task_status'),
              value: 'taskStatus',
              align: 'start',
              sortable: false,
            });
          }
          if (this.tabItems[this.tab].value === 'AppStoreList') {
            items.splice(1, 0, {
              text: 'Chart',
              value: 'chart',
              align: 'start',
              sortable: false,
            });
            items.splice(2, 0, {
              text: this.$t('table.repo'),
              value: 'repo',
              align: 'start',
              sortable: false,
            });
          }
          if (this.m_permisson_resourceAllow || this.AdminViewport) {
            items.push({
              text: '',
              value: 'action',
              align: 'center',
              width: 20,
              sortable: false,
            });
          }
        } else {
          items = [
            { text: this.$t('table.instance_name'), value: 'instanceName', align: 'start', width: 150 },
            { text: this.$t('table.model_name'), value: 'modelName', align: 'start', sortable: false },
            { text: this.$t('table.model_version'), value: 'modelVersion', align: 'start', sortable: false },
            { text: this.$t('table.replicas'), value: 'replicas', align: 'start', sortable: false },
            { text: this.$t('table.source'), value: 'source', align: 'start', sortable: false, width: 150 },
            { text: this.$t('table.task'), value: 'task', align: 'start', sortable: false, width: 230 },
            { text: this.$t('table.status'), value: 'phase', align: 'start', sortable: false, width: 120 },
            { text: 'Api', value: 'url', align: 'start', sortable: false },
            { text: this.$root.$t('resource.create_at'), value: 'creationTimestamp', align: 'start', width: 120 },
            { text: '', value: 'preview', align: 'center', sortable: false },
            { text: '', value: 'modelAction', align: 'center', width: 20, sortable: false },
          ];
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.app_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.appRunningList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingApp) {
          if (!updatingApp) return;
          const app = JSON.parse(updatingApp);
          if (app.MessageType !== 'objectChanged') return;

          if (app.InvolvedObject.Kind === 'Application') {
            if (app.EventKind === 'delete') {
              this.m_table_generateParams();
              this.appRunningList(true);
              return;
            }
            if (app.EventKind === 'add' && this.params.page === 1) {
              this.appRunningList(true);
              return;
            }
            const index = this.items.findIndex((a) => {
              return a.name === app.Content.name;
            });
            if (index > -1) {
              const item = this.items[index];
              let newItem = {};
              if (item.task) {
                newItem = { ...app.Content, task: item.task };
              } else {
                newItem = app.Content;
              }
              this.$set(this.items, index, newItem);
            }
          } else if (app.InvolvedObject.Kind === 'Task') {
            const index = this.items.findIndex((a) => {
              return `${this.Environment().Namespace}/${a.name}` === app.InvolvedObject.NamespacedName;
            });
            if (index > -1) {
              const item = this.items[index];
              item.task = app.Content;
              this.$set(this.items, index, item);
            }
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.appRunningList(true);
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.AdminViewport && this.Project().ID === 0) {
          return;
        }
        this.m_table_generateParams();
        this.appRunningList();
      });
    },
    methods: {
      async onTabChange() {
        this.params.page = 1;
        this.items = [];
        await this.appRunningList();
      },
      linkApp() {
        this.$refs.linkApp.open();
      },
      deployApp() {
        this.$refs.deployApp.init();
        this.$refs.deployApp.open();
      },
      async appRunningList(noprocess = false) {
        let kind = 'app';
        let data = {};
        if (this.tabItems[this.tab].value === 'AppList') {
          kind = 'app';
          data = await getAppRunningList(
            this.Tenant().ID,
            this.Project().ID,
            this.ThisAppEnvironmentID,
            Object.assign(this.params, {
              kind: kind,
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else if (this.tabItems[this.tab].value === 'AppStoreList') {
          kind = 'appstore';
          data = await getAppStoreRunningList(
            this.Tenant().ID,
            this.Project().ID,
            this.ThisAppEnvironmentID,
            Object.assign(this.params, {
              kind: kind,
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else if (this.tabItems[this.tab].value === 'ModelStoreList') {
          kind = 'modelstore';
          data = await getModelRuntimePodList(
            this.Tenant().TenantName,
            this.Project().ProjectName,
            this.Environment().EnvironmentName,
            Object.assign(this.params, {
              kind: kind,
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        }
        this.items = data.List || data.list;
        this.pageCount = Math.ceil((data.Total || data.total) / this.params.size);
        this.params.page = data.CurrentPage || data.page;
        this.$router.replace({
          query: { ...this.$route.query, ...this.params, ...{ tab: this.tabItems[this.tab].tab } },
        });
        if (this.tabItems[this.tab].value === 'AppList') {
          this.watchAppList();
          this.appTaskList();
        }
      },
      async appTaskList() {
        const data = await getAppTaskList(this.Tenant().ID, this.Project().ID, this.ThisAppEnvironmentID, {
          names: this.items
            .map((item) => {
              return item.name;
            })
            .join(','),
          noprocessing: true,
        });
        this.items.map((item, index) => {
          const task = data.find((d) => {
            return d.name === item.name;
          });
          if (task) this.$set(this.items, index, { ...item, task: task.task });
        });
      },
      watchAppList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchAppList = [];
        this.items.forEach((app) => {
          watchAppList.push(`${this.Environment().Namespace}/${app.name}`);
        });
        if (this.tabItems[this.tab].value === 'AppList') {
          sub.content[this.ThisCluster] = {
            Application: watchAppList,
            Task: watchAppList,
          };
        } else {
          sub.content[this.ThisCluster] = {
            Application: watchAppList,
          };
        }
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      appDetail(item) {
        let kind = 'app';
        if (this.tabItems[this.tab].value === 'AppList') {
          kind = 'app';
        } else if (this.tabItems[this.tab].value === 'AppStoreList') {
          kind = 'appstore';
        } else if (this.tabItems[this.tab].value === 'ModelStoreList') {
          kind = 'modelstore';
        }
        this.$router.push({
          name: 'app-detail',
          params: Object.assign(this.$route.params, { name: item.name || item.metadata.name }),
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
            environmentid: this.Environment().ID,
            kind: kind,
            namespace: this.Environment().Namespace,
          },
        });
      },
      removeApp(item) {
        this.$store.commit('SET_CONFIRM', {
          title:
            this.tabItems[this.tab].value === 'AppList'
              ? this.$root.$t('operate.delete_c', [this.$t('tip.platform_app')])
              : this.$root.$t('operate.delete_c', [this.$t('tip.app_store_app')]),
          content: {
            text:
              this.tabItems[this.tab].value === 'AppList'
                ? `${this.$root.$t('operate.delete_c', [this.$t('tip.platform_app')])} ${item.name}`
                : `${this.$root.$t('operate.delete_c', [this.$t('tip.app_store_app')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (this.tabItems[this.tab].value === 'AppList') {
              await deleteApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, param.item.name);
            } else {
              await deleteAppStoreApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, param.item.name);
            }
            this.appRunningList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getStatus(item) {
        const status = [];
        if (!['Synced', 'OutOfSync'].includes(item?.runtime?.raw?.status?.sync?.status)) {
          status.push(`Sync: ${item?.runtime?.raw?.status?.sync?.status || this.$root.$t('data.unknown')}`);
        }
        if (item?.runtime?.raw?.status?.operationState?.phase !== 'Succeeded') {
          status.push(
            `Operation: ${item?.runtime?.raw?.status?.operationState?.phase || this.$root.$t('data.unknown')}`,
          );
        }
        return status.length > 0 ? `( ${status.join(', ')} ) ` : '';
      },
      removeModelRuntime(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('tip.model_store_app')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('tip.model_store_app')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteModelRuntime(
              this.Tenant().TenantName,
              this.Project().ProjectName,
              this.Environment().EnvironmentName,
              param.item.metadata.name,
            );
            this.appRunningList();
          },
        });
      },
      updateModelRuntime(item) {
        this.$refs.updateModelRuntime.init(item);
        this.$refs.updateModelRuntime.open();
      },
      async modelDetail(item) {
        const data = await getModelStoreDetail(item.spec.model.source, Base64.encode(item.spec.model.name));
        this.item = { ...data };
      },
      async experienceModel(item) {
        if (item?.status?.phase !== 'Running') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.status_error'),
            color: 'warning',
          });
          return;
        }
        await this.modelDetail(item);
        this.$refs.modelExperience.init(item);
        this.$refs.modelExperience.open();
      },
      onCopy() {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.copyed'),
          color: 'success',
        });
      },
    },
  };
</script>
