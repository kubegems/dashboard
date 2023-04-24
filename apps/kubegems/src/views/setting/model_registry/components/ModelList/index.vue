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
  <v-card>
    <v-card-title>
      <BaseFilter1
        :default="{ items: [], text: `${i18nLocal.t('filter.search')}`, value: 'search' }"
        :filters="filters"
      />
      <v-spacer />
      <v-menu left>
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2">
            <v-flex>
              <v-btn color="primary" text @click="batchOperateModel(true)">
                <v-icon left>mdi-arrow-up-bold</v-icon>
                {{ i18nLocal.t('operate.online') }}
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn color="error" text @click="batchOperateModel(false)">
                <v-icon left>mdi-arrow-down-bold</v-icon>
                {{ i18nLocal.t('operate.offline') }}
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
        item-key="name"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-select
        @item-selected="selected"
        @toggle-select-all="toggleSelectAll"
      >
        <template #item.name="{ item }">
          <v-badge v-if="item.recommentContent" bordered color="primary" icon="mdi-script-text" inline>
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="toModelDetail(item)">
              {{ item.name }}
            </a>
          </v-badge>
          <a v-else class="text-subtitle-2 kubegems__inline_flex" @click.stop="toModelDetail(item)">
            {{ item.name }}
          </a>
        </template>
        <template #item.versions="{ item }">
          <BaseCollapseChips id="m_version" :chips="item.versions || []" icon="mdi-alpha-v-circle" single-line />
        </template>
        <template #item.lastModified="{ item }">
          {{ item && item.lastModified ? moment(item.lastModified).format('lll') : '' }}
        </template>
        <template #item.recomment="{ item }">
          <div class="text-end">
            <v-icon v-if="item.recomment >= 80" color="error">mdi-fire</v-icon>
            {{ item.recomment }}
            <v-btn color="orange" icon @click="recommendModel(item)">
              <v-icon small>mdi-circle-edit-outline</v-icon>
            </v-btn>
          </div>
        </template>
        <template #item.enabled="{ item }">
          <template v-if="item.enabled">
            <v-icon color="success" small>mdi-check-circle</v-icon>
            {{ i18nLocal.t('operate.online') }}
          </template>
          <template v-else>
            <v-icon color="error" small>mdi-close-circle</v-icon>
            {{ i18nLocal.t('operate.offline') }}
          </template>
        </template>
        <template #item.auth="{ item }">
          <template v-if="item.annotations && item.annotations['modelx.kubegems.io/token-required'] === 'true'">
            <v-icon color="success" small>mdi-check-circle</v-icon>
            {{ i18nLocal.t('tip.need_auth') }}
          </template>
          <template v-else>
            <v-icon color="error" small>mdi-close-circle</v-icon>
            {{ i18nLocal.t('tip.not_need_auth') }}
          </template>
        </template>
        <template #item.tags="{ item }">
          <BaseCollapseChips id="m_tag" :chips="item.tags || []" icon="mdi-label" single-line />
          <v-btn v-if="item && !item.online" class="float-right" color="orange" icon @click="tagModel(item)">
            <v-icon small>mdi-circle-edit-outline</v-icon>
          </v-btn>
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`rm${index}`" />
          <v-menu :attach="`#rm${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="togglePublishModel(item)">
                    {{ item.enabled ? i18nLocal.t('operate.offline') : i18nLocal.t('operate.online') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="recommendContentModel(item)">
                    {{ i18nLocal.t('operate.recommend_content') }}
                  </v-btn>
                </v-flex>
                <template v-if="item && !item.online">
                  <v-flex v-if="item.annotations && item.annotations['modelx.kubegems.io/token-required'] === 'true'">
                    <v-btn color="error" small text @click="setTokenStatus(item, false)">
                      {{ i18nLocal.t('operate.cancel_auth_flag') }}
                    </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="primary" small text @click="setTokenStatus(item, true)">
                      {{ i18nLocal.t('operate.set_auth_flag') }}
                    </v-btn>
                  </v-flex>
                </template>
                <v-flex>
                  <v-btn color="error" small text @click="removeModel(item)"> {{ i18n.t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getModelList"
      />

      <Recommend ref="recommend" @refresh="getModelList" />
      <RecommendContent ref="recommendContent" @refresh="getModelList" />
      <TagModel ref="tag" @refresh="getModelList" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { useAdminAiModelPagination } from '@kubegems/api/hooks/ai_model';
  import { AIModel, AIModelRegistry } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import Recommend from './Recommend.vue';
  import RecommendContent from './RecommendContent.vue';
  import TagModel from './TagModel.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();

  const props = withDefaults(
    defineProps<{
      item?: AIModelRegistry;
    }>(),
    {
      item: undefined,
    },
  );

  const headers: ComputedRef<any[]> = computed(() => {
    const items = [
      { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
      { text: i18nLocal.t('table.version'), value: 'versions', align: 'start' },
      { text: i18nLocal.t('table.framework'), value: 'framework', align: 'start' },
      { text: i18nLocal.t('table.task'), value: 'task', align: 'start' },
      { text: i18nLocal.t('table.tag'), value: 'tags', align: 'start' },
      { text: i18nLocal.t('table.last_modified'), value: 'lastModified', align: 'start' },
      { text: i18nLocal.t('table.recommend'), value: 'recomment', align: 'start', width: 120 },
      { text: i18nLocal.t('table.published'), value: 'enabled', align: 'start', width: 90 },
      { text: '', value: 'action', align: 'center', width: 20, sortable: false },
    ];
    if (props.item?.registry && !props.item.registry.online) {
      items.splice(8, 0, { text: i18nLocal.t('table.auth'), value: 'auth', align: 'start', width: 90 });
    }
    return items;
  });

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      getModelList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  let pagination: Pagination<AIModel> = reactive<Pagination<AIModel>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      framework: null,
      license: null,
      task: null,
    },
  });

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const getModelList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    params.request = Object.assign(params.request, useQuery().value);
    const data: Pagination<AIModel> = await useAdminAiModelPagination(
      new AIModel({ source: props.item.name }),
      params.page,
      params.size,
      params.search,
      params.request,
    );
    pagination = Object.assign(pagination, data);
  };

  const filters: ComputedRef<any[]> = computed(() => {
    return [{ text: i18nLocal.t('filter.search'), value: 'search', items: [] }].concat(conditions.value);
  });
  const query = useQuery();
  watch(
    () => query.value.search,
    async (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== null) {
        pagination.request.search = newValue;
        getModelList();
      } else {
        pagination.search = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.license,
    async (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== null) {
        pagination.request.license = newValue;
        getModelList();
      } else {
        pagination.request.license = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.framework,
    async (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== null) {
        pagination.request.framework = newValue;
        getModelList();
      } else {
        pagination.request.framework = '';
      }
    },
    {
      deep: true,
    },
  );
  watch(
    () => query.value.task,
    async (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== null) {
        pagination.request.task = newValue;
        getModelList();
      } else {
        pagination.request.task = '';
      }
    },
    {
      deep: true,
    },
  );

  const conditions = ref([]);
  const generateFilter = async (): Promise<void> => {
    const data = await new AIModelRegistry({ name: routeParams.value.name }).getSelector();
    conditions.value.push({
      text: i18nLocal.t('filter.framework'),
      value: 'framework',
      items: data.frameworks.map((d) => {
        return { text: d, value: d, parent: 'framework' };
      }),
    });
    conditions.value.push({
      text: 'License',
      value: 'license',
      items: data.licenses.map((d) => {
        return { text: d, value: d, parent: 'license' };
      }),
    });
    conditions.value.push({
      text: i18nLocal.t('filter.task'),
      value: 'task',
      items: data.tasks.map((d) => {
        return { text: d, value: d, parent: 'task' };
      }),
    });
  };

  onMounted(() => {
    generateFilter();
  });

  const selectedModelList = ref<AIModel[]>([]);
  const toggleSelectAll = (params: { items: AIModel[]; value: boolean }): void => {
    if (params.value) {
      selectedModelList.value = deepCopy(params.items);
    } else {
      selectedModelList.value = [];
    }
  };
  const selected = (params: { item: AIModel; value: boolean }): void => {
    const index = selectedModelList.value.findIndex((u) => {
      return u.name === params.item.name;
    });
    if (params.value) {
      if (index === -1) selectedModelList.value.push(params.item);
    } else {
      if (index > -1) selectedModelList.value.splice(index, 1);
    }
  };

  const toModelDetail = (item: AIModel): void => {
    router.push({
      name: 'modelstore-detail',
      params: { name: item.name },
      query: {
        registry: routeParams.value.name,
        online: props.item.online.toString(),
      },
    });
  };

  const recommend = ref(null);
  const recommendModel = (item: AIModel): void => {
    recommend.value.init(item);
    recommend.value.open();
  };

  const recommendContent = ref(null);
  const recommendContentModel = (item: AIModel): void => {
    recommendContent.value.init(item);
    recommendContent.value.open();
  };

  const tag = ref(null);
  const tagModel = (item: AIModel): void => {
    tag.value.init(item);
    tag.value.open();
  };

  const removeModel = (item: AIModel): void => {
    store.commit('SET_CONFIRM', {
      title: `${i18n.t('operate.delete')} ${i18nLocal.t('tab.ai_model')}`,
      content: {
        text: `${i18n.t('operate.delete')} ${i18nLocal.t('tab.ai_model')} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        await new AIModel({ source: param.item.source, name: param.item.name }).deleteModelByAdmin();
        getModelList();
      },
    });
  };

  const setTokenStatus = (item: AIModel, status: boolean): void => {
    store.commit('SET_CONFIRM', {
      title: `${i18nLocal.t('operate.cancel_auth_flag')}`,
      content: {
        text: `${i18nLocal.t('operate.cancel_auth_flag_c', [`${i18nLocal.t('tab.ai_model')} ${item.name}`])}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        const data = deepCopy(param.item);
        if (!data.annotations) {
          data.annotations = {};
        }
        data.annotations['modelx.kubegems.io/token-required'] = status.toString();
        await new AIModel(data).updateModelByAdmin();
        getModelList();
      },
    });
  };

  const togglePublishModel = (item: AIModel): void => {
    store.commit('SET_CONFIRM', {
      title: item.enabled
        ? `${i18nLocal.t('operate.offline')} ${i18nLocal.t('tab.ai_model')}`
        : `${i18nLocal.t('operate.online')} ${i18nLocal.t('tab.ai_model')}`,
      content: {
        text: item.enabled
          ? `${i18nLocal.t('operate.offline')} ${i18nLocal.t('tab.ai_model')} ${item.name}`
          : `${i18nLocal.t('operate.online')} ${i18nLocal.t('tab.ai_model')} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        const data = deepCopy(param.item);
        data.enabled = !data.enabled;
        await new AIModel(data).updateModelByAdmin();
        getModelList();
      },
    });
  };

  const batchOperateModel = (online = true): void => {
    if (selectedModelList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18nLocal.t('tab.ai_model')]),
        color: 'warning',
      });
      return;
    }
    const resources: string[] = selectedModelList.value.map((c: AIModel) => c.name);
    store.commit('SET_CONFIRM', {
      title: online
        ? `${i18n.t('operate.batch')} ${i18nLocal.t('operate.online')} ${i18nLocal.t('tab.ai_model')}`
        : `${i18n.t('operate.batch')} ${i18nLocal.t('operate.offline')} ${i18nLocal.t('tab.ai_model')}`,
      content: {
        text: `${resources.join(',')}`,
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
        tip: online ? `${i18nLocal.t('operate.online')}` : `${i18nLocal.t('operate.offline')}`,
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in selectedModelList.value) {
          const model = selectedModelList.value[index];
          try {
            model.enabled = online;
            await new AIModel(model).updateModelByAdmin();
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: false,
            });
          }
        }
        getModelList();
      },
    });
  };
</script>
