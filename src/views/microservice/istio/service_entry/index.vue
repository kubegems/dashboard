<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '服务入口名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_virtualSpaceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addServiceEntry">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建服务入口
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveResource('服务入口', 'ServiceEntry', istioServiceEntryList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除服务入口
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
            no-data-text="暂无数据"
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
              <a class="text-subtitle-2">
                {{ item.metadata.name }}
              </a>
            </template>
            <template #[`item.namespace`]="{ item }">
              {{ item.metadata.namespace }}
            </template>
            <template #[`item.hosts`]="{ item, index }">
              <BaseCollapseChips
                v-if="item"
                :id="`s_host_${index}`"
                :chips="item.spec.hosts || []"
                icon="mdi-directions-fork"
                single-line
              />
            </template>
            <template #[`item.ports`]="{ item, index }">
              <BaseCollapseChips
                v-if="item"
                :id="`s_port_${index}`"
                :chips="item.ports || []"
                icon="mdi-directions-fork"
                single-line
              />
            </template>
            <template #[`item.resolution`]="{ item }">
              {{ item.spec.resolution }}
            </template>
            <template #[`item.createAt`]="{ item }">
              {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
            </template>
            <template #[`item.action`]="{ item }">
              <v-flex :id="`r${item.metadata.resourceVersion}`" />
              <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
                <template #activator="{ on }">
                  <v-btn icon>
                    <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text class="pa-2">
                    <v-flex>
                      <v-btn color="primary" small text @click.stop="updateServiceEntry(item)"> 编辑 </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-btn color="error" small text @click.stop="removeIstioServiceEntry(item)"> 删除 </v-btn>
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
            @loaddata="istioServiceEntryList"
          />
        </template>
      </PluginPass>
    </v-card>

    <AddServiceEntry ref="addServiceEntry" @refresh="istioServiceEntryList" />
    <UpdateServiceEntry ref="updateServiceEntry" @refresh="istioServiceEntryList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddServiceEntry from './components/AddServiceEntry';
  import UpdateServiceEntry from './components/UpdateServiceEntry';
  import { deleteIstioServiceEntry, getIstioServiceEntryList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'ServiceEntry',
    components: {
      AddServiceEntry,
      EnvironmentFilter,
      PluginPass,
      UpdateServiceEntry,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '服务入口名称', value: 'search', items: [] }],
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      headers() {
        const items = [
          { text: '服务入口名称', value: 'name', align: 'start' },
          {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          },
          { text: 'Host', value: 'hosts', align: 'start' },
          { text: '端口', value: 'ports', align: 'start' },
          { text: 'Resolution', value: 'resolution', align: 'start' },
          { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
    },
    watch: {
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.istioServiceEntryList(true);
        },
        deep: true,
      },
      pass: {
        handler(newValue) {
          if (newValue) {
            this.istioServiceEntryList();
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
      async istioServiceEntryList(noprocess = false) {
        const data = await getIstioServiceEntryList(
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
            ports: s.spec.ports
              ? s.spec.ports.map((port) => {
                  return `${port.number} | ${port.protocol}`;
                })
              : [],
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.m_table_generateSelectResource();
      },
      addServiceEntry() {
        this.$refs.addServiceEntry.open();
      },
      updateServiceEntry(item) {
        this.$refs.updateServiceEntry.init(item);
        this.$refs.updateServiceEntry.open();
      },
      removeIstioServiceEntry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除服务入口`,
          content: {
            text: `删除服务入口 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIstioServiceEntry(
                this.$route.query.cluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.istioServiceEntryList();
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
