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
        <BaseFilter :default="filters[0]" :filters="filters" @refresh="frontFilter" />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow($route.query.env)" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat>
            <v-btn block color="primary" text @click="addFlow">
              <v-icon left>mdi-plus-box</v-icon>
              {{ $root.$t('operate.create_c', [$root.$t('resource.flow')]) }}
            </v-btn>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text class="px-0">
        <v-data-table
          disable-pagination
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :no-data-text="$root.$t('data.no_data')"
        >
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click="flowDetail(item)">
              {{ item.metadata.name }}
            </a>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.metadata.namespace }}
          </template>
          <template #[`item.router`]="{ item, index }">
            <BaseCollapseChips
              :id="`s_router_${index}`"
              :chips="[...(item.spec.globalOutputRefs || []), ...(item.spec.localOutputRefs || [])]"
              :count="1"
            />
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ $moment(item.metadata.creationTimestamp).format('lll') }}
          </template>
          <template #[`item.status`]="{ item }">
            <template v-if="item.status && item.status.active">
              <v-icon color="success" small> mdi-check-circle </v-icon>
              {{ $t('status.actived') }}
            </template>
            <template v-else>
              <v-icon color="error" small> mdi-alert-circle </v-icon>
              {{ $t('status.unactived') }}
            </template>
          </template>
          <template #[`item.action`]="{ item }">
            <v-menu left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card class="pa-2" flat>
                <v-flex>
                  <v-btn
                    color="primary"
                    :disabled="item.kind === 'ClusterFlow' && !AdminViewport"
                    small
                    text
                    @click="updateFlow(item)"
                  >
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    block
                    color="error"
                    :disabled="item.kind === 'ClusterFlow' && !AdminViewport"
                    small
                    text
                    @click="removeFlow(item)"
                  >
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
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
          @loaddata="frontFilter"
        />
      </v-card-text>
    </v-card>

    <AddFlow ref="addFlow" @refresh="getFlowList" />

    <UpdateFlow ref="updateFlow" @refresh="getFlowList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AddFlow from './components/AddFlow';
  import UpdateFlow from './components/UpdateFlow';
  import { deleteClusterFlowData, deleteFlowData, getClusterFlowsData, getFlowsData } from '@/api';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'LogFlow',
    i18n: {
      messages: messages,
    },
    components: {
      AddFlow,
      UpdateFlow,
    },
    mixins: [BasePermission],
    props: {
      pass: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      this.cacheAll = [];
      this.cacheFilter = [];

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
          kind: undefined,
          name: undefined,
          cluster: undefined,
          namespace: undefined,
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.type'), value: 'kind', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.output'), value: 'router', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start', width: 200 },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 100 },
        ];

        if (this.m_permisson_resourceAllow(this.$route.query.env)) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [
          { text: this.$t('filter.flow_name'), value: 'name', items: [] },
          {
            text: this.$t('filter.flow_type'),
            value: 'kind',
            items: [
              { text: 'Flow', value: 'Flow', parent: 'kind' },
              { text: 'ClusterFlow', value: 'ClusterFlow', parent: 'kind' },
            ],
          },
        ];
      },
    },
    watch: {
      '$route.query': {
        handler(newValue) {
          const { cluster, namespace } = this.params;
          const { cluster: newCluster, namespace: newNamespace } = newValue;
          const needRefresh = (cluster !== newCluster || namespace !== newNamespace) && this.pass;
          this.params = { ...this.params, ...newValue };
          this.params.namespace = this.params.namespace || '_all';
          if (needRefresh) {
            this.getFlowList();
          } else {
            this.frontFilter();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async getFlowList() {
        const { cluster, namespace } = this.params;
        if (!cluster || !namespace) return;

        const params = [cluster, namespace, { page: 1, size: 999 }];
        const res = await Promise.all([getFlowsData(...params), getClusterFlowsData(...params)]);
        const list = res.reduce((pre, current) => pre.concat(current.List), []);
        this.cacheAll = list.sort(
          (a, b) => Date.parse(b.metadata.creationTimestamp) - Date.parse(a.metadata.creationTimestamp),
        );
        this.frontFilter();
      },
      frontFilter(params) {
        if (params) {
          this.params.name = params.name;
          this.params.kind = params.kind;
          this.params.page = 1;
        }
        const { kind, name, page, size } = this.params;
        this.cacheFilter = this.cacheAll.filter((item) => {
          const isName = !name || item.metadata.name.includes(name);
          const isKind = !kind || item.kind === kind;
          return isName && isKind;
        });
        this.pageCount = Math.ceil(this.cacheFilter.length / size);
        this.items = this.cacheFilter.slice((page - 1) * size, page * size);
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
        this.frontFilter();
      },
      onPageIndexChange(page) {
        this.params.page = page;
        this.frontFilter();
      },
      addFlow() {
        this.$refs.addFlow.open();
      },
      updateFlow(item) {
        this.$refs.updateFlow.init(item);
        this.$refs.updateFlow.open();
      },
      removeFlow(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.flow')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.flow')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          doFunc: async () => {
            if (item.kind === 'Flow') {
              await deleteFlowData(this.params.cluster, item.metadata.namespace, item.metadata.name);
            } else {
              await deleteClusterFlowData(this.params.cluster, item.metadata.name);
            }
            this.getFlowList();
          },
        });
      },
      flowDetail(item) {
        this.$router.push({
          name: this.AdminViewport ? 'admin-log-flow-detail' : 'log-flow-detail',
          params: Object.assign(this.$route.params, {
            kind: item.kind,
            name: item.metadata.name,
          }),
          query: {
            cluster: this.params.cluster,
            namespace: item.metadata.namespace,
            proj: this.$route.query.proj,
            env: this.$route.query.env,
          },
        });
      },
    },
  };
</script>
