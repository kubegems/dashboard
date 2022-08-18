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
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn
            v-if="
              app &&
              app.kind === 'Deployment' &&
              m_permisson_resourceAllow &&
              $route.query.kind === 'app' &&
              Plugins['argo-rollouts']
            "
            class="primary--text"
            small
            text
            @click="advancedDeploy"
          >
            <v-icon left small> mdi-send </v-icon>
            {{ $t('operate.advanced_deploy') }}
          </v-btn>

          <v-btn
            v-if="
              app &&
              app.kind !== 'DaemonSet' &&
              m_permisson_resourceAllow &&
              ($route.query.kind === 'app' || $route.query.kind === 'modelstore')
            "
            class="primary--text"
            small
            text
            @click="scaleReplicas"
          >
            <v-icon left small> mdi-arrow-up-down-bold </v-icon>
            {{ $t('operate.scale_replicas') }}
          </v-btn>
          <v-btn
            v-if="app && app.kind !== 'DaemonSet' && m_permisson_resourceAllow && $route.query.kind === 'app'"
            class="primary--text"
            small
            text
            @click="rollingback"
          >
            <v-icon left small> mdi-redo-variant </v-icon>
            {{ $t('operate.rollback') }}
          </v-btn>
          <v-btn
            v-if="app && m_permisson_resourceAllow && $route.query.kind === 'modelstore'"
            class="primary--text"
            small
            text
            @click="resourceYaml"
          >
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex v-if="$route.query.kind === 'modelstore'">
                  <v-btn color="primary" small text @click="updateModelRuntime"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeApp"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <ResourceInfo :item="app" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          :app="app"
          class="mt-3"
          :item="app"
          :selector="{
            topkind: 'ModelDeployment',
            topname: app ? app.name || app.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ScaleReplicas
      v-if="$route.query.kind === 'app' || $route.query.kind === 'modelstore'"
      ref="scaleReplicas"
      :item="app"
    />
    <Rollingback v-if="$route.query.kind === 'app'" ref="rollingback" />
    <ResourceYaml v-if="$route.query.kind === 'modelstore'" ref="resourceYaml" :item="app" />
    <UpdateModelRuntime ref="updateModelRuntime" @refresh="appRunningDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ModelMonitor from './components/ModelMonitor';
  import ModelResourceInfo from './components/ModelResourceInfo';
  import ResourceInfo from './components/ResourceInfo';
  import Rollingback from './components/Rollingback';
  import ScaleReplicas from './components/ScaleReplicas';
  import UpdateModelRuntime from './components/UpdateModelRuntime';
  import messages from './i18n';
  import { deleteApp, deleteAppStoreApp, deleteModelRuntime, getAppRunningDetail, getModelRuntimeDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import AppDeployList from '@/views/resource/appmanifest/components/AppDeployList';
  import AppImageSecurityReportList from '@/views/resource/appmanifest/components/AppImageSecurityReportList';
  import AppResourceFileList from '@/views/resource/appmanifest/components/AppResourceFileList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import DeployControlCenter from '@/views/resource/deploy/components/DeployControlCenter';
  import DeployStatus from '@/views/resource/deploy/components/DeployStatus';

  export default {
    name: 'AppDetail',
    i18n: {
      messages: messages,
    },
    components: {
      AppDeployList,
      AppImageSecurityReportList,
      AppResourceFileList,
      DeployControlCenter,
      DeployStatus,
      ModelMonitor,
      ModelResourceInfo,
      PodList,
      ResourceInfo,
      ResourceYaml,
      Rollingback,
      ScaleReplicas,
      UpdateModelRuntime,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      tab: 0,
      app: null,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS', 'Plugins']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      tabItems() {
        if (this.$route.query.kind === 'app') {
          return [
            { text: this.$t('tab.manifest'), value: 'AppResourceFileList' },
            { text: this.$t('tab.control_center'), value: 'DeployControlCenter' },
            { text: this.$t('tab.resource_status'), value: 'DeployStatus' },
            { text: this.$t('tab.deploy_history'), value: 'AppDeployList' },
            { text: this.$t('tab.image_safey'), value: 'AppImageSecurityReportList' },
          ];
        } else if (this.$route.query.kind === 'appstore') {
          return [{ text: this.$t('tab.resource_status'), value: 'DeployStatus' }];
        } else if (this.$route.query.kind === 'modelstore') {
          return [
            { text: this.$t('tab.runtime'), value: 'ModelResourceInfo' },
            { text: this.$root.$t('tab.pod'), value: 'PodList' },
            { text: this.$root.$t('tab.monitor'), value: 'ModelMonitor' },
          ];
        }
        return [];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: function (updatingApp) {
          if (!updatingApp) return;
          const app = JSON.parse(updatingApp);
          if (app.MessageType !== 'objectChanged') return;
          if (app.Content && this.app && app.Content.AppName === this.app.AppName) {
            if (app.EventKind === 'delete') {
              this.$router.push({ name: 'app-list', params: this.$route.params });
            } else {
              this.app.runtime.raw = app.Content;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.appRunningDetail();
          if (this.$route.query.tab) {
            this.tab = parseInt(this.$route.query.tab);
          }
        });
      }
    },
    methods: {
      async appRunningDetail() {
        let data = {};
        if (this.$route.query.kind === 'modelstore') {
          data = await getModelRuntimeDetail(
            this.Tenant().TenantName,
            this.Project().ProjectName,
            this.Environment().EnvironmentName,
            this.$route.params.name,
          );
          this.app = data;
        } else {
          const envid = this.$route.query.environmentid ? this.$route.query.environmentid : this.Environment().ID;
          data = await getAppRunningDetail(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            envid,
            this.$route.params.name,
          );
          data.ProjectID = this.$route.query.projectid;
          data.TenantID = this.$route.query.tenantid;
          data.EnvironmentID = envid;
          data.namespace = this.$route.query.namespace;
          this.app = data;

          this.watchApp();
        }

        this.$router.replace({
          query: {
            ...this.$route.query,
            ...{ name: this.app.name, type: this.app.kind },
          },
        });
      },
      watchApp() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchAppList = [];
        watchAppList.push(`${this.Environment().EnvironmentName}/${this.app.name}`);
        sub.content[this.ThisCluster] = { Application: watchAppList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      scaleReplicas() {
        this.$refs.scaleReplicas.init(this.$route.query.kind);
        this.$refs.scaleReplicas.open();
      },
      rollingback() {
        this.$refs.rollingback.init();
        this.$refs.rollingback.open();
      },
      advancedDeploy() {
        this.$router.push({
          name: 'app-deploy',
          params: Object.assign(this.$route.params, { name: this.app.name }),
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
            kind: 'app',
            namespace: this.Environment().Namespace,
            type: this.$route.query.type,
          },
        });
      },
      removeApp() {
        let title = this.$root.$t('operate.delete_c', [this.$t('tip.platform_app')]);
        if (this.$route.query.kind === 'appstore') {
          title = this.$root.$t('operate.delete_c', [this.$t('tip.app_store_app')]);
        } else if (this.$route.query.kind === 'modelstore') {
          title = this.$root.$t('operate.delete_c', [this.$t('tip.model_store_app')]);
        }
        this.$store.commit('SET_CONFIRM', {
          title: title,
          content: {
            text: `${title} ${this.app?.name || this.app?.metadata?.name}`,
            type: 'delete',
            name: this.app?.name || this.app?.metadata?.name,
          },
          param: {},
          doFunc: async () => {
            if (this.$route.query.kind === 'app') {
              await deleteApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, this.app.name);
            } else if (this.$route.query.kind === 'appstore') {
              await deleteAppStoreApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, this.app.name);
            } else if (this.$route.query.kind === 'modelstore') {
              await deleteModelRuntime(
                this.Tenant().TenantName,
                this.Project().ProjectName,
                this.Environment().EnvironmentName,
                this.app.name,
              );
            }
            this.$router.push({ name: 'app-list', params: this.$route.params });
          },
        });
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateModelRuntime() {
        this.$refs.updateModelRuntime.init(this.app);
        this.$refs.updateModelRuntime.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-tooltip {
    display: inline-block !important;
  }
</style>
