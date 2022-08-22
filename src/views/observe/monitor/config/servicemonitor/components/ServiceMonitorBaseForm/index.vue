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
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.service_monitor')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="!edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>

          <v-col cols="6">
            <v-autocomplete
              v-model="serviceSelector"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_serviceItems"
              :label="$t('tip.related_service')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.selectorRule"
              @change="onServiceSelectorChange"
              @focus="onServiceSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>

      <EndpointForm ref="endpointForm" :data="obj.spec.endpoints" @addData="addData" @closeOverlay="closeExpand" />
      <BaseSubTitle :title="$t('tip.endpoint_config')" />
      <v-card-text class="pa-2">
        <EndpointItem
          :endpoints="obj.spec.endpoints"
          @expandCard="expandCard"
          @removeEndpoint="removeEndpoint"
          @updateEndpoint="updateEndpoint"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../i18n';
  import EndpointForm from './EndpointForm';
  import EndpointItem from './EndpointItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'ServiceMonitorBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      EndpointForm,
      EndpointItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => true,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      serviceSelector: '',
      obj: {
        apiVersion: 'monitoring.coreos.com/v1',
        kind: 'ServiceMonitor',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          endpoints: [],
          jobLabel: '',
          namespaceSelector: {
            matchNames: [],
          },
          selector: {
            matchLabels: {},
          },
        },
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          selectorRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['servicemonitor'] || 'monitoring.coreos.com/v1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {
          const { cluster, namespace } = this.$route.query;
          if (this.AdminViewport) {
            if (this.item && Object.keys(this.item).length > 0) {
              this.obj = this.item;
            }
          } else {
            if (this.item && Object.keys(this.item).length > 0) {
              this.obj = this.item;
            } else {
              this.obj.metadata.namespace = namespace;
              this.$set(this.obj.spec.namespaceSelector.matchNames, 0, cluster);
            }
          }
          this.retrieveServiceSelector();
          if (this.m_select_serviceItems.length === 0 && this.obj.metadata.namespace) {
            this.onServiceSelectFocus();
          }
        });
      },
      retrieveServiceSelector() {
        if (this.obj.metadata.labels['svc']) {
          this.serviceSelector = this.obj.metadata.labels['svc'];
        }
      },
      onServiceSelectFocus() {
        const { cluster, namespace } = this.$route.query;
        if (!cluster || !namespace) return;
        this.obj.metadata.namespace = namespace;
        if (!this.obj.metadata.namespace) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_namespace'),
            color: 'warning',
          });
          return;
        }
        this.m_select_serviceSelectData(cluster, this.obj.metadata.namespace);
      },
      addData(data) {
        this.obj.spec.endpoints = data;
        this.$refs.endpointForm.closeCard();
      },
      updateEndpoint(index) {
        const endpoint = this.obj.spec.endpoints[index];
        const data = {
          index: index,
          path: endpoint.path,
          interval: endpoint.interval,
          scrapeTimeout: endpoint.scrapeTimeout,
          honorLabels: endpoint.honorLabels,
        };
        if (endpoint.port) {
          data.port = endpoint.port;
          this.$refs.endpointForm.setPortSelector('port');
        } else {
          data.targetPort = endpoint.targetPort;
          this.$refs.endpointForm.setPortSelector('targetPort');
        }
        this.$refs.endpointForm.endpoint.honorLabels = endpoint.honorLabels;
        this.$nextTick(() => {
          this.$refs.endpointForm.init(data);
          this.expand = true;
        });
      },
      removeEndpoint(index) {
        this.$delete(this.obj.spec.endpoints, index);
      },
      onServiceSelectorChange() {
        this.m_select_serviceItems.forEach((s) => {
          if (s.text === this.serviceSelector) {
            if (s.labels) {
              this.obj.spec.selector.matchLabels = s.labels;
              this.obj.spec.jobLabel = s.text;
              // 关联服务
              this.obj.metadata.labels['svc'] = s.text;
              if (this.edit) {
                this.obj.metadata.name = s.text;
              }
            }
          }
        });
      },

      expandCard() {
        this.$refs.endpointForm.setPortSelector('port');
        // 重置后不能赋初值,会触发校验
        this.$nextTick(() => {
          this.$refs.endpointForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.endpointForm.closeCard();
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
