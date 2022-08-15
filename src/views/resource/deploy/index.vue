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
          <span class="text-subtitle-2 mx-2 deploy-line-height">
            <template v-if="taskStatus === 'Running' || taskStatus === 'Pending'">
              <v-icon class="icon-font waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
              <span class="warning--text">
                {{ deploy ? $t('status.deploying') : $t('status.policy_changing') }}
              </span>
            </template>
            <template v-else-if="taskStatus === 'Success' && deploy">
              <v-icon class="icon-font" color="success"> mdi-check-circle </v-icon>
              <span class="success--text"> {{ $t('status.deployed') }} </span>
            </template>
            <template v-else-if="taskStatus === 'Error'">
              <v-menu :close-delay="200" nudge-bottom="10px" open-on-hover top>
                <template #activator="{ on }">
                  <span class="error--text kubegems__pointer" v-on="on">
                    <v-icon class="icon-font" color="error"> mdi-close-circle </v-icon>
                    {{ deploy ? $t('status.deploy_failed') : $t('status.policy_change_failed') }}
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> {{ taskErrorMsg }} </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </span>
          <v-btn class="primary--text" small text @click="returnAppDetail">
            <v-icon left small> mdi-share </v-icon>
            {{ $root.$t('operate.return') }}
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-n3 deploy-pos">
      <v-col cols="3">
        <v-card flat height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> {{ $t('tip.rolling_update') }} </span>
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="
                (runtime &&
                  runtime.strategy.type !== undefined &&
                  (runtime.strategy.type === 'BlueGreen' || runtime.strategy.type === 'Canary')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              small
              @click="deployRollingUpdate"
            >
              {{ $root.$t('operate.deploy') }}
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/deploy/rollingupdate.png" width="100%" />
            </v-flex>
            RollingUpdate
            {{ $t('tip.rolling_update_tip') }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card flat height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> {{ $t('tip.recreate') }} </span>
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="
                (runtime &&
                  runtime.strategy.type !== undefined &&
                  (runtime.strategy.type === 'BlueGreen' || runtime.strategy.type === 'Canary')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              small
              @click="deployRecreate"
            >
              {{ $root.$t('operate.deploy') }}
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/deploy/recreate.png" width="100%" />
            </v-flex>
            {{ $t('tip.recreate_tip') }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card flat height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> {{ $t('tip.blue_green') }} </span>
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="
                (runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              small
              @click="deployBlueGreen"
            >
              {{ $root.$t('operate.deploy') }}
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/deploy/bluegreen.png" width="100%" />
            </v-flex>
            {{ $t('tip.blue_green_tip') }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card flat height="100%">
          <v-card-title>
            <span class="text-subtitle-1 kubegems__text"> {{ $t('tip.canary') }} </span>
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="
                (runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')) ||
                taskStatus === 'Running' ||
                taskStatus === 'Pending'
              "
              small
              @click="deployCanary"
            >
              {{ $root.$t('operate.deploy') }}
            </v-btn>
          </v-card-title>
          <v-divider class="mx-2" />
          <v-card-text>
            <v-flex class="mb-2">
              <img src="/img/deploy/canary.png" width="100%" />
            </v-flex>
            Canary
            {{ $t('tip.canary_tip') }}
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
            color="primary"
            :disabled="taskStatus === 'Running' || taskStatus === 'Pending'"
            @click="
              switchDeployMode(
                runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')
                  ? { text: $t('tip.blue_green'), value: 'BlueGreen' }
                  : { text: $t('tip.rolling_update'), value: 'RollingUpdate' },
              )
            "
          >
            {{ $t('operate.switch_deploy') }}
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
            color="primary"
            :disabled="taskStatus === 'Running' || taskStatus === 'Pending'"
            @click="
              switchDeployMode(
                runtime &&
                  (runtime.strategy.type === undefined ||
                    runtime.strategy.type === 'Recreate' ||
                    runtime.strategy.type === 'RollingUpdate')
                  ? { text: $t('tip.canary'), value: 'Canary' }
                  : { text: $t('tip.recreate'), value: 'Recreate' },
              )
            "
          >
            {{ $t('operate.switch_deploy') }}
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

  import BlueGreen from './components/deploy_policy/BlueGreen';
  import Canary from './components/deploy_policy/Canary';
  import Recreate from './components/deploy_policy/Recreate';
  import RollingUpdate from './components/deploy_policy/RollingUpdate';
  import messages from './i18n';
  import { getStrategyDeployEnvironmentAppsDetail, postSwitchDeployAppStrategy } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppDeployCenter',
    i18n: {
      messages: messages,
    },
    components: {
      BlueGreen,
      Canary,
      Recreate,
      RollingUpdate,
    },
    mixins: [BasePermission, BaseResource],
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
          title: this.$t('operate.switch_deploy'),
          content: {
            text: this.$t('tip.switch_deploy', [mode.text]),
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
