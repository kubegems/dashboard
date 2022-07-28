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
<i18n src="./locales.json" />
<template>
  <v-card>
    <v-card-text>
      <BaseFilter
        :default="{ items: [], text: `${$t('search')}`, value: 'search' }"
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
        <template #[`item.published`]="{ item }">
          <template v-if="item.published">
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
          <v-btn color="orange" icon @click="tagModel(item)">
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
                  <v-btn color="primary" small text @click="togglePublishModel(item)">
                    {{ item.published ? '下架' : '发布' }}
                  </v-btn>
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
      <TagModel ref="tagModel" @refresh="modelList" />
    </v-card-text>
  </v-card>
</template>

<script>
  import { Base64 } from 'js-base64';

  import Recommend from './Recommend';
  import TagModel from './TagModel';
  import { deleteModelStoreModel, getModelStoreList, putUpdateModel } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ModelList',
    components: {
      Recommend,
      TagModel,
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
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
    computed: {
      headers() {
        return [
          { text: this.$t('name'), value: 'name', align: 'start' },
          { text: this.$t('version'), value: 'versions', align: 'start' },
          { text: this.$t('framework'), value: 'framework', align: 'start' },
          { text: this.$t('task'), value: 'task', align: 'start' },
          { text: this.$t('tag'), value: 'tags', align: 'start' },
          { text: this.$t('last_modified'), value: 'lastModified', align: 'start' },
          { text: this.$t('recommend'), value: 'recomment', align: 'start' },
          { text: this.$t('published'), value: 'published', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20, sortable: false },
        ];
      },
      filters() {
        return [{ text: this.$t('search'), value: 'search', items: [] }];
      },
    },
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
        const data = await getModelStoreList(this.item.name, {
          ...this.params,
          search: this.$route.query.search || null,
        });
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
      tagModel(item) {
        this.$refs.tagModel.init(item);
        this.$refs.tagModel.open();
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
      togglePublishModel(item) {
        this.$store.commit('SET_CONFIRM', {
          title: item.published ? `下架算法模型` : `发布算法模型`,
          content: {
            text: item.published ? `下架算法模型 ${item.name}` : `发布算法模型 ${item.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            const data = deepCopy(param.item);
            data.published = !data.published;
            await putUpdateModel(this.$route.params.name, Base64.encode(param.item.name), data);
            this.modelList();
          },
        });
      },
    },
  };
</script>
