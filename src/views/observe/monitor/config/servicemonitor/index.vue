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
  <v-container class="pa-0" fluid>
    <v-card flat>
      <v-card-title class="px-0">
        <BaseFilter
          :default="{ items: [], text: $t('filter.servicemonitor_name'), value: 'search' }"
          :filters="filters"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow($route.query.env)" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addServiceMonitor">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.service_monitor')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text class="px-0">
        <v-data-table
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="params.size"
          :no-data-text="$root.$t('data.no_data')"
          :page.sync="params.page"
          @update:sort-by="m_table_sortBy"
          @update:sort-desc="m_table_sortDesc"
        >
          <template #[`item.data-table-select`]="{ item, index }">
            <v-checkbox
              v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
              color="primary"
              hide-details
              @change="onResourceChange($event, item, index)"
              @click.stop
            />
          </template>
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="serviceMonitorDetail(item)">
              {{ item.metadata.name }}
            </a>
          </template>
          <template #[`item.service`]="{ item }">
            {{ showSvc(item) }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.metadata.namespace }}
          </template>
          <template #[`item.port`]="{ item }">
            {{ showPort(item) }}
          </template>
          <template #[`item.path`]="{ item }">
            {{ item.spec.endpoints.length > 0 && item.spec.endpoints[0].path ? item.spec.endpoints[0].path : '' }}
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
                    <v-btn color="primary" small text @click="updateServiceMonitor(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeServiceMonitor(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>

      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="serviceMonitorList"
      />
    </v-card>

    <AddServiceMonitor ref="addServiceMonitor" @refresh="serviceMonitorList" />
    <UpdateServiceMonitor ref="updateServiceMonitor" @refresh="serviceMonitorList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import AddServiceMonitor from './components/AddServiceMonitor';
  import UpdateServiceMonitor from './components/UpdateServiceMonitor';
  import { deleteServiceMonitor, getServiceMonitorList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';

  export default {
    name: 'ServiceMonitorList',
    i18n: {
      messages: messages,
    },
    components: {
      AddServiceMonitor,
      UpdateServiceMonitor,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    props: {
      pass: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      items: [],
      pageCount: 0,
      cluster: undefined,
      namespace: undefined,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.port'), value: 'port', align: 'start', sortable: false },
          { text: this.$t('table.path'), value: 'path', align: 'start', sortable: false },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'center' },
        ];
        if (this.m_permisson_resourceAllow(this.$route.query.env)) {
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
        return [{ text: this.$t('filter.servicemonitor_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.serviceMonitorList(true);
        },
        deep: true,
      },
      '$route.query': {
        handler(newValue) {
          const { cluster, namespace } = this.params;
          const { cluster: newCluster, namespace: newNamespace } = newValue;
          const needRefresh = (cluster !== newCluster || namespace !== newNamespace) && this.pass;
          if (needRefresh) {
            this.m_table_generateParams();
            this.serviceMonitorList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async serviceMonitorList(noprocess = false) {
        const { cluster, namespace } = this.$route.query;
        this.cluster = cluster;
        this.namespace = namespace;
        if (!this.cluster || !this.namespace) return;

        const data = await getServiceMonitorList(
          this.cluster,
          this.namespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        // this.m_table_generateSelectResource()
      },
      serviceMonitorDetail(item) {
        this.$router.push({
          name: 'servicemonitor-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: this.$route.query,
        });
      },
      addServiceMonitor() {
        this.$refs.addServiceMonitor.open();
      },
      updateServiceMonitor(item) {
        this.$refs.updateServiceMonitor.init(item);
        this.$refs.updateServiceMonitor.open();
      },
      removeServiceMonitor(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.service_monitor')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.service_monitor')])} ${
              item.metadata.name
            }`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteServiceMonitor(this.cluster, param.item.metadata.namespace, param.item.metadata.name);
              this.serviceMonitorList();
            }
          },
        });
      },
      showPort(item) {
        if (item.spec.endpoints.length > 0 && item.spec.endpoints[0].port) {
          return item.spec.endpoints[0].port;
        } else if (item.spec.endpoints.length > 0 && item.spec.endpoints[0].targetPort) {
          return item.spec.endpoints[0].targetPort;
        } else {
          return '';
        }
      },
      showSvc(item) {
        if (item.metadata.labels && item.metadata.labels[`svc`]) {
          return item.metadata.labels[`svc`];
        } else {
          // TODO: 非手动创建的ServiceMonitor需要通过label匹配,先获取所有服务, 然后从中过滤出服务,暂缓
          return '';
        }
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
