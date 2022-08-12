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
                <v-btn color="primary" text @click="addGateway">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.gateway')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveResource($root.$t('resource.gateway'), 'Gateway', istioGatewayList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.gateway')]) }}
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
            :headers="headers"
            hide-default-footer
            :items="items"
            :items-per-page="params.size"
            :no-data-text="$root.$t('data.no_data')"
            :page.sync="params.page"
            show-select
            @toggle-select-all="m_table_onResourceToggleSelect"
            @update:sort-by="m_table_sortBy"
            @update:sort-desc="m_table_sortDesc"
          >
            <template #[`item.data-table-select`]="{ item, index }">
              <v-checkbox
                v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
                color="primary"
                hide-details
                @change="m_table_onResourceChange($event, item, index)"
                @click.stop
              />
            </template>
            <template #[`item.name`]="{ item }">
              <a class="text-subtitle-2 kubegems__inline_flex">
                {{ item.metadata.name }}
              </a>
            </template>
            <template #[`item.namespace`]="{ item }">
              {{ item.metadata.namespace }}
            </template>
            <template #[`item.selector`]="{ item, index }">
              <BaseCollapseChips
                v-if="item"
                :id="`s_selector_${index}`"
                :chips="item.spec.selector || {}"
                icon="mdi-label"
                single-line
              />
            </template>
            <template #[`item.service`]="{ item, index }">
              <BaseCollapseChips
                v-if="item"
                :id="`s_service_${index}`"
                :chips="item.servers || []"
                icon="mdi-directions-fork"
                single-line
              />
            </template>
            <template #[`item.createAt`]="{ item }">
              {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
            </template>
            <template #[`item.action`]="{ item }">
              <v-flex :id="`r${item.metadata.resourceVersion}`" />
              <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
                <template #activator="{ on }">
                  <v-btn icon>
                    <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text class="pa-2">
                    <v-flex>
                      <v-btn color="primary" small text @click.stop="updateGateway(item)">
                        {{ $root.$t('operate.edit') }}
                      </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-btn color="error" small text @click.stop="removeIstioGateway(item)">
                        {{ $root.$t('operate.delete') }}
                      </v-btn>
                    </v-flex>
                  </v-card-text>
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
            @loaddata="istioGatewayList"
          />
        </template>
      </PluginPass>
    </v-card>

    <AddGateway ref="addGateway" @refresh="istioGatewayList" />
    <UpdateGateway ref="updateGateway" @refresh="istioGatewayList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddGateway from './components/AddGateway';
  import UpdateGateway from './components/UpdateGateway';
  import messages from './i18n';
  import { deleteIstioGateway, getIstioGatewayList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'Gateway',
    i18n: {
      messages: messages,
    },
    components: {
      AddGateway,
      EnvironmentFilter,
      PluginPass,
      UpdateGateway,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          {
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            sortable: false,
          },
          { text: this.$t('table.selector'), value: 'selector', align: 'start' },
          { text: this.$root.$t('resource.service'), value: 'service', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start', width: 180 },
        ];
        if (this.m_permisson_virtualSpaceAllow) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.gateway_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.istioGatewayList(true);
        },
        deep: true,
      },
      pass: {
        handler(newValue) {
          if (newValue) {
            this.istioGatewayList();
          }
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          Object.assign(this.params, convertStrToNum(this.$route.query));
        });
      }
    },
    methods: {
      async istioGatewayList(noprocess = false) {
        const data = await getIstioGatewayList(
          this.EnvironmentFilter?.cluster || this.$route.query?.cluster,
          this.EnvironmentFilter?.namespace || this.$route.query?.namespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List.map((s) => {
          return {
            ...s,
            servers: s.spec.servers
              ? s.spec.servers.map((server) => {
                  return `${server.port.number} | ${server.port.protocol}`;
                })
              : [],
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.m_table_generateSelectResource();
      },
      addGateway() {
        this.$refs.addGateway.open();
      },
      updateGateway(item) {
        this.$refs.updateGateway.init(item);
        this.$refs.updateGateway.open();
      },
      removeIstioGateway(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.create_c', [this.$root.$t('resource.gateway')]),
          content: {
            text: `${this.$root.$t('operate.create_c', [this.$root.$t('resource.gateway')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIstioGateway(
                this.$route.query.cluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.istioGatewayList();
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
