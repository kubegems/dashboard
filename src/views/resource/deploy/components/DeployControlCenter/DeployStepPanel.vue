<template>
  <BasePanel v-model="panel" title="步骤&流量" :width="`1200px`" icon="fas fa-globe" @dispose="dispose">
    <template #header>
      <span class="ml-2">
        {{ $route.params.name }}
      </span>
    </template>
    <template #action>
      <template v-if="status && (status.strategy === 'Canary' || status.strategy === 'BlueGreen')">
        <v-btn text small class="white--text" @click="deployControll('重启应用', 'restart')">
          <v-icon left small> fas fa-redo </v-icon>
          重启应用
        </v-btn>
        <v-btn text small class="white--text" @click="deployControll('重试发布', 'retry')">
          <v-icon left small> fas fa-location-arrow </v-icon>
          重试
        </v-btn>
        <v-btn text small class="white--text" @click="deployControll('中止发布', 'pause')">
          <v-icon left small> fas fa-pause </v-icon>
          中止
        </v-btn>
        <v-btn text small class="white--text" @click="deployControll('继续发布', 'promote', { full: false })">
          <v-icon left small> fas fa-play </v-icon>
          继续
        </v-btn>
      </template>
    </template>
    <template #content>
      <template v-if="status && status.strategy === 'Canary'">
        <v-flex class="px-4 pt-2 text-subtitle-1 kubegems__text">步骤</v-flex>
        <v-stepper v-if="status && status.step" :value="getNowStep(status.step) + 1" alt-labels>
          <v-stepper-header>
            <template v-for="(step, index) in status ? status.steps : []">
              <v-stepper-step :key="index" :step="index + 1" :complete="index < getNowStep(status.step)">
                <span v-for="key in Object.keys(step)" :key="key">
                  {{ key }}
                  <span v-if="key === 'setWeight'"> : {{ step['setWeight'] }} </span>
                  <span v-else-if="key === 'pause'">
                    {{ JSON.stringify(step['pause']) === '{}' ? '' : `: ${step['pause']['duration']}` }}
                  </span>
                  <span v-else-if="key === 'setCanaryScale'">
                    <span>
                      {{
                        step['setCanaryScale']['weight']
                          ? `weight : ${step['setCanaryScale']['weight']}`
                          : step['setCanaryScale']['replicas']
                          ? `replicas : ${step['setCanaryScale']['replicas']}`
                          : `matchTrafficWeight : ${step['setCanaryScale']['matchTrafficWeight']}`
                      }}
                    </span>
                  </span>
                </span>
              </v-stepper-step>
              <v-divider v-if="index < status.steps.length - 1" :key="`${index}d`" />
            </template>
          </v-stepper-header>
        </v-stepper>
      </template>

      <v-flex class="px-4 py-2 text-subtitle-1 kubegems__text">流量拓扑</v-flex>
      <v-progress-linear v-if="progress" indeterminate color="primary" />
      <v-flex style="position: relative">
        <v-flex :class="progress ? 'kubegems__overlay' : ''" />
        <iframe
          v-if="status"
          id="graph"
          :src="src"
          allow
          width="100%"
          :height="650"
          class="iframe"
          @load="loadDataComplete"
        />
      </v-flex>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { postStrategyDeployEnvironmentAppsControl } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployStepPanel',
    mixins: [BaseResource],

    data() {
      return {
        panel: false,
        timeinterval: null,
        status: null,
        progress: false,
      };
    },
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Project', 'Tenant', 'Environment']),
      src() {
        return `/api/v1/service-proxy/cluster/${this.ThisCluster}/namespace/istio-system/service/kiali/port/20001/kiali/console/graph/node/namespaces/${this.$route.query.namespace}/applications/${this.$route.params.name}?edges=responseTime%2Crt95%2Cthroughput%2CthroughputRequest%2CtrafficDistribution%2CtrafficRate&layout=dagre&idleEdges=false&idleNodes=false&injectServiceNodes=true&traffic=grpc%2CgrpcRequest%2Chttp%2ChttpRequest%2Ctcp%2CtcpSent&graphType=versionedApp&duration=60&operationNodes=false&refresh=30000&namespaces=${this.$route.query.namespace}&boxNamespace=true&animation=true&badgeSecurity=true&kiosk=true`;
      },
    },
    watch: {
      status() {
        if (this.status) {
          this.progress = true;
        }
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.panel = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(status) {
        this.status = status;
      },
      getNowStep(step) {
        const s = step.substr(0, step.indexOf('/'));
        return parseInt(s);
      },
      deployControll(title, command, args = {}) {
        this.$store.commit('SET_CONFIRM', {
          title: title,
          content: {
            text: command === 'undo' ? `回滚版本 ${args.revision}` : `${title} ${this.$route.params.name}`,
            type: 'confirm',
            name: this.$route.params.name,
          },
          param: { command, args },
          doFunc: async (param) => {
            await postStrategyDeployEnvironmentAppsControl(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
              {
                command: param.command,
                args: param.args,
              },
            );
            this.$emit('refresh');
          },
        });
      },
      loadDataComplete() {
        this.progress = false;
        this.timeinterval = setInterval(() => {
          const iframe = document.getElementById('graph');
          if (iframe) {
            const namespace = iframe.contentWindow.document.getElementById('namespace-selector');
            if (namespace) {
              this.removeBar();
              clearInterval(this.timeinterval);
            }
          }
        }, 500);
      },
      removeBar() {
        const iframe = document.getElementById('graph');
        const namespace = iframe.contentWindow.document.getElementById('namespace-selector').parentNode;
        if (namespace) {
          namespace.parentElement?.removeChild(namespace);
        }
        const splits = iframe.contentWindow.document.getElementsByClassName('fr78t9r');
        if (splits && splits.length > 0) {
          const split = splits[0];
          split.parentElement?.removeChild(split);
        }
        const fpomfbys = iframe.contentWindow.document.getElementsByClassName('fpomfby');
        if (fpomfbys && fpomfbys.length > 0) {
          const fpomfby = fpomfbys[0];
          fpomfby.style.marginLeft = '0px';
          const fpomfby2 = fpomfbys[1];
          fpomfby2.parentElement?.removeChild(fpomfby2);
        }
        const toolbars = iframe.contentWindow.document.getElementsByClassName('f1ct87rs');
        if (toolbars && toolbars.length > 0) {
          const toolbar = toolbars[0];
          toolbar.parentElement?.removeChild(toolbar);
        }
        const secondBars = iframe.contentWindow.document.getElementsByClassName('f1ocs92y');
        if (secondBars && secondBars.length > 0) {
          const secondBar = secondBars[0];
          const dispaly = secondBar.children[0];
          const findHide = secondBar.children[1];
          dispaly.style.position = 'initial';
          dispaly.style.float = 'left';

          const firstBars = iframe.contentWindow.document.getElementsByClassName('fcq4l43');
          if (firstBars && firstBars.length > 0) {
            const firstBar = firstBars[0];
            firstBar.append(dispaly);
            firstBar.append(findHide);
          }
          const header = iframe.contentWindow.document.getElementById('global-namespace-selector');
          header.style.marginBottom = '15px';
          secondBar.parentElement?.removeChild(secondBar);
        }
        const backBtns = iframe.contentWindow.document.getElementsByClassName('pf-m-link');
        if (backBtns && backBtns.length > 1) {
          const backBtn = backBtns[1];
          backBtn.parentElement?.removeChild(backBtn);
        }
      },
      dispose() {
        this.status = null;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .iframe {
    border: none;
  }
</style>
