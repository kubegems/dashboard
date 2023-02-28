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
    <Breadcrumb hub="kubegems-charts">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
            <span class="text-body-2 mr-1">{{ $t('tip.registry') }}</span>
            <v-menu
              v-model="repoMenu"
              bottom
              class="mx-1 px-1"
              left
              offset-y
              origin="top center"
              transition="scale-transition"
            >
              <template #activator="{ on }">
                <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
                  <BaseLogo class="mr-2" :icon-name="selectRepo" :ml="0" :style="{ marginTop: '6px' }" :width="16" />
                  {{ selectRepo }}
                  <v-icon v-if="repoMenu" right> mdi-chevron-up </v-icon>
                  <v-icon v-else right> mdi-chevron-down </v-icon>
                </v-btn>
              </template>
              <v-data-iterator
                class="file-iterator"
                hide-default-footer
                :items="[{ text: $t('tip.registry'), values: repos }]"
              >
                <template #no-data>
                  <v-card>
                    <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
                  </v-card>
                </template>
                <template #default="props">
                  <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
                    <v-list dense>
                      <v-flex class="text-subtitle-2 text-center ma-2">
                        <span>{{ $t('tip.registry') }}</span>
                      </v-flex>
                      <v-divider class="mx-2" />
                      <v-list-item
                        v-for="(repo, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center font-weight-medium mx-2"
                        link
                        :style="{ color: repo === selectRepo ? `#1e88e5 !important` : `` }"
                        @click="setRepo(repo)"
                      >
                        <v-list-item-content>
                          <div>
                            <div class="float-left mr-2">
                              <BaseLogo class="mr-2" :icon-name="repo" :ml="0" :mt="0" :width="16" />
                            </div>
                            <div class="float-left"> {{ repo }}</div>
                            <div class="kubegems__clear-float" />
                          </div>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </template>
              </v-data-iterator>
            </v-menu>
          </v-sheet>
        </v-flex>
      </template>
    </Breadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card :style="{ height: `${height}px`, overflowY: 'auto' }">
          <v-card-text class="pa-0 pl-2 pb-2">
            <BaseSubTitle
              class="pt-2 mb-1"
              :divider="false"
              :title="$root.$t('resource.app_c', [$root.$t('resource.type')])"
            />
            <v-text-field
              v-model="search"
              class="mr-4 my-2 ml-2"
              flat
              hide-details
              :label="$t('filter.name')"
              prepend-inner-icon="mdi-magnify"
              solo
              @input="onAppNameInput"
            />
            <v-list v-show="showFilter">
              <v-list-item v-for="(type, index) in types" :key="index" class="pl-0">
                <v-list-item-subtitle>
                  <v-checkbox
                    v-model="type.checked"
                    class="ml-2 mt-2"
                    dense
                    :label="type.keyword"
                    @change="onFilterTypeChange(type)"
                  />
                </v-list-item-subtitle>
                <v-flex class="float-right">
                  <v-chip class="ma-1 mt-n2" color="primary" small text-color="white">
                    {{ type.count }}
                  </v-chip>
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col id="app__store" class="pt-0" cols="10" :style="{ height: `${height}px`, overflowY: 'auto' }">
        <v-row v-scroll:#app__store="$_.debounce(onScroll, 50)" class="mt-0">
          <v-col v-for="(app, index) in items" :key="index" class="pt-0" cols="3">
            <AppStoreCard :app="app" :select-repo="selectRepo" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

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
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AppStoreCard from './components/AppStoreCard';
  import messages from './i18n';
  import { getAppStoreList, getRepositoryList } from '@/api';
  import Breadcrumb from '@/views/modelstore/components/Breadcrumb';

  export default {
    name: 'AppStoreCenter',
    i18n: {
      messages: messages,
    },
    components: {
      AppStoreCard,
      Breadcrumb,
    },
    data() {
      return {
        items: [],
        all: [],
        types: [],
        filterKeywords: [],
        search: '',
        params: {
          size: 1000,
          page: 1,
          reponame: '',
          sort: 'nameAsc',
        },
        repos: [],
        chartsNum: 0,
        selectRepo: 'kubegems',
        repoMenu: false,
        offsetTop: 0,
      };
    },
    computed: {
      ...mapState(['Circular', 'Scale']),
      showFilter() {
        return this.chartsNum < 50;
      },
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    mounted() {
      this.selectRepo = this.$route.query.reponame ? this.$route.query.reponame : 'kubegems';
      this.appStoreList();
      this.repositoryList();
    },
    methods: {
      async appStoreList() {
        if (this.selectRepo === 'kubegems') {
          this.params.reponame = '';
        } else {
          this.params.reponame = this.selectRepo;
        }
        const data = await getAppStoreList(this.params);
        this.chartsNum = data.total;
        this.items = data.list;
        this.all = data.list;
        this.generatTypes();
      },
      setRepo(repo) {
        if (repo !== this.selectRepo) {
          this.selectRepo = repo;
          this.params.reponame = repo;
          this.$router.replace({ query: { reponame: repo } });
          this.appStoreList();
        }
      },
      async repositoryList() {
        const data = await getRepositoryList({ noprocessing: true });
        this.repos = data.map((repo) => {
          return repo.ChartRepoName;
        });
        this.repos.unshift('kubegems');
      },
      generatTypes() {
        this.types = [];
        let keywords = [];
        this.items.forEach((app) => {
          if (app.keywords) {
            keywords = keywords.concat(app.keywords);
          }
        });
        keywords.forEach((keyword) => {
          const t = this.types.find((t) => {
            return t.keyword === keyword;
          });
          if (t) {
            t.count += 1;
          } else {
            this.types.push({ keyword: keyword, count: 1, checked: false });
          }
        });
      },
      onAppNameInput() {
        if (this.search.length > 0) {
          const filterItems = [];
          this.items.forEach((app) => {
            if (app.name.indexOf(this.search) > -1) {
              filterItems.push(app);
            }
          });
          this.items = filterItems;
        } else {
          this.items = this.all;
        }
        this.generatTypes();
      },
      onFilterTypeChange(type) {
        if (type.checked) {
          this.filterKeywords.push(type.keyword);
        } else {
          const index = this.filterKeywords.indexOf(type.keyword);
          this.filterKeywords.splice(index, 1);
        }

        if (this.filterKeywords.length > 0) {
          const filterItems = [];
          this.all.forEach((app) => {
            if (app.keywords) {
              app.keywords.forEach((keyword) => {
                if (this.filterKeywords.indexOf(keyword) > -1) {
                  if (
                    !filterItems.find((a) => {
                      return a.name === app.name;
                    })
                  ) {
                    filterItems.push(app);
                  }
                  return;
                }
              });
            }
          });
          this.items = filterItems;
        } else {
          this.items = this.all;
        }
      },
      onScroll(e) {
        this.offsetTop = e.target.scrollTop;
      },
      goToTop() {
        const container = document.getElementById('app__store');
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
    &__top {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }
  }
</style>
