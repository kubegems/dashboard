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
  <div id="model__store" class="card" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <v-row v-scroll:#model__store="_.debounce(scrolled, 50)" class="mt-0">
      <v-col v-for="(item, index) in pagination.items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto card__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item class="mb-5" three-line>
              <v-list-item-avatar size="80" tile>
                <BaseLogo default-logo="model" :icon-name="query.registry" :ml="0" :width="60" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-subtitle-1 mb-3 card__title">
                  <a @click="toModelDetail(item)">{{ item.name }}</a>
                  <v-icon v-if="item.recomment >= 80" color="error">mdi-fire</v-icon>
                </v-list-item-title>

                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  {{ i18n.t('resource.type') }} : {{ item.task }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  {{ i18nLocal.t('tip.last_update_at') }} :
                  {{ item.lastModified ? moment(item.lastModified).format('lll') : i18n.t('data.unknown') }}
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  v-if="item.downloads > -1 || item.likes > -1"
                  class="text-body-2 text--lighten-4 card__desc"
                >
                  <v-icon v-if="item.downloads > -1" color="grey" small>mdi-download</v-icon>
                  {{ beautifyFloatNum(item.downloads) }}
                  <span class="mx-2" />
                  <v-icon v-if="item.likes > -1" color="orange" small>mdi-heart</v-icon>
                  {{ beautifyFloatNum(item.likes || 0, 0) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions class="pl-4 pr-2 py-0 mb-2" :style="{ position: 'absolute', bottom: '0', width: '100%' }">
              <div>
                <v-rating
                  background-color="orange lighten-3"
                  color="orange"
                  dense
                  half-increments
                  readonly
                  small
                  :value="item.rating ? item.rating.rating : 0"
                />
              </div>
              <v-spacer />
              <v-btn color="primary" small text @click="toModelDetail(item)"> {{ i18n.t('operate.detail') }} </v-btn>
            </v-card-actions>

            <v-flex v-if="item.recommentContent" class="card__watermark-bg" />
            <v-flex
              v-if="item.recommentContent"
              :class="`${store.state.Locale === 'en' ? 'card__watermark-en' : 'card__watermark'} font-weight-medium`"
            >
              {{ i18nLocal.t('tip.recommend') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <div v-if="state.loading" class="my-3 py-2 text-center card__scroll__loading">
      <BaseDropProgress />
    </div>

    <v-btn
      v-if="offsetTop"
      bottom
      class="card__top"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="goToTop"
    >
      <v-icon>mdi-chevron-double-up</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
  import { useAiModelPagination } from '@kubegems/api/hooks/ai_model';
  import { AIModel, AIModelRegistry } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import _ from 'lodash';
  import moment from 'moment';
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      registry?: AIModelRegistry;
    }>(),
    {
      registry: undefined,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();

  const height: ComputedRef<number> = computed(() => {
    return parseInt(((window.innerHeight - 148) / store.state.Scale).toString());
  });

  let pagination: Pagination<AIModel> = reactive<Pagination<AIModel>>({
    page: 1,
    size: 28,
    pageCount: 0,
    items: [],
  });

  const getModelStoreList = async (search: { [key: string]: string } = {}, append = false): Promise<void> => {
    let queryParams = { ...query.value, ...search };
    if (append) {
      queryParams = { ...queryParams, noprocessing: 'true' };
    }
    const data: Pagination<AIModel> = await useAiModelPagination(
      new AIModel({ source: query.value.registry }),
      pagination.page,
      pagination.size,
      '',
      queryParams,
    );
    if (append) {
      pagination.items = pagination.items.concat(data.items);
    } else {
      pagination = Object.assign(pagination, data);
    }
    router.replace({ query: { ...query.value, ...search } });
  };

  const search = (s: string): void => {
    getModelStoreList({ search: s, page: '1' });
  };

  const filter = (filter: { [key: string]: string }): void => {
    getModelStoreList({ ...filter, page: '1' });
  };

  defineExpose({
    search,
    filter,
  });

  const toModelDetail = (item: AIModel) => {
    router.push({
      name: 'modelstore-detail',
      params: {
        name: item.name,
      },
      query: {
        registry: props.registry.name,
        online: props.registry.online.toString(),
      },
    });
  };

  const beautifyFloatNum = (num: number, decimal = 1): string => {
    let result = num;
    const units = ['', 'K', 'M'];
    for (const index in units) {
      if (Math.abs(result) < 1000.0) {
        return `${result.toFixed(decimal)} ${units[index]}`;
      }
      result /= 1000.0;
    }
    return `${result.toFixed(decimal)} Yi`;
  };

  const offsetTop = ref<number>(0);
  const state = reactive({
    loading: false,
  });
  const scrolled = async (e): Promise<void> => {
    offsetTop.value = e.target.scrollTop;
    if (e.target.scrollTop + document.getElementById('model__store').clientHeight >= e.target.scrollHeight - 1) {
      pagination.page += 1;
      if (pagination.pageCount < pagination.page) return;
      state.loading = true;
      await getModelStoreList({}, true);
      state.loading = false;
    }
  };

  const goToTop = () => {
    const container = document.getElementById('model__store');
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  watch(
    () => props.registry,
    async (newValue) => {
      if (!newValue) return;
      pagination.items = [];
      pagination.pageCount = 0;
      pagination.page = 1;
      getModelStoreList();
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .card {
    position: relative;

    &__desc {
      line-height: 24px;
    }

    &__title {
      word-break: break-word;
      white-space: break-spaces;
      font-weight: bold;
      min-height: 38px;
      max-height: 57px;
    }

    &__top {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 105px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 10px;
      right: 7px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__watermark-en {
      position: absolute;
      top: 14px;
      right: 0;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
