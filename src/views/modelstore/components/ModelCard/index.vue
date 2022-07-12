<template>
  <div class="card">
    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar size="80" tile>
                <BaseLogo icon-name="ai-model" :ml="0" :width="60" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-subtitle-1 mb-3 card__title">
                  <a @click="modelDetail(item)">{{ item.name }}</a>
                </v-list-item-title>

                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  类型： {{ item.framework }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  更新时间： {{ $moment(item.updationTime).format('lll') }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="item.downloads > -1" class="text-body-2 text--lighten-4 card__desc">
                  下载量： {{ beautifyFloatNum(item.downloads) }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="item.likes > -1" class="text-body-2 text--lighten-4 card__desc">
                  热度： {{ beautifyFloatNum(item.likes || 0) }} <v-icon color="orange" small>mdi-heart</v-icon>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions class="pl-0 py-0">
              <v-list-item>
                <v-list-item-content class="py-0">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4">
                    <v-rating
                      background-color="orange lighten-3"
                      color="orange"
                      dense
                      half-increments
                      readonly
                      small
                      :value="item.rating.rating"
                    />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-spacer />
              <v-btn color="primary" small text @click="modelDetail(item)"> 详情 </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
      <v-col v-if="false" class="pt-0 pb-3" cols="3">
        <v-card class="kubegems__full-height" flat min-height="227">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addModel">
                  <v-icon left>mdi-plus-box</v-icon>
                  添加模型
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="modelStoreList"
    />

    <AddModel ref="addModel" />
  </div>
</template>

<script>
  import AddModel from './AddModel';
  import { getModelStoreList } from '@/api';

  export default {
    name: 'ModelCard',
    components: {
      AddModel,
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
          size: 16,
        },
      };
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
      async modelStoreList(search = {}) {
        const data = await getModelStoreList(this.registry.name, { ...this.params, ...this.$route.query, ...search });
        this.items = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({ query: { ...this.$route.query, ...search } });
      },
      search(s) {
        this.modelStoreList({ search: s });
      },
      filter(filter) {
        this.modelStoreList(filter);
      },
      modelDetail(item) {
        this.$router.push({
          name: 'modelstore-detail',
          params: {
            name: item.name,
          },
          query: {
            registry: this.registry.name,
            images: this.registry.images,
          },
        });
      },
      addModel() {
        this.$refs.addModel.open();
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
      height: 38px;
    }
  }
</style>
