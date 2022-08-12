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
    <BaseBreadcrumb />

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
          :item="workload"
          :services="services"
        />
      </template>
    </PluginPass>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import WorkloadLog from './components/WorkloadLog';
  import messages from './i18n';
  import { getMicroAppWorkoladDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import InboundTrafficIframe from '@/views/microservice/components/InboundTrafficIframe';
  import NetworkTopologyIframe from '@/views/microservice/components/NetworkTopologyIframe';
  import OutboundTrafficIframe from '@/views/microservice/components/OutboundTrafficIframe';
  import PluginPass from '@/views/microservice/components/PluginPass';
  import ResourceInfo from '@/views/microservice/components/ResourceInfo';
  import TraceIframe from '@/views/microservice/components/TraceIframe';

  export default {
    name: 'WorkloadDetail',
    i18n: {
      messages: messages,
    },
    components: {
      InboundTrafficIframe,
      NetworkTopologyIframe,
      OutboundTrafficIframe,
      PluginPass,
      ResourceInfo,
      TraceIframe,
      WorkloadLog,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      tab: 0,
      workload: null,
      services: null,
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.overview'), value: 'ResourceInfo' },
          { text: this.$t('tab.network_topology'), value: 'NetworkTopologyIframe' },
          { text: this.$t('tab.log'), value: 'WorkloadLog' },
          { text: this.$t('tab.ingress'), value: 'InboundTrafficIframe' },
          { text: this.$t('tab.egress'), value: 'OutboundTrafficIframe' },
          { text: this.$t('tab.trace'), value: 'TraceIframe' },
        ];
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.microAppWorkoladDetail();
          }
        },
        deep: true,
      },
    },
    methods: {
      async microAppWorkoladDetail() {
        const data = await getMicroAppWorkoladDetail(
          this.VirtualSpace().ID,
          this.$route.query.environmentid,
          this.$route.params.name,
          {
            noprocessing: true,
            kind: this.$route.query.type,
          },
        );
        if (data) {
          this.workload = data.Object;
          this.services = data.services;
        }
      },
    },
  };
</script>
