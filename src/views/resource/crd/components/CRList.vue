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
  <v-sheet class="pa-4 rounded">
    <v-card class="pa-0" flat>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn v-if="m_permisson_resourceAllow" color="primary" small text @click="addCR">
          <v-icon left>mdi-plus-box</v-icon>
          创建自定义资源
        </v-btn>
      </v-card-title>
    </v-card>
    <v-data-table
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      :page.sync="params.page"
    >
      <template #[`item.name`]="{ item }">
        {{ item.metadata.name }}
      </template>
      <template #[`item.namespace`]="{ item }">
        {{ item.metadata.namespace }}
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
                <v-btn color="primary" small text @click="updateCR(item)"> 编辑 </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" small text @click="removeCR(item)"> 删除 </v-btn>
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
      @loaddata="crList"
    />

    <AddCR ref="addCR" @refresh="crList" />
    <UpdateCR ref="updateCR" @refresh="crList" />
  </v-sheet>
</template>

<script>
  import AddCR from './AddCR';
  import UpdateCR from './UpdateCR';
  import { deleteCr, getCrList } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'CRList',
    components: {
      AddCR,
      UpdateCR,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
    computed: {
      headers() {
        const items = [
          { text: '名称', value: 'name', align: 'start' },
          { text: '创建时间', value: 'createAt', align: 'start' },
        ];
        if (this.item && this.item.spec.scope === 'Namespaced') {
          items.splice(1, 0, {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        if (this.m_permisson_resourceAllow) {
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
      item: {
        handler: function () {
          if (this.item) {
            this.crList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async crList() {
        const data = await getCrList(
          this.ThisCluster,
          this.$route.query.namespace || '_all',
          this.item.spec.group,
          this.item.status.storedVersions[0],
          this.item.spec.names.plural,
          this.item.spec.scope,
          this.params,
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      addCR() {
        this.$refs.addCR.init(this.item);
        this.$refs.addCR.open();
      },
      updateCR(item) {
        this.$refs.updateCR.init(item, this.item);
        this.$refs.updateCR.open();
      },
      removeCR(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除资源`,
          content: {
            text: `删除资源 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteCr(
                this.ThisCluster,
                param.item.metadata.namespace || '_all',
                param.item.metadata.name,
                this.item.spec.group,
                this.item.status.storedVersions[0],
                this.item.spec.names.plural,
                this.item.spec.scope,
              );
              this.crList();
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
