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
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateGateway"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex v-if="gateway && gateway.spec.tenant !== 'notenant'">
                  <v-btn color="error" small text @click="removeGateway"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ gateway ? gateway.metadata.name : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.cluster') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ gateway ? ThisCluster : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.tenant') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ gateway ? gateway.spec.tenant : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.create_at') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{
                  gateway && gateway.metadata.creationTimestamp
                    ? $moment(gateway.metadata.creationTimestamp).format('lll')
                    : ''
                }}
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

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="gateway"
          :selector="{
            topkind: 'TenantGateway',
            topname: gateway ? gateway.metadata.name : '',
            ingressClassName: gateway ? gateway.spec.ingressClass : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="gateway" />
    <UpdateGateway ref="updateGateway" @refresh="gatewayDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import GatewayConfigmap from './components/GatewayConfigmap';
  import GatewayMonitor from './components/GatewayMonitor';
  import IngressList from './components/IngressList';
  import ResourceInfo from './components/ResourceInfo';
  import UpdateGateway from './components/UpdateGateway';
  import messages from './i18n';
  import { deleteGateway, getGatewayDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'GatewayDetail',
    i18n: {
      messages: messages,
    },
    components: {
      EventList,
      GatewayConfigmap,
      GatewayMonitor,
      IngressList,
      Metadata,
      PodList,
      ResourceInfo,
      ResourceYaml,
      UpdateGateway,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      gateway: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$t('tab.config'), value: 'GatewayConfigmap' },
          { text: this.$root.$t('tab.pod'), value: 'PodList' },
          { text: this.$t('tab.ingress'), value: 'IngressList' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
          { text: this.$root.$t('tab.monitor'), value: 'GatewayMonitor' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.gatewayDetail();
        });
      }
    },
    methods: {
      async gatewayDetail() {
        const data = await getGatewayDetail(this.Tenant().ID, this.ThisClusterID, this.$route.params.name);
        this.gateway = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateGateway() {
        this.$refs.updateGateway.init(this.gateway.metadata.name);
        this.$refs.updateGateway.open();
      },
      removeGateway() {
        const item = this.gateway;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.gateway')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteGateway(this.Tenant().ID, this.ThisClusterID, param.item.metadata.name);
            this.$router.push({ name: 'gateway-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
