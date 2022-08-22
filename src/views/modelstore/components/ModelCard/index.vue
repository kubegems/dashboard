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
    <v-row v-scroll:#model__store="$_.debounce(onScroll, 50)" class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto card__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar size="80" tile>
                <BaseLogo icon-name="ai-model" :ml="0" :width="60" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-subtitle-1 mb-3 card__title">
                  <a @click="modelDetail(item)">{{ item.name }}</a>
                  <v-icon v-if="item.recomment >= 80" color="error">mdi-fire</v-icon>
                </v-list-item-title>

                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  {{ $root.$t('resource.type') }} : {{ item.task }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  {{ $t('tip.last_update_at') }} :
                  {{ item.lastModified ? $moment(item.lastModified).format('lll') : $root.$t('data.unknown') }}
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
            <v-card-actions class="pl-4 pr-2 py-0 mb-2">
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
              <v-btn color="primary" small text @click="modelDetail(item)"> {{ $root.$t('operate.detail') }} </v-btn>
            </v-card-actions>

            <v-flex v-if="item.recommentContent" class="card__watermark-bg" />
            <v-flex v-if="item.recommentContent" class="card__watermark font-weight-medium">
              {{ $t('tip.recommend') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <div v-if="loading" class="my-3 py-2 text-center card__scroll__loading">
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

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getModelStoreList } from '@/api';

  export default {
    name: 'ModelCard',
    i18n: {
      messages: messages,
    },
    props: {
      registry: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 28,
        },
        offsetTop: 0,
        loading: false,
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    watch: {
      registry: {
        handler(newValue) {
          if (newValue) {
            this.items = [];
            this.pageCount = 0;
            this.page = 1;
            this.modelStoreList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelStoreList(search = {}, append = false) {
        let queryParams = { ...this.params, ...this.$route.query, ...search };
        if (append) {
          queryParams = { ...queryParams, noprocessing: true };
        }
        const data = await getModelStoreList(this.registry.name, queryParams);
        if (append) {
          this.items = this.items.concat(data.list);
        } else {
          this.items = data.list;
        }
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({ query: { ...this.$route.query, ...search } });
      },
      search(s) {
        this.modelStoreList({ search: s, page: 1 });
      },
      filter(filter) {
        this.modelStoreList({ ...filter, page: 1 });
      },
      modelDetail(item) {
        this.$router.push({
          name: 'modelstore-detail',
          params: {
            name: item.name,
          },
          query: {
            registry: this.registry.name,
            online: this.registry.online,
          },
        });
      },
      beautifyFloatNum(num, decimal = 1) {
        let result = num;
        const units = ['', 'K', 'M'];
        for (const index in units) {
          if (Math.abs(result) < 1000.0) {
            return `${result.toFixed(decimal)} ${units[index]}`;
          }
          result /= 1000.0;
        }
        return `${result.toFixed(decimal)} Yi`;
      },
      async onScroll(e) {
        this.offsetTop = e.target.scrollTop;
        if (e.target.scrollTop + document.getElementById('model__store').clientHeight >= e.target.scrollHeight - 1) {
          this.params.page += 1;
          if (this.pageCount < this.params.page) return;
          this.loading = true;
          await this.modelStoreList({}, true);
          this.loading = false;
        }
      },
      goToTop() {
        const container = document.getElementById('model__store');
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
    },
  };
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
  }
</style>
