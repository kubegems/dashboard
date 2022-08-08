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
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4 px-2">
        <EnvironmentFilter :ml="6" />
        <v-spacer />
      </v-card-title>
      <PluginPass v-model="pass">
        <template #default>
          <v-card-text class="pa-2">
            <iframe
              v-if="$route.query.cluster"
              id="graph"
              allow
              class="iframe"
              :height="height"
              :src="src"
              width="100%"
              @load="loadDataComplete"
            />
          </v-card-text>
        </template>
      </PluginPass>
    </v-card>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'Graph',
    components: {
      EnvironmentFilter,
      PluginPass,
    },
    data() {
      return {
        timeinterval: null,
        pass: false,
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 250 * this.Scale - 1;
      },
      src() {
        return `/api/v1/service-proxy/cluster/${this.$route.query.cluster}/namespace/istio-system/service/kiali/port/20001/kiali/?kiosk=true#/graph/namespaces?graphType=workload&injectServiceNodes=true&namespaces=${this.$route.query.namespace}&edges=trafficRate%2Cthroughput%2CthroughputRequest&traffic=grpc%2CgrpcRequest%2Chttp%2ChttpRequest%2Ctcp%2CtcpSent&idleNodes=false&duration=60&refresh=30000&operationNodes=false&idleEdges=false&layout=dagre&boxNamespace=true&animation=true&badgeSecurity=true`;
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.$store.commit('SET_PROGRESS', true);
          } else {
            this.$store.commit('SET_PROGRESS', false);
          }
        },
        deep: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      loadDataComplete() {
        this.$store.commit('SET_PROGRESS', false);
        this.timeinterval = setInterval(() => {
          const iframe = document.getElementById('graph');
          if (iframe) {
            const namespace = iframe.contentWindow.document.getElementById('namespace-selector');
            if (namespace) {
              this.removeBar();
            }
            const headers = iframe.contentWindow.document.getElementsByClassName('pf-c-breadcrumb');
            if (headers) {
              this.removeTrafficBar();
            }
          }
        }, 500);
      },
      removeTrafficBar() {
        const iframe = document.getElementById('graph');
        const headers = iframe.contentWindow.document.getElementsByClassName('pf-c-breadcrumb');
        if (headers && headers.length > 0) {
          const header = headers[0];
          header.parentElement?.removeChild(header);
        }
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
      },
    },
  };
</script>

<style lang="scss" scoped>
  .iframe {
    border: none;
  }
</style>
