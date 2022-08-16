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
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.ingress_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addIngress">
                  <v-icon left>mdi-plus-network</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.ingress')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveResource($root.$t('resource.ingress'), 'Ingress', ingressList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.ingress')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
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
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="ingressDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.address`]="{ item }">
          <template v-for="(rule, index) in item.spec.rules">
            <template v-for="(path, i) in rule.http.paths">
              <v-flex :key="`c${index}http${i}`" class="mx-1">
                {{ getHost(rule, item) }}{{ getGatewayPort(getSchema(rule, item), item.spec.ingressClassName)
                }}{{ path.path }}
                <v-btn
                  :key="`i${index}http${i}`"
                  icon
                  small
                  @click="
                    toAddress(
                      `${getHost(rule, item)}${getGatewayPort(getSchema(rule, item), item.spec.ingressClassName)}${
                        path.path
                      }`,
                    )
                  "
                >
                  <v-icon color="success" small> mdi-open-in-new </v-icon>
                </v-btn>
              </v-flex>
            </template>
          </template>
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
                  <v-btn color="primary" small text @click="updateIngress(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeIngress(item)">
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
        @loaddata="ingressList"
      />
    </v-card>

    <AddIngress ref="addIngress" @refresh="ingressList" />
    <UpdateIngress ref="updateIngress" @refresh="ingressList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddIngress from './components/AddIngress';
  import UpdateIngress from './components/UpdateIngress';
  import messages from './i18n';
  import { deleteIngress, getGatewayList, getIngressList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'Ingress',
    i18n: {
      messages: messages,
    },
    components: {
      AddIngress,
      NamespaceFilter,
      UpdateIngress,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      gateway: {},
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.address'), value: 'address', align: 'start', sortable: false },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start' },
        ];
        if (this.m_permisson_resourceAllow) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        if (this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.ingress_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.ingressList();
          }
        },
        deep: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.ingressList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_cluster'),
            color: 'warning',
          });
          return;
        }
        this.$nextTick(() => {
          this.m_table_generateParams();
          this.ingressList();
        });
      }
    },
    methods: {
      async ingressList(noprocess = false) {
        const data = await getIngressList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.m_table_generateSelectResource();
        this.gatewayList();
      },
      addIngress() {
        this.$refs.addIngress.open();
      },
      updateIngress(item) {
        this.$refs.updateIngress.init(item);
        this.$refs.updateIngress.open();
      },
      ingressDetail(item) {
        this.$router.push({
          name: 'ingress-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      removeIngress(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.ingress')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.ingress')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIngress(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.ingressList();
            }
          },
        });
      },
      async gatewayList() {
        const data = await getGatewayList(this.AdminViewport ? '_all' : this.Tenant().ID, this.ThisClusterID, {
          size: 1000,
          noprocessing: true,
        });
        this.gateway = {};
        data.forEach((d) => {
          this.gateway[d.spec.ingressClass] = d;
        });
      },
      getSchema(rule, item) {
        let prefix = 'http';
        if (item.spec.tls) {
          item.spec.tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              prefix = 'https';
              return;
            }
          });
        }
        return prefix;
      },
      getHost(rule, item) {
        let prefix = 'http';
        if (item.spec.tls) {
          item.spec.tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              prefix = 'https';
              return;
            }
          });
        }
        return `${prefix}://${rule.host}`;
      },
      getGatewayPort(type, name) {
        const gateway = this.gateway[name];
        if (gateway && gateway.status) {
          if (type === 'http') {
            const g = gateway.status.ports.find((g) => {
              return g.name === 'http';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          } else if (type === 'https') {
            const g = gateway.status.ports.find((g) => {
              return g.name === 'https';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          }
        }
        return '';
      },
      toAddress(address) {
        window.open(address);
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
