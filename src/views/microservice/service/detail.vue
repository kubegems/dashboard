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
    <BaseMicroServiceHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex v-if="service && service.istioSidecar && pass" class="kubegems__full-right">
          <v-btn
            v-if="m_permisson_virtualSpaceAllow"
            class="primary--text"
            :disabled="!(mode === 'request_routing' || mode === null)"
            small
            text
            @click="initReuqestRouting"
          >
            <v-icon left small> mdi-code-json-branch </v-icon>
            {{ $t('operate.request_route') }}
          </v-btn>
          <v-btn
            v-if="m_permisson_virtualSpaceAllow"
            class="primary--text"
            :disabled="!(mode === 'fault_injection' || mode === null)"
            small
            text
            @click="initFaultInjection"
          >
            <v-icon left small> mdi-eyedropper </v-icon>
            {{ $t('operate.fault_injection') }}
          </v-btn>
          <v-btn
            v-if="m_permisson_virtualSpaceAllow"
            class="primary--text"
            :disabled="!(mode === 'traffic_shifting' || mode === null)"
            small
            text
            @click="initTrafficShifting"
          >
            <v-icon left small> mdi-recycle </v-icon>
            {{ $t('operate.traffic_shift') }}
          </v-btn>
          <v-btn
            v-if="m_permisson_virtualSpaceAllow"
            class="primary--text"
            :disabled="!(mode === 'tcp_traffic_shifting' || mode === null)"
            small
            text
            @click="initTcpTrafficShifting"
          >
            <v-icon left small> mdi-recycle </v-icon>
            {{ $t('operate.tcp_traffic_shift') }}
          </v-btn>
          <v-btn
            v-if="m_permisson_virtualSpaceAllow"
            class="primary--text"
            :disabled="!(mode === 'request_timeouts' || mode === null)"
            small
            text
            @click="initRequestTimeouts"
          >
            <v-icon left small> mdi-clock </v-icon>
            {{ $t('operate.request_timeout') }}
          </v-btn>
          <v-menu v-if="m_permisson_virtualSpaceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" small text @click="clearVS"> {{ $t('operate.clear') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <PluginPass v-model="pass">
      <template #default>
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
          class="mt-3"
          :item="service"
          :mode="mode"
          type="services"
          :vs="vs"
        />
      </template>
    </PluginPass>

    <FaultInjection ref="faultInjection" :service="service" :vs="vs" @refresh="microServiceDetail" />
    <RequestRouting ref="requestRouting" :service="service" :vs="vs" @refresh="microServiceDetail" />
    <RequestTimeouts ref="requestTimeouts" :service="service" :vs="vs" @refresh="microServiceDetail" />
    <TcpTrafficShifting ref="tcpTrafficShifting" :service="service" :vs="vs" @refresh="microServiceDetail" />
    <TrafficShifting ref="trafficShifting" :service="service" :vs="vs" @refresh="microServiceDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import FaultInjection from './components/FaultInjection';
  import RequestRouting from './components/RequestRouting';
  import RequestTimeouts from './components/RequestTimeouts';
  import TcpTrafficShifting from './components/TcpTrafficShifting';
  import TrafficShifting from './components/TrafficShifting';
  import VSControlInfo from './components/VSControlInfo';
  import messages from './i18n';
  import { getMicroServiceDetail, postResetService } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import InboundTrafficIframe from '@/views/microservice/components/InboundTrafficIframe';
  import NetworkTopologyIframe from '@/views/microservice/components/NetworkTopologyIframe';
  import PluginPass from '@/views/microservice/components/PluginPass';
  import ResourceInfo from '@/views/microservice/components/ResourceInfo';
  import TraceIframe from '@/views/microservice/components/TraceIframe';

  export default {
    name: 'ServiceDetail',
    i18n: {
      messages: messages,
    },
    components: {
      FaultInjection,
      InboundTrafficIframe,
      NetworkTopologyIframe,
      PluginPass,
      RequestRouting,
      RequestTimeouts,
      ResourceInfo,
      TcpTrafficShifting,
      TraceIframe,
      TrafficShifting,
      VSControlInfo,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      tab: 0,
      service: null,
      vs: null,
      mode: null,
      pass: false,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['VirtualSpace']),
      tabItems() {
        const items = [
          { text: this.$root.$t('tab.overview'), value: 'ResourceInfo' },
          { text: this.$t('tab.network_topology'), value: 'NetworkTopologyIframe' },
          { text: this.$t('tab.ingress'), value: 'InboundTrafficIframe' },
          { text: this.$t('tab.trace'), value: 'TraceIframe' },
        ];
        if (this.mode === 'fault_injection') {
          items.push({ text: this.$t('operate.fault_injection'), value: 'VSControlInfo' });
        } else if (this.mode === 'request_timeouts') {
          items.push({ text: this.$t('operate.request_timeout'), value: 'VSControlInfo' });
        } else if (this.mode === 'request_routing') {
          items.push({ text: this.$t('operate.request_route'), value: 'VSControlInfo' });
        } else if (this.mode === 'traffic_shifting') {
          items.push({ text: this.$t('operate.traffic_shift'), value: 'VSControlInfo' });
        } else if (this.mode === 'tcp_traffic_shifting') {
          items.push({ text: this.$t('operate.tcp_traffic_shift'), value: 'VSControlInfo' });
        }
        return items;
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.microServiceDetail();
          }
        },
        deep: true,
      },
    },
    methods: {
      async microServiceDetail() {
        const data = await getMicroServiceDetail(
          this.VirtualSpace().ID,
          this.$route.query.environmentid,
          this.$route.params.name,
          {
            noprocessing: true,
          },
        );
        this.service = data;
        this.parseVS();
      },
      parseVS() {
        if (this.service && this.service.virtualServices && this.service.virtualServices.length > 0) {
          const vs = this.service.virtualServices[0];
          if (!vs.metadata || !vs.metadata.labels) return;
          this.mode = vs.metadata.labels.kiali_wizard;
          if (this.mode === 'fault_injection') {
            this.vs = { fault: vs.spec.http[0].fault };
          } else if (this.mode === 'request_timeouts') {
            this.vs = {
              timeout: vs.spec.http[0].timeout,
              retries: vs.spec.http[0].retries,
            };
          } else if (this.mode === 'request_routing') {
            const headers =
              vs.spec.http[0].match &&
              vs.spec.http[0].match.find((m) => {
                return m.headers;
              });
            const uri =
              vs.spec.http[0].match &&
              vs.spec.http[0].match.find((m) => {
                return m.uri;
              });
            this.vs = {
              route: vs.spec.http[0].route,
              match: [
                {
                  headers: headers ? headers.headers : {},
                  uri: uri ? uri.uri : {},
                },
              ],
            };
          } else if (this.mode === 'traffic_shifting') {
            this.vs = { route: vs.spec.http[0].route };
          } else if (this.mode === 'tcp_traffic_shifting') {
            this.vs = { route: vs.spec.tcp[0].route };
          }
        } else {
          this.vs = null;
          this.mode = null;
        }
      },
      initReuqestRouting() {
        this.$refs.requestRouting.init();
        this.$refs.requestRouting.open();
      },
      initFaultInjection() {
        this.$refs.faultInjection.init();
        this.$refs.faultInjection.open();
      },
      initTrafficShifting() {
        this.$refs.trafficShifting.init();
        this.$refs.trafficShifting.open();
      },
      initTcpTrafficShifting() {
        this.$refs.tcpTrafficShifting.init();
        this.$refs.tcpTrafficShifting.open();
      },
      initRequestTimeouts() {
        this.$refs.requestTimeouts.init();
        this.$refs.requestTimeouts.open();
      },
      clearVS() {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.clear'),
          content: {
            text: this.$t('operate.clear'),
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postResetService(this.VirtualSpace().ID, this.$route.query.environmentid, this.$route.params.name);
            this.microServiceDetail(true);
          },
        });
      },
    },
  };
</script>
