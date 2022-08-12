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
          :default="{ items: [], text: $t('filter.service_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_virtualSpaceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addIstioVirtualService">
                  <v-icon left>mdi-cloud-outline</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.virtual_service')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="addIstioDestinationRule">
                  <v-icon left>mdi-ruler</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.destination_rule')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="addIstioGateway">
                  <v-icon left>mdi-gate</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.gateway')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <PluginPass v-model="pass">
        <template #default>
          <v-data-table
            class="mx-4"
            disable-sort
            :headers="headers"
            hide-default-footer
            :items="items"
            :no-data-text="$root.$t('data.no_data')"
            :no-results-text="$root.$t('data.no_data')"
          >
            <template #[`item.name`]="{ item }">
              <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="kialiServiceDetail(item)">
                <v-flex class="float-left">
                  {{ item.name }}
                </v-flex>
                <v-flex v-if="item.istioSidecar && item.appLabel" class="float-left ml-2">
                  <v-menu nudge-right="20px" nudge-top="10px" open-on-hover right>
                    <template #activator="{ on }">
                      <span v-on="on">
                        <img class="service__inject" :src="`/icon/istio.svg`" width="18px" />
                      </span>
                    </template>
                    <v-card>
                      <v-card-text class="pa-2 text-caption"> {{ $t('tip.auto_inject') }} </v-card-text>
                    </v-card>
                  </v-menu>
                </v-flex>
              </a>
            </template>
            <template #[`item.namespace`]>
              {{ EnvironmentFilter ? EnvironmentFilter.text : '' }}
            </template>
            <template #[`item.labels`]="{ item, index }">
              <BaseCollapseChips :id="`v_label_${index}`" :chips="item.labels || {}" icon="mdi-label" single-line />
            </template>
            <template #[`item.config`]="{ item, index }">
              <v-flex :id="`r${index}`" />
              <v-flex
                v-for="(ref, i) in item.istioReferences.length > 1
                  ? item.showConfig
                    ? item.istioReferences
                    : item.istioReferences.slice(0, 1)
                  : item.istioReferences"
                :key="i"
              >
                <v-chip class="ma-1" color="success" small text-color="white">
                  <strong class="mx-1"> {{ ref.objectType }} </strong>
                  {{ ref.name }}
                  <strong v-if="item.istioReferences.length > 1 && !item.showConfig" class="ml-2">
                    {{ `+${item.istioReferences.length - 1}` }}
                  </strong>
                </v-chip>
                <template v-if="item.istioReferences.length > 1 && i === 0">
                  <v-btn
                    v-if="item.showConfig"
                    class="service__cell"
                    color="primary"
                    icon
                    small
                    text
                    @click="showAllConfig(index)"
                  >
                    <v-icon>mdi-chevron-double-up</v-icon>
                  </v-btn>
                  <v-btn v-else class="service__cell" color="primary" icon small text @click="showAllConfig(index)">
                    <v-icon>mdi-chevron-double-down</v-icon>
                  </v-btn>
                </template>
                <v-menu :attach="`#r${index}`" left top>
                  <template #activator="{ on }">
                    <v-btn icon>
                      <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text class="pa-2">
                      <v-flex>
                        <v-btn color="primary" small text @click="updateIstioRecource(ref)">
                          {{ $root.$t('operate.edit') }}
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn color="error" small text @click="removeIstioResource(ref)">
                          {{ $root.$t('operate.delete') }}
                        </v-btn>
                      </v-flex>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-flex>
            </template>
            <template #[`item.valid`]="{ item, index }">
              <v-flex :id="`v${item.name}`" />
              <v-icon v-if="valids[item.name] && valids[item.name].valid" color="success" small>
                mdi-check-circle
              </v-icon>
              <v-menu
                v-else
                :attach="`#v${item.name}`"
                :close-delay="200"
                max-width="200px"
                nudge-bottom="-5px"
                offset-y
                open-on-hover
                :origin="params.size - index <= 5 || (items.length <= 5 && index >= 1) ? `bottom center` : `top center`"
                right
                :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
                transition="scale-transition"
              >
                <template #activator="{ on }">
                  <v-icon color="warning" small v-on="on"> mdi-alert-circle </v-icon>
                </template>
                <v-card>
                  <v-list class="pa-0" dense>
                    <v-flex class="text-body-2 text-center primary white--text py-2">
                      <v-icon color="white" left small> mdi-alert </v-icon>
                      <span>{{ $t('tip.alert') }}</span>
                    </v-flex>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item class="float-left pa-0" two-line>
                          <v-list-item-content class="py-0">
                            <v-list-item-title> {{ $t('tip.alert') }} </v-list-item-title>
                            <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                              {{
                                valids[item.name] &&
                                valids[item.name].checks
                                  .map((c) => {
                                    return c.message;
                                  })
                                  .join(',')
                              }}
                            </v-list-item-content>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>
          </v-data-table>
          <BasePagination
            v-if="pageCount >= 1"
            v-model="params.page"
            :page-count="pageCount"
            :size="params.size"
            @changepage="onPageIndexChange"
            @changesize="onPageSizeChange"
            @loaddata="serviceList"
          />
        </template>
      </PluginPass>
    </v-card>

    <AddVirtualService ref="addVirtualService" @refresh="serviceList" />
    <AddIstioDestinationRule ref="addIstioDestinationRule" @refresh="serviceList" />
    <AddIstioGateway ref="addIstioGateway" @refresh="serviceList" />

    <UpdateVirtualService ref="updateVirtualService" @refresh="serviceList" />
    <UpdateIstioDestinationRule ref="updateIstioDestinationRule" @refresh="serviceList" />
    <UpdateIstioGateway ref="updateIstioGateway" @refresh="serviceList" />
    <UpdateResource ref="updateResource" @refresh="serviceList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddIstioDestinationRule from './components/destination_rule/AddIstioDestinationRule';
  import UpdateIstioDestinationRule from './components/destination_rule/UpdateIstioDestinationRule';
  import AddIstioGateway from './components/gateway/AddIstioGateway';
  import UpdateIstioGateway from './components/gateway/UpdateIstioGateway';
  import UpdateResource from './components/UpdateResource';
  import AddVirtualService from './components/virtual_service/AddVirtualService';
  import UpdateVirtualService from './components/virtual_service/UpdateVirtualService';
  import messages from './i18n';
  import {
    deleteIstioDestinationRule,
    deleteIstioGateway,
    deleteIstioVirtualService,
    getMicroServiceList,
  } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'Service',
    i18n: {
      messages: messages,
    },
    components: {
      AddIstioDestinationRule,
      AddIstioGateway,
      AddVirtualService,
      EnvironmentFilter,
      PluginPass,
      UpdateIstioDestinationRule,
      UpdateIstioGateway,
      UpdateResource,
      UpdateVirtualService,
    },
    mixins: [BaseFilter, BasePermission],
    data: () => ({
      items: [],
      valids: {},
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start', filterable: true },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.label'), value: 'labels', align: 'start', width: 500 },
          { text: this.$t('table.config_check'), value: 'valid', align: 'start' },
          { text: this.$t('table.istio_config'), value: 'config', align: 'start', width: 350 },
        ];
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.service_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.serviceList();
          }
        },
        deep: true,
      },
    },
    methods: {
      serviceList(noprocess = false) {
        this.microServiceList(noprocess);
      },
      async microServiceList(noprocess) {
        const data = await getMicroServiceList(
          this.VirtualSpace().ID,
          this.EnvironmentFilter?.value || this.$route.query?.environmentid,
          {
            ...this.params,
            search: this.$route.query.search ? this.$route.query.search : null,
            noprocessing: noprocess,
          },
        );
        data.pagedata.List = data.pagedata.List.map((s) => {
          return {
            ...s,
            showConfig: false,
          };
        });
        this.items = data.pagedata.List;
        this.valids = data.validations ? data.validations.service : {};
        this.pageCount = Math.ceil(data.pagedata.Total / this.params.size);
        this.params.page = data.pagedata.CurrentPage;
      },
      showAllConfig(index) {
        const item = this.items[index];
        item.showConfig = !item.showConfig;
        this.$set(this.items, index, item);
      },
      kialiServiceDetail(item) {
        this.$router.push({
          name: 'microservice-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            type: 'Service',
            namespace: this.EnvironmentFilter.namespace,
            cluster: this.EnvironmentFilter.cluster,
            environment: this.EnvironmentFilter.text,
            environmentid: this.EnvironmentFilter.value,
          },
        });
      },
      addIstioVirtualService() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_environment'),
            color: 'warning',
          });
          return;
        }
        this.$refs.addVirtualService.open();
      },
      addIstioDestinationRule() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_environment'),
            color: 'warning',
          });
          return;
        }
        this.$refs.addIstioDestinationRule.open();
      },
      addIstioGateway() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_environment'),
            color: 'warning',
          });
          return;
        }
        this.$refs.addIstioGateway.open();
      },
      updateIstioRecource(item) {
        if (item.objectType === 'Gateway') {
          this.$refs.updateIstioGateway.init(item);
          this.$refs.updateIstioGateway.open();
        } else if (item.objectType === 'VirtualService') {
          this.$refs.updateVirtualService.init(item);
          this.$refs.updateVirtualService.open();
        } else if (item.objectType === 'DestinationRule') {
          this.$refs.updateIstioDestinationRule.init(item);
          this.$refs.updateIstioDestinationRule.open();
        } else {
          this.$refs.updateResource.init(item);
          this.$refs.updateResource.open();
        }
      },
      removeIstioResource(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [item.objectType]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [item.objectType])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.name.length > 0) {
              if (param.item.objectType === 'Gateway') {
                await deleteIstioGateway(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              } else if (param.item.objectType === 'VirtualService') {
                await deleteIstioVirtualService(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              } else if (param.item.objectType === 'DestinationRule') {
                await deleteIstioDestinationRule(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              }
              this.serviceList(true);
            }
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .service {
    &__inject {
      margin-top: 2px;
    }

    &__cell {
      display: inline-flex;
    }
  }
</style>
