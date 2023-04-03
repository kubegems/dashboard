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
  <BasePanel
    v-model="panel"
    icon="mdi-debug-step-over"
    :title="$t('tip.step_and_traffic')"
    :width="`1200px`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-2">
        {{ $route.params.name }}
      </span>
    </template>
    <template #action>
      <template v-if="status && (status.strategy === 'Canary' || status.strategy === 'BlueGreen')">
        <v-btn class="white--text" small text @click="deployControll($t('operate.restart'), 'restart')">
          <v-icon left small> mdi-redo-variant </v-icon>
          {{ $t('operate.restart') }}
        </v-btn>
        <v-btn class="white--text" small text @click="deployControll($t('operate.redo'), 'retry')">
          <v-icon left small> mdi-reload </v-icon>
          {{ $t('operate.redo') }}
        </v-btn>
        <v-btn class="white--text" small text @click="deployControll($t('operate.abort'), 'pause')">
          <v-icon left small> mdi-pause </v-icon>
          {{ $t('operate.abort') }}
        </v-btn>
        <v-btn
          class="white--text"
          small
          text
          @click="deployControll($t('operate.continue'), 'promote', { full: false })"
        >
          <v-icon left small> mdi-play </v-icon>
          {{ $t('operate.continue') }}
        </v-btn>
      </template>
    </template>
    <template #content>
      <template v-if="status && status.strategy === 'Canary'">
        <v-flex class="px-4 pt-2 text-subtitle-1 kubegems__text">{{ $t('tip.step') }}</v-flex>
        <v-stepper v-if="status && status.step" alt-labels :value="getNowStep(status.step) + 1">
          <v-stepper-header>
            <template v-for="(step, index) in status ? status.steps : []">
              <v-stepper-step :key="index" :complete="index < getNowStep(status.step)" :step="index + 1">
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

      <v-flex class="px-4 py-2 text-subtitle-1 kubegems__text">{{ $t('tip.traffic_topology') }}</v-flex>
      <v-progress-linear v-if="progress" color="primary" indeterminate />
      <v-flex :style="{ position: `relative` }">
        <v-flex :class="progress ? 'kubegems__overlay' : ''" />
        <iframe
          v-if="status"
          id="graph"
          allow
          class="iframe"
          :height="650"
          :src="src"
          width="100%"
          @load="loadDataComplete"
        />
      </v-flex>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import { postStrategyDeployEnvironmentAppsControl } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployStepPanel',
    i18n: {
      messages: messages,
    },
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
        return `/api/v1/service-proxy/cluster/${this.ThisCluster}/namespace/istio-system/service/kiali/port/20001/kiali/?kiosk=true#/graph/node/namespaces/${this.$route.query.namespace}/applications/${this.$route.params.name}?edges=responseTime%2Crt95%2Cthroughput%2CthroughputRequest%2CtrafficDistribution%2CtrafficRate&layout=dagre&idleEdges=false&idleNodes=false&injectServiceNodes=true&traffic=grpc%2CgrpcRequest%2Chttp%2ChttpRequest%2Ctcp%2CtcpSent&graphType=versionedApp&duration=60&operationNodes=false&refresh=30000&namespaces=${this.$route.query.namespace}&boxNamespace=true&animation=true&badgeSecurity=true`;
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
      open() {
        this.panel = true;
      },
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
            text: command === 'undo' ? `${operate.rollback} ${args.revision}` : `${title} ${this.$route.params.name}`,
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
