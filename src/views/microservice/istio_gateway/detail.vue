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
        <v-flex class="kubegems__full-right">
          <v-menu v-if="m_permisson_virtualSpaceAllow && pass" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateIstioGatewayInstance">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeIstioGatewayInstance">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <PluginPass v-model="pass">
      <template #default>
        <v-row class="mt-0">
          <v-col class="pt-0" cols="2">
            <v-card>
              <v-card-title class="text-h6 primary--text">
                {{ gateway ? gateway.Name : '' }}
              </v-card-title>
              <v-list-item two-line>
                <v-list-item-content class="kubegems__text">
                  <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.cluster') }} </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ $route.query.cluster }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content class="kubegems__text">
                  <v-list-item-title class="text-subtitle-2">
                    {{ $root.$t('resource.environment') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ $route.query.environment }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content class="kubegems__text">
                  <v-list-item-title class="text-subtitle-2"> {{ $t('table.status') }} </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    <v-icon
                      v-if="gateway && gateway.status && gateway.status.replicas === gateway.status.availableReplicas"
                      color="success"
                      small
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-icon
                      v-else-if="gateway && gateway.status && gateway.status.availableReplicas === 0"
                      color="error"
                      small
                    >
                      mdi-close-circle
                    </v-icon>
                    <v-icon v-else color="warning" small> mdi-alert-circle </v-icon>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-card>
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
            <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :gateway="gateway" />
          </v-col>
        </v-row>
      </template>
    </PluginPass>

    <UpdateIstioGateway ref="updateIstioGateway" @refresh="istioGatewayInstanceDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import GatewayList from './components/GatewayList';
  import GatewayMonitor from './components/GatewayMonitor';
  import GatewayPodList from './components/GatewayPodList';
  import UpdateIstioGateway from './components/UpdateIstioGateway';
  import VirtualServiceList from './components/VirtualServiceList';
  import messages from './i18n';
  import { deleteIstioGatewayInstance, getIstioGatewayInstanceDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'IstioGatewayDetail',
    i18n: {
      messages: messages,
    },
    components: {
      GatewayList,
      GatewayMonitor,
      GatewayPodList,
      PluginPass,
      UpdateIstioGateway,
      VirtualServiceList,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      gateway: null,
      tab: 0,
      pass: false,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['VirtualSpace']),
      tabItems() {
        return [
          { text: this.$t('tab.gateway_resource'), value: 'GatewayList' },
          { text: this.$t('tab.virtualservice'), value: 'VirtualServiceList' },
          { text: this.$t('tab.pods'), value: 'GatewayPodList' },
          { text: this.$t('tab.monitor'), value: 'GatewayMonitor' },
        ];
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.istioGatewayInstanceDetail();
          }
        },
        deep: true,
      },
    },
    methods: {
      async istioGatewayInstanceDetail() {
        const data = await getIstioGatewayInstanceDetail(
          this.VirtualSpace().ID,
          this.$route.query.clusterid,
          this.$route.params.name,
        );
        this.gateway = data;
      },
      updateIstioGatewayInstance() {
        this.$refs.updateIstioGateway.init(this.gateway);
        this.$refs.updateIstioGateway.open();
      },
      removeIstioGatewayInstance() {
        const item = this.gateway;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway_instance')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway_instance')])} ${item.Name}`,
            type: 'delete',
            name: item.Name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.Name.length > 0) {
              await deleteIstioGatewayInstance(this.VirtualSpace().ID, this.$route.query.clusterid, param.item.Name);
              this.$router.push({
                name: 'istiogateway-list',
                params: this.$route.params,
              });
            }
          },
        });
      },
    },
  };
</script>
