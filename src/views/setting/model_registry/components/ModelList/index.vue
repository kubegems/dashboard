<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
  <v-card>
    <v-card-text>
      <BaseFilter
        :default="{ items: [], text: '模型名称', value: 'search' }"
        :filters="filters"
        @refresh="m_filter_list"
      />
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
      >
        <template #[`item.lastModified`]="{ item }">
          {{ item ? $moment(item.lastModified).format('lll') : '' }}
        </template>
        <template #[`item.recomment`]="{ item }">
          <v-icon v-if="item.recomment >= 80" color="error">mdi-fire</v-icon>
          {{ item.recomment }}
          <v-btn color="orange" icon @click="recommend(item)">
            <v-icon small>mdi-circle-edit-outline</v-icon>
          </v-btn>
        </template>
        <template #[`item.status`]="{ item }">
          <template v-if="item.status">
            <v-icon color="error" small>mdi-check-circle</v-icon>
            已发布
          </template>
          <template v-else>
            <v-icon color="error" small>mdi-close-circle</v-icon>
            未发布
          </template>
        </template>
        <template #[`item.tags`]="{ item }">
          <BaseCollapseChips id="m_tag" :chips="item.tags || {}" icon="mdi-label" single-line />
          <v-btn color="orange" icon>
            <v-icon small>mdi-circle-edit-outline</v-icon>
          </v-btn>
        </template>
        <template #[`item.action`]="{ item, index }">
          <v-flex :id="`rm${index}`" />
          <v-menu :attach="`#rm${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="togglePublishModel(item)"> 上架 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeModel(item)"> 删除 </v-btn>
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
        @loaddata="modelList"
      />

      <Recommend ref="recommend" @refresh="modelList" />
    </v-card-text>
  </v-card>
</template>

<script>
  import { Base64 } from 'js-base64';

  import Recommend from './Recommend';
  import { deleteModelStoreModel, getModelStoreList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';

  export default {
    name: 'ModelList',
    components: {
      Recommend,
    },
    mixins: [BaseFilter],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      items: [],
      headers: [
        { text: '名称', value: 'name', align: 'start' },
        { text: '版本', value: 'versions', align: 'start' },
        { text: '框架', value: 'framework', align: 'start' },
        { text: '类型', value: 'task', align: 'start' },
        { text: 'Tag', value: 'tags', align: 'start' },
        { text: '上次更新', value: 'lastModified', align: 'start' },
        { text: '推荐值', value: 'recomment', align: 'start' },
        { text: '发布', value: 'status', align: 'start' },
        { text: '', value: 'action', align: 'center', width: 20, sortable: false },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
      filters: [{ text: '模型名称', value: 'search', items: [] }],
    }),
    watch: {
      item: {
        handler: function () {
          if (this.item) {
            this.modelList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelList() {
        const data = await getModelStoreList(this.item.name, { ...this.params, ...this.$route.query });
        this.items = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({ query: { search: this.$route.query.search || null, ...this.params } });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      recommend(item) {
        this.$refs.recommend.init(item);
        this.$refs.recommend.open();
      },
      removeModel(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除算法模型`,
          content: {
            text: `删除算法模型 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteModelStoreModel(this.$route.params.name, Base64.encode(param.item.name));
            this.modelList();
          },
        });
      },
      togglePublishModel() {},
    },
  };
</script>
