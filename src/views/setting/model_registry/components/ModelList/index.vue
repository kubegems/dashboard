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
<i18n src="./locales.json" />
<template>
  <v-card>
    <v-card-title>
      <BaseFilter
        :default="{ items: [], text: `${$t('search')}`, value: 'search' }"
        :filters="filters"
        @refresh="m_filter_list"
      />
      <v-spacer />
      <v-menu left>
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2">
            <v-flex>
              <v-btn color="primary" text @click="toggleOnlineModels(true)">
                <v-icon left>mdi-arrow-up-bold</v-icon>
                上架
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn color="error" text @click="toggleOnlineModels(false)">
                <v-icon left>mdi-arrow-down-bold</v-icon>
                下架
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-card-title>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-select
        @toggle-select-all="m_table_onNotK8SResourceToggleSelect($event, 'name')"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="m_table_batchResources[index].checked"
            color="primary"
            hide-details
            @change="m_table_onNotK8SResourceChange($event, item, 'name', index)"
            @click.stop
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2" @click="modelDetail(item)">
            {{ item.name }}
          </a>
        </template>
        <template #[`item.versions`]="{ item }">
          <BaseCollapseChips id="m_version" :chips="item.versions || []" icon="mdi-vimeo" single-line />
        </template>
        <template #[`item.lastModified`]="{ item }">
          {{ item && item.lastModified ? $moment(item.lastModified).format('lll') : '' }}
        </template>
        <template #[`item.recomment`]="{ item }">
          <div class="text-end">
            <v-icon v-if="item.recomment >= 80" color="error">mdi-fire</v-icon>
            {{ item.recomment }}
            <v-btn color="orange" icon @click="recommend(item)">
              <v-icon small>mdi-circle-edit-outline</v-icon>
            </v-btn>
          </div>
        </template>
        <template #[`item.enabled`]="{ item }">
          <template v-if="item.enabled">
            <v-icon color="success" small>mdi-check-circle</v-icon>
            已上架
          </template>
          <template v-else>
            <v-icon color="error" small>mdi-close-circle</v-icon>
            未上架
          </template>
        </template>
        <template #[`item.tags`]="{ item }">
          <BaseCollapseChips id="m_tag" :chips="item.tags || []" icon="mdi-label" single-line />
          <v-btn v-if="registry && !registry.online" color="orange" icon @click="tagModel(item)">
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
                    {{ item.enabled ? '下架' : '上架' }}
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
  import {
    deleteAdminModelStoreModel,
    getAdminModelStoreFilterCondition,
    getAdminModelStoreList,
    putAdminUpdateModel,
  } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseTable from '@/mixins/table';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ModelList',
    components: {
      Recommend,
      TagModel,
    },
    mixins: [BaseFilter, BaseTable],
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
      registry: null,
      conditions: [],
    }),
    computed: {
      headers() {
        const items = [
          { text: this.$t('name'), value: 'name', align: 'start' },
          { text: this.$t('version'), value: 'versions', align: 'start' },
          { text: this.$t('framework'), value: 'framework', align: 'start' },
          { text: this.$t('task'), value: 'task', align: 'start' },
          { text: this.$t('tag'), value: 'tags', align: 'start' },
          { text: this.$t('last_modified'), value: 'lastModified', align: 'start' },
          { text: this.$t('recommend'), value: 'recomment', align: 'start', width: 120 },
          { text: this.$t('published'), value: 'enabled', align: 'start', width: 90 },
          { text: '', value: 'action', align: 'center', width: 20, sortable: false },
        ];

        return items;
      },
      filters() {
        return [{ text: this.$t('search'), value: 'search', items: [] }].concat(this.conditions);
      },
    },
    watch: {
      item: {
        handler() {
          if (this.item) {
            this.registry = deepCopy(this.item);
            this.modelList();
            this.adminModelStoreFilterCondition();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelList() {
        const query = {
          search: this.$route.query.search || null,
          framework: this.$route.query.framework || null,
          license: this.$route.query.license || null,
          task: this.$route.query.task || null,
          modelCount: this.$route.query.modelCount || null,
        };
        const data = await getAdminModelStoreList(this.item.name, {
          ...this.params,
          ...query,
        });
        this.items = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({
          query: {
            ...this.params,
            ...query,
          },
        });
        this.m_table_generateSelectResourceNoK8s('name');
      },
      async adminModelStoreFilterCondition() {
        this.conditions = [];
        const data = await getAdminModelStoreFilterCondition(this.$route.params.name);
        this.conditions.push({
          text: '框架',
          value: 'framework',
          items: data.frameworks.map((d) => {
            return { text: d, value: d, parent: 'framework' };
          }),
        });

        this.conditions.push({
          text: 'License',
          value: 'license',
          items: data.licenses.map((d) => {
            return { text: d, value: d, parent: 'license' };
          }),
        });

        this.conditions.push({
          text: '类型',
          value: 'task',
          items: data.tasks.map((d) => {
            return { text: d, value: d, parent: 'task' };
          }),
        });
      },
      modelDetail(item) {
        this.$router.push({
          name: 'modelstore-detail',
          params: { name: item.name },
          query: {
            registry: this.$route.params.name,
            online: this.item.online,
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
            await deleteAdminModelStoreModel(this.$route.params.name, Base64.encode(param.item.name));
            this.modelList();
          },
        });
      },
      togglePublishModel(item) {
        this.$store.commit('SET_CONFIRM', {
          title: item.enabled ? `下架算法模型` : `上架算法模型`,
          content: {
            text: item.enabled ? `下架算法模型 ${item.name}` : `上架算法模型 ${item.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            const data = deepCopy(param.item);
            data.enabled = !data.enabled;
            await putAdminUpdateModel(this.$route.params.name, Base64.encode(param.item.name), data);
            this.modelList();
          },
        });
      },
      toggleOnlineModels(online = true) {
        if (!Object.values(this.m_table_batchResources).some((c) => c.checked)) {
          this.$store.commit('SET_SNACKBAR', {
            text: `请勾选算法模型`,
            color: 'warning',
          });
          return;
        }
        const resources = Object.values(this.m_table_batchResources)
          .filter((c) => c.checked)
          .map((c) => c.name);
        this.$store.commit('SET_CONFIRM', {
          title: online ? `批量上架算法模型` : `批量下架算法模型`,
          content: {
            text: `${resources.join(',')}`,
            type: 'batch_delete',
            one: resources.length === 1 ? resources[0] : undefined,
            status: {},
            tip: online ? `上架` : `下架`,
          },
          param: { online },
          doFunc: async (param) => {
            for (const id in this.m_table_batchResources) {
              if (this.m_table_batchResources[id].checked) {
                try {
                  const data = this.items.find((m) => {
                    return m.name === this.m_table_batchResources[id].name;
                  });
                  if (data) {
                    data.enabled = param.online;
                    await putAdminUpdateModel(this.$route.params.name, Base64.encode(data.name), data);
                    this.$store.commit('SET_CONFIRM_STATUS', {
                      key: this.m_table_batchResources[id].name,
                      value: true,
                    });
                  }
                } catch {
                  this.$store.commit('SET_CONFIRM_STATUS', {
                    key: this.m_table_batchResources[id].name,
                    value: false,
                  });
                }
              }
            }
            this.modelList();
          },
        });
      },
    },
  };
</script>
