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
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '密钥名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addSecret">
                  <v-icon left>mdi-key-plus</v-icon>
                  创建密钥
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveResource('密钥', 'Secret', secretList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除密钥
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
        <template #[`item.name`]="{ item, index }">
          <v-flex :id="`t${item.secret.metadata.resourceVersion}`" />
          <a class="text-subtitle-2" @click="secretDetail(item.secret)">
            {{ item.secret.metadata.name }}
          </a>
          <Tips
            v-if="item.secret.type === 'kubernetes.io/tls' && item.certInfo"
            :attach="item.secret.metadata.resourceVersion"
            :item="item.certInfo"
            :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
          />
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.secret.metadata.namespace }}
        </template>
        <template #[`item.type`]="{ item }">
          {{ item.secret.type }}
        </template>
        <template #[`item.dataCount`]="{ item }">
          {{ item.secret.data ? Object.keys(item.secret.data).length : 0 }}
        </template>
        <template #[`item.createAt`]="{ item }">
          {{
            item.secret.metadata.creationTimestamp ? $moment(item.secret.metadata.creationTimestamp).format('lll') : ''
          }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.secret.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.secret.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateSecret(item.secret)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeSecret(item.secret)"> 删除 </v-btn>
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
        @loaddata="secretList"
      />
    </v-card>

    <AddSecret ref="addSecret" @refresh="secretList" />
    <UpdateSecret ref="updateSecret" @refresh="secretList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddSecret from './components/AddSecret';
  import Tips from './components/Tips';
  import UpdateSecret from './components/UpdateSecret';
  import { deleteSecret, getSecretList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'Secret',
    components: {
      AddSecret,
      NamespaceFilter,
      Tips,
      UpdateSecret,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '密钥名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: '密钥名', value: 'name', align: 'start' },
          { text: '类型', value: 'type', align: 'start', sortable: false },
          {
            text: '密钥数量',
            value: 'dataCount',
            align: 'start',
            sortable: false,
          },
          { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        return items;
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.secretList();
          }
        },
        deep: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.secretList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: `请创建或选择集群`,
              color: 'warning',
            });
            return;
          }
          this.m_table_generateParams();
          this.secretList();
        });
      }
    },
    methods: {
      async secretList(noprocess = false) {
        const data = await getSecretList(
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
        this.items = this.items.map((secret) => {
          return {
            ...secret.secret,
            ...secret,
          };
        });
        this.m_table_generateSelectResource();
      },
      secretDetail(item) {
        this.$router.push({
          name: 'secret-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      addSecret() {
        this.$refs.addSecret.open();
      },
      updateSecret(item) {
        this.$refs.updateSecret.init(item);
        this.$refs.updateSecret.open();
      },
      removeSecret(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除密钥`,
          content: {
            text: `删除密钥 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteSecret(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.secretList();
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
