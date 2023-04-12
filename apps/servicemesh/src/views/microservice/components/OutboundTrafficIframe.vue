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
  <v-card flat>
    <v-card-text class="pa-2 px-3">
      <iframe id="outbound" allow class="iframe" :height="height" :src="src" width="100%" @load="loadDataComplete" />
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'OutboundTrafficIframe',
    props: {
      type: {
        type: String,
        default: () => 'workloads',
      },
    },
    data() {
      return {
        timeinterval: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 284) / this.Scale);
      },
      src() {
        return `/api/v1/service-proxy/cluster/${this.$route.query.cluster}/namespace/istio-system/service/kiali/port/20001/kiali/?kiosk=true#/namespaces/${this.$route.query.namespace}/${this.type}/${this.$route.params.name}?tab=out_metrics&rangeDuration=1800&refresh=60000`;
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$store.commit('SET_PROGRESS', true);
    },
    methods: {
      loadDataComplete() {
        this.$store.commit('SET_PROGRESS', false);
        this.timeinterval = setInterval(() => {
          const iframe = document.getElementById('outbound');
          if (iframe) {
            const tab = iframe.contentWindow.document.getElementById('basic-tabs');
            if (tab) {
              this.removeBar();
            }
          }
        }, 500);
      },
      removeBar() {
        const iframe = document.getElementById('outbound');
        const headers = iframe.contentWindow.document.getElementsByClassName('pf-c-breadcrumb');
        if (headers && headers.length > 0) {
          const header = headers[0];
          header.parentElement?.removeChild(header);
        }
        const tab = iframe.contentWindow.document.getElementById('basic-tabs');
        if (tab) {
          tab.parentElement?.removeChild(tab);
        }
        const session = iframe.contentWindow.document.querySelector('#pf-tab-section-4-basic-tabs div');
        if (session) {
          session.style.padding = '0';
          session.style.height = `${this.height + 300}px`;
        }
        const bodys = iframe.contentWindow.document.getElementsByClassName('pf-c-card__body');
        if (bodys && bodys.length > 0) {
          const body = bodys[0];
          body.style.padding = '4px';
        }

        const toolBar = iframe.contentWindow.document.querySelector('.pf-c-card__body .pf-l-toolbar');
        if (toolBar) {
          toolBar.style.float = 'left';
          toolBar.style.paddingTop = '10px';
          toolBar.style.paddingBottom = '0';

          const timeBars = iframe.contentWindow.document.getElementsByClassName('flbydrv');
          if (timeBars && timeBars.length > 0) {
            const timeBar = timeBars[0];
            timeBar.style.float = 'right';

            const headerBars = iframe.contentWindow.document.getElementsByClassName('fvsfosc');
            if (headerBars && headerBars.length > 0) {
              const headerBar = headerBars[0];
              headerBar.insertBefore(toolBar, timeBar);
              const div = document.createElement('div');
              div.style.clear = 'both';
              headerBar.append(div);
            }
          }
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
