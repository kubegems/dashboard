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
          :default="{ items: [], text: '端点认证名称', value: 'search' }"
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
                <v-btn color="primary" text @click="addPeerAuthentication">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建端点认证
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveResource('端点认证', 'PeerAuthentication', istioPeerAuthenticationList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除端点认证
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
            <template #[`item.createAt`]="{ item }">
              {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
            </template>
            <template #[`item.selector`]="{ item, index }">
              <BaseCollapseChips
                v-if="item"
                :id="`e_selector_${index}`"
                :chips="item.spec.selector.matchLabels || {}"
                icon="mdi-label"
                single-line
              />
            </template>
            <template #[`item.mutualTLS`]="{ item }">
              {{ item.spec.mtls ? item.spec.mtls.mode : '' }}
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
                      <v-btn color="primary" small text @click.stop="updatePeerAuthentication(item)"> 编辑 </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-btn color="error" small text @click.stop="removeIstioPeerAuthentication(item)"> 删除 </v-btn>
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
            @loaddata="istioPeerAuthenticationList"
          />
        </template>
      </PluginPass>
    </v-card>

    <AddPeerAuthentication ref="addPeerAuthentication" @refresh="istioPeerAuthenticationList" />
    <UpdatePeerAuthentication ref="updatePeerAuthentication" @refresh="istioPeerAuthenticationList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddPeerAuthentication from './components/AddPeerAuthentication';
  import UpdatePeerAuthentication from './components/UpdatePeerAuthentication';
  import { deleteIstioPeerAuthentication, getIstioPeerAuthenticationList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import PluginPass from '@/views/microservice/components/PluginPass';

  export default {
    name: 'PeerAuthentication',
    components: {
      AddPeerAuthentication,
      EnvironmentFilter,
      PluginPass,
      UpdatePeerAuthentication,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '端点认证名称', value: 'search', items: [] }],
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      headers() {
        const items = [
          { text: '端点认证名称', value: 'name', align: 'start' },
          {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          },
          { text: '匹配标签', value: 'selector', align: 'start' },
          { text: 'TLS设置', value: 'mutualTLS', align: 'start' },
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
          this.istioPeerAuthenticationList(true);
        },
        deep: true,
      },
      pass: {
        handler(newValue) {
          if (newValue) {
            this.istioPeerAuthenticationList();
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
      async istioPeerAuthenticationList(noprocess = false) {
        const data = await getIstioPeerAuthenticationList(
          this.EnvironmentFilter?.cluster || this.$route.query?.cluster,
          this.EnvironmentFilter?.namespace || this.$route.query?.namespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.m_table_generateSelectResource();
      },
      addPeerAuthentication() {
        this.$refs.addPeerAuthentication.open();
      },
      updatePeerAuthentication(item) {
        this.$refs.updatePeerAuthentication.init(item);
        this.$refs.updatePeerAuthentication.open();
      },
      removeIstioPeerAuthentication(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除端点认证`,
          content: {
            text: `删除端点认证 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIstioPeerAuthentication(
                this.$route.query.cluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.istioPeerAuthenticationList();
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
