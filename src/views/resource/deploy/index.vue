<template>
  <v-container fluid>
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-subtitle-2 mx-2 deploy-line-height">
            <template v-if="taskStatus === 'Running' || taskStatus === 'Pending'">
              <v-icon color="warning" class="icon-font waiting-circle-flashing"> mdi-autorenew </v-icon>
              <span class="warning--text">
                {{ deploy ? '应用部署中' : '策略变更中' }}
              </span>
            </template>
            <template v-else-if="taskStatus === 'Success' && deploy">
              <v-icon color="success" class="icon-font"> mdi-check-circle </v-icon>
              <span class="success--text"> 应用已部署 </span>
            </template>
            <template v-else-if="taskStatus === 'Error'">
              <v-menu top open-on-hover :close-delay="200" nudge-bottom="10px">
                <template #activator="{ on }">
                  <span class="error--text" style="cursor: pointer" v-on="on">
                    <v-icon color="error" class="icon-font"> mdi-close-circle </v-icon>
                    {{ deploy ? '应用部署失败' : '策略变更失败' }}
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> {{ taskErrorMsg }} </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </span>
          <v-btn text small class="primary--text" @click="returnAppDetail">
            <v-icon left small> fas fa-share-square </v-icon>
            返回
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-n3 deploy-pos">
      <v-col cols="3">
        <v-card height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> 滚动更新 </span>
            <v-spacer />
            <v-btn
              small
              color="primary"
              :disabled="
                (runtime &&
                  runtime.strategy.type !== undefined &&
                  (runtime.strategy.type === 'BlueGreen' || runtime.strategy.type === 'Canary')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              @click="deployRollingUpdate"
            >
              部署
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/rollingupdate.png" width="100%" />
            </v-flex>
            RollingUpdate
            慢慢的用新版本替换旧版本。随着新版本的出现，旧版本会按比例缩小，以保持应用程序的整体数量。这是Deployment对象的默认策略。
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> 重建 </span>
            <v-spacer />
            <v-btn
              small
              color="primary"
              :disabled="
                (runtime &&
                  runtime.strategy.type !== undefined &&
                  (runtime.strategy.type === 'BlueGreen' || runtime.strategy.type === 'Canary')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              @click="deployRecreate"
            >
              部署
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/recreate.png" width="100%" />
            </v-flex>
            重新创建部署会在启动新版本之前删除旧版本的应用程序，因此，这可以保证应用程序的两个版本永远不会同时运行，但在部署期间会出现停机间隔。
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> 蓝绿发布 </span>
            <v-spacer />
            <v-btn
              small
              color="primary"
              :disabled="
                (runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              @click="deployBlueGreen"
            >
              部署
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/bluegreen.png" width="100%" />
            </v-flex>
            蓝绿部署（有时称为红黑）同时部署了新旧版本的应用程序，在此期间，只有旧版本的应用程序会收到生产流量，这允许开发人员在将实时流量切换到新版本之前针对新版本进行测试。
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> 金丝雀发布（灰度） </span>
            <v-spacer />
            <v-btn
              small
              color="primary"
              :disabled="
                (runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              @click="deployCanary"
            >
              部署
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/canary.png" width="100%" />
            </v-flex>
            Canary
            部署将一部分用户暴露给新版本的应用程序，同时将其余流量提供给旧版本。新版本经验证无误后，可逐步替换旧版本。入口控制器和服务网格（例如Nginx和Istio）为金丝雀启用了比原生可用更为复杂的流量整合模式。（例如实现非常细粒度的流量拆分，或基于http
            header的拆分）
          </v-card-text>
        </v-card>
      </v-col>
      <v-flex
        :class="`ma-3 deploy-overlay ${
          runtime &&
          (runtime.strategy.type === undefined ||
            runtime.strategy.type === 'Recreate' ||
            runtime.strategy.type === 'RollingUpdate')
            ? 'deploy-right-1'
            : 'deploy-left-1'
        }`"
      />
      <v-flex
        :class="`ma-3 deploy-switch ${
          runtime &&
          (runtime.strategy.type === undefined ||
            runtime.strategy.type === 'Recreate' ||
            runtime.strategy.type === 'RollingUpdate')
            ? 'deploy-right-1'
            : 'deploy-left-1'
        }`"
      >
        <v-flex class="deploy-switch-btn">
          <v-btn
            :disabled="taskStatus === 'Running' || taskStatus === 'Pending'"
            color="primary"
            @click="
              switchDeployMode(
                runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')
                  ? { text: '蓝绿', value: 'BlueGreen' }
                  : { text: '滚动更新', value: 'RollingUpdate' },
              )
            "
          >
            切换模式
          </v-btn>
        </v-flex>
      </v-flex>

      <v-flex
        :class="`ma-3 deploy-overlay ${
          runtime &&
          (runtime.strategy.type === undefined ||
            runtime.strategy.type === 'Recreate' ||
            runtime.strategy.type === 'RollingUpdate')
            ? 'deploy-right-2'
            : 'deploy-left-2'
        }`"
      />
      <v-flex
        :class="`ma-3 deploy-switch ${
          runtime &&
          (runtime.strategy.type === undefined ||
            runtime.strategy.type === 'Recreate' ||
            runtime.strategy.type === 'RollingUpdate')
            ? 'deploy-right-2'
            : 'deploy-left-2'
        }`"
      >
        <v-flex class="deploy-switch-btn">
          <v-btn
            :disabled="taskStatus === 'Running' || taskStatus === 'Pending'"
            color="primary"
            @click="
              switchDeployMode(
                runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')
                  ? { text: '金丝雀（灰度）', value: 'Canary' }
                  : { text: '重建', value: 'Recreate' },
              )
            "
          >
            切换模式
          </v-btn>
        </v-flex>
      </v-flex>
    </v-row>

    <Recreate ref="recreate" @refresh="refresh" />
    <RollingUpdate ref="rollingUpdate" @refresh="refresh" />
    <BlueGreen ref="blueGreen" @refresh="refresh" />
    <Canary ref="canary" @refresh="refresh" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { getStrategyDeployEnvironmentAppsDetail, postSwitchDeployAppStrategy } from '@/api';
  import Recreate from './components/deploy_policy/Recreate';
  import RollingUpdate from './components/deploy_policy/RollingUpdate';
  import BlueGreen from './components/deploy_policy/BlueGreen';
  import Canary from './components/deploy_policy/Canary';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'AppDeployCenter',
    components: {
      Recreate,
      RollingUpdate,
      BlueGreen,
      Canary,
    },
    mixins: [BaseResource, BasePermission],
    data: () => ({
      runtime: null,
      statusSSE: null,
      taskStatus: '',
      taskErrorMsg: '',
      deploy: true,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    created() {
      window.addEventListener('beforeunload', this.closeStatusSSE);
      window.addEventListener('unload', this.closeStatusSSE);
    },
    destroyed() {
      this.closeStatusSSE();
      window.removeEventListener('beforeunload', this.closeStatusSSE);
      window.removeEventListener('unload', this.closeStatusSSE);
    },
    mounted() {
      this.$nextTick(() => {
        this.strategyDeployEnvironmentAppsDetail();
        this.switchStrategyDeployTaskStatus(false);
      });
    },
    methods: {
      async strategyDeployEnvironmentAppsDetail(noprocess = false) {
        const data = await getStrategyDeployEnvironmentAppsDetail(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          { noprocessing: noprocess },
        );
        this.runtime = data;
      },
      async switchStrategyDeployTaskStatus(deploy = true) {
        this.deploy = deploy;
        const url = `/api/v1/tenant/${this.Tenant().ID}/project/${this.Project().ID}/environment/${
          this.Environment().ID
        }/applications/${this.$route.params.name}/tasks?token=${this.JWT}&limit=1&type=${
          deploy ? 'strategy-deploy' : 'switch-strategy'
        }&watch=true`;
        const vue = this;
        this.statusSSE = new EventSource(url, { withCredentials: true });
        this.statusSSE.onopen = () => {};
        this.statusSSE.addEventListener(
          'data',
          function (event) {
            if (event.data && event.data.length > 0) {
              const data = JSON.parse(event.data);
              if (data && data.length > 0) {
                const task = data[0];
                if (task.status) {
                  vue.taskStatus = task.status.status;
                  if (task.status.status === 'Error') {
                    vue.taskErrorMsg = task.status.message;
                  } else if (task.status.status === 'Success') {
                    if (!deploy) {
                      vue.strategyDeployEnvironmentAppsDetail(true);
                    }
                  }
                }
              } else {
                vue.taskStatus = '';
              }
            }
          },
          false,
        );
        this.statusSSE.onerror = () => {
          // this.$store.commit('SET_SNACKBAR', {
          //   text: `建立连接失败`,
          //   color: 'error',
          // })
        };
        this.statusSSE.addEventListener(
          'err',
          function () {
            vue.closeStatusSSE();
          },
          false,
        );
      },
      closeStatusSSE() {
        if (this.statusSSE) {
          this.statusSSE.close();
        }
      },
      refresh(deploy = true) {
        this.closeStatusSSE();
        this.switchStrategyDeployTaskStatus(deploy);
      },
      switchDeployMode(mode) {
        this.$store.commit('SET_CONFIRM', {
          title: `切换部署模式`,
          content: {
            text: `应用部署切换为 <span class="warning--text">${mode.text}</span> 模式，该模式首次运行时会自动触发流量切换，请确认执行。`,
            type: 'confirm',
          },
          param: { mode },
          doFunc: async (param) => {
            await postSwitchDeployAppStrategy(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
              { type: param.mode.value },
            );
            this.refresh(false);
          },
        });
      },
      returnAppDetail() {
        this.$router.push({
          name: 'app-detail',
          params: Object.assign(this.$route.params, { name: this.$route.params.name }),
          query: {
            projectid: this.$route.query.projectid,
            tenantid: this.$route.query.tenantid,
            kind: 'app',
            namespace: this.Environment().Namespace,
          },
        });
      },
      async deployRecreate() {
        await this.$refs.recreate.init();
        this.$refs.recreate.open();
      },
      async deployRollingUpdate() {
        await this.$refs.rollingUpdate.init();
        this.$refs.rollingUpdate.open();
      },
      async deployBlueGreen() {
        await this.$refs.blueGreen.init();
        this.$refs.blueGreen.open();
      },
      async deployCanary() {
        await this.$refs.canary.init();
        this.$refs.canary.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .deploy-pos {
    position: relative;
  }

  .deploy-switch {
    position: absolute;
    z-index: 15;
    margin: auto;
    top: 0;
    bottom: 0;
  }

  .deploy-switch-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .deploy-overlay {
    opacity: 0.2;
    background-color: rgb(33, 33, 33);
    border-color: rgb(33, 33, 33);
    position: absolute;
    z-index: 10;
    margin: auto;
    top: 0;
    bottom: 0;
    border-radius: 3px;
  }

  .deploy-left-1 {
    left: 0;
    right: 75%;
  }

  .deploy-left-2 {
    left: 25%;
    right: 50%;
  }

  .deploy-right-1 {
    left: 50%;
    right: 25%;
  }

  .deploy-right-2 {
    left: 75%;
    right: 0;
  }

  .icon-font {
    font-size: 22px;
  }

  .waiting-circle-flashing {
    animation-name: animate-waiting-circle-flash;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-direction: normal;
  }

  @keyframes animate-waiting-circle-flash {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .deploy-line-height {
    line-height: 28px;
  }

  .error-msg {
    max-width: 500px;
  }
</style>
