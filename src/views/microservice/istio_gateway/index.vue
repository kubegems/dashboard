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
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.gateway_name'), value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
        <v-spacer />
      </v-card-title>
    </v-card>

    <PluginPass v-model="pass">
      <template #default>
        <v-row class="mt-3">
          <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
            <v-hover #default="{ hover }">
              <v-card class="mx-auto" :elevation="hover ? 5 : 0" flat height="100%">
                <v-list-item three-line>
                  <v-list-item-avatar class="primary--text" size="80" tile>
                    <img class="service__inject" :src="`/icon/istio.svg`" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="text-h6 mb-1">
                      <a>
                        {{ item ? item.Name : '' }}
                      </a>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-body-2">
                        {{ $t('table.status') }} :
                        <v-icon
                          v-if="item && item.status && item.status.replicas === item.status.availableReplicas"
                          color="success"
                          small
                        >
                          mdi-check-circle
                        </v-icon>
                        <v-icon v-else-if="item.status && item.status.availableReplicas === 0" color="error" small>
                          mdi-close-circle
                        </v-icon>
                        <v-icon v-else color="warning" small> mdi-alert-circle </v-icon>
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      <span class="text-body-2"> 端口： </span>
                      <span v-for="(port, index) in item ? item && item.ports : []" :key="index">
                        <span v-if="port.name === 'http2'">
                          http:
                          {{ port.nodePort === '' ? '-' : port.nodePort }}
                        </span>
                        <span v-if="port.name === 'https'">
                          https:
                          {{ port.nodePort === '' ? '-' : port.nodePort }}
                        </span>
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="primary" small text @click="istioGatewayDetail(item)">
                    {{ $t('operate.detail') }}
                  </v-btn>
                  <v-btn
                    v-if="m_permisson_virtualSpaceAllow"
                    color="primary"
                    small
                    text
                    @click="updateIstioInstanceGateway(item)"
                  >
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                  <v-btn
                    v-if="m_permisson_virtualSpaceAllow"
                    color="error"
                    small
                    text
                    @click="removeIstioGatewayInstance(item)"
                  >
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
          <v-col v-if="m_permisson_virtualSpaceAllow" class="pt-0" cols="3">
            <v-card class="kubegems__full-height" flat min-height="156">
              <v-card-text class="pa-0 kubegems__full-height">
                <v-list-item class="kubegems__full-height" three-line>
                  <v-list-item-content>
                    <v-btn block class="text-h6" color="primary" text @click="addIstioGatewayInstance">
                      <v-icon left>mdi-plus-box</v-icon>
                      {{ $root.$t('operate.create_c', [$root.$t('resource.gateway_instance')]) }}
                    </v-btn>
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </PluginPass>

    <AddIstioGateway ref="addIstioGateway" @refresh="istioGatewayInstanceList" />
    <UpdateIstioGateway ref="updateIstioGateway" @refresh="istioGatewayInstanceList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddIstioGateway from './components/AddIstioGateway';
  import UpdateIstioGateway from './components/UpdateIstioGateway';
  import messages from './i18n';
  import { deleteIstioGatewayInstance, getIstioGatewayInstanceList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import { deepCopy } from '@/utils/helpers';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'IstioGateway',
    i18n: {
      messages: messages,
    },
    components: {
      AddIstioGateway,
      EnvironmentFilter,
      PluginPass,
      UpdateIstioGateway,
    },
    mixins: [BaseFilter, BasePermission],
    data: () => ({
      items: [],
      params: {},
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      filters() {
        return [{ text: this.$t('filter.gateway_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.istioGatewayInstanceList();
          }
        },
        deep: true,
      },
    },
    methods: {
      customFilter() {
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          this.items = this.itemsCopy.filter((item) => {
            return (
              item.Name && item.Name.toLocaleLowerCase().indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
            );
          });
          if (this.m_permisson_virtualSpaceAllow) {
            this.items.push({ add: true });
          }
        } else {
          this.items = this.itemsCopy;
        }
      },
      async istioGatewayInstanceList() {
        const data = await getIstioGatewayInstanceList(
          this.VirtualSpace().ID,
          this.EnvironmentFilter?.clusterid || this.$route.query?.clusterid,
          this.params,
        );
        this.items = data;
        this.itemsCopy = deepCopy(this.items);
        this.customFilter();
      },
      addIstioGatewayInstance() {
        this.$refs.addIstioGateway.open();
      },
      updateIstioInstanceGateway(item) {
        this.$refs.updateIstioGateway.init(item);
        this.$refs.updateIstioGateway.open();
      },
      istioGatewayDetail(item) {
        this.$router.push({
          name: 'istiogateway-detail',
          params: Object.assign(this.$route.params, { name: item.Name }),
          query: {
            namespace: this.EnvironmentFilter.namespace,
            cluster: this.EnvironmentFilter.cluster,
            clusterid: this.EnvironmentFilter?.clusterid || this.$route.query?.clusterid,
            environment: this.EnvironmentFilter.text,
            environmentid: this.EnvironmentFilter.value,
          },
        });
      },
      async removeIstioGatewayInstance(item) {
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
              await deleteIstioGatewayInstance(
                this.VirtualSpace().ID,
                this.EnvironmentFilter?.clusterid || this.$route.query?.clusterid,
                param.item.Name,
              );
              this.istioGatewayInstanceList();
            }
          },
        });
      },
    },
  };
</script>
