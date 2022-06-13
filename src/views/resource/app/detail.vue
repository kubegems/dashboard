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
            text
            small
            class="primary--text"
            @click="advancedDeploy"
          >
            <v-icon left small> fas fa-location-arrow </v-icon>
            高级部署
          </v-btn>

          <v-btn
            v-if="app && app.kind !== 'DaemonSet' && m_permisson_resourceAllow && $route.query.kind === 'app'"
            text
            small
            class="primary--text"
            @click="scaleReplicas"
          >
            <v-icon left small> fas fa-arrows-alt-v </v-icon>
            调整副本数
          </v-btn>
          <v-btn
            v-if="app && app.kind !== 'DaemonSet' && m_permisson_resourceAllow && $route.query.kind === 'app'"
            text
            small
            class="primary--text"
            @click="rollingback"
          >
            <v-icon left small> fas fa-redo-alt </v-icon>
            回滚
          </v-btn>
          <v-btn
            v-if="app && app.kind !== 'DaemonSet' && m_permisson_resourceAllow && $route.query.kind === 'app'"
            text
            small
            class="primary--text"
            @click="hpaStrategy"
          >
            <v-icon left small> fas fa-cogs </v-icon>
            弹性伸缩策略
          </v-btn>
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" text small @click="removeApp"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col cols="2" class="pt-0">
        <ResourceInfo :item="app" />
      </v-col>
      <v-col cols="10" class="pt-0">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" height="30" class="rounded-t pa-3">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :app="app" />
      </v-col>
    </v-row>

    <ScaleReplicas v-if="$route.query.kind === 'app'" ref="scaleReplicas" />
    <HPAStrategy v-if="$route.query.kind === 'app'" ref="hpaStrategy" />
    <Rollingback v-if="$route.query.kind === 'app'" ref="rollingback" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import ResourceInfo from './components/ResourceInfo';
  import ScaleReplicas from './components/ScaleReplicas';
  import HPAStrategy from './components/HPAStrategy';
  import Rollingback from './components/Rollingback';
  import { getAppRunningDetail, deleteApp, deleteAppStoreApp } from '@/api';
  import AppResourceFileList from '@/views/resource/appmanifest/components/AppResourceFileList';
  import AppDeployList from '@/views/resource/appmanifest/components/AppDeployList';
  import AppImageSecurityReportList from '@/views/resource/appmanifest/components/AppImageSecurityReportList';
  import DeployStatus from '@/views/resource/deploy/components/DeployStatus';
  import DeployControlCenter from '@/views/resource/deploy/components/DeployControlCenter';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'AppDetail',
    components: {
      ResourceInfo,
      AppResourceFileList,
      AppDeployList,
      AppImageSecurityReportList,
      DeployStatus,
      ScaleReplicas,
      HPAStrategy,
      DeployControlCenter,
      Rollingback,
    },
    mixins: [BaseResource, BasePermission],
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
            { text: '资源编排', value: 'AppResourceFileList' },
            { text: '控制中心', value: 'DeployControlCenter' },
            { text: '资源状态', value: 'DeployStatus' },
            { text: '部署历史', value: 'AppDeployList' },
            { text: '镜像安全', value: 'AppImageSecurityReportList' },
          ];
        } else {
          return [{ text: '资源状态', value: 'DeployStatus' }];
        }
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
        const envid = this.$route.query.environmentid ? this.$route.query.environmentid : this.Environment().ID;
        const data = await getAppRunningDetail(
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
        this.$router.replace({
          query: {
            ...this.$route.query,
            ...{ name: this.app.name, type: this.app.kind },
          },
        });
        this.watchApp();
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
        this.$refs.scaleReplicas.init();
        this.$refs.scaleReplicas.open();
      },
      hpaStrategy() {
        this.$refs.hpaStrategy.init();
        this.$refs.hpaStrategy.open();
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
        this.$store.commit('SET_CONFIRM', {
          title: this.$route.query.kind === 'app' ? '删除平台应用' : '删除应用商店应用',
          content: {
            text:
              this.$route.query.kind === 'app' ? `删除平台应用 ${this.app.name}` : `删除应用商店应用 ${this.app.name}`,
            type: 'delete',
            name: this.app.name,
          },
          param: {},
          doFunc: async () => {
            if (this.$route.query.kind === 'app') {
              await deleteApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, this.app.name);
            } else {
              await deleteAppStoreApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, this.app.name);
            }
            this.$router.push({ name: 'app-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-tooltip {
    display: inline-block !important;
  }
</style>
