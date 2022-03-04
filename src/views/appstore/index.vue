<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
            <span class="text-body-2 mt-1 mr-1">仓库</span>
            <v-menu
              v-model="repoMenu"
              bottom
              left
              offset-y
              origin="top center"
              transition="scale-transition"
              class="mx-1 px-1"
            >
              <template #activator="{ on }">
                <v-btn
                  text
                  color="white"
                  class="primary--text font-weight-medium"
                  v-on="on"
                >
                  {{ selectRepo }}
                  <v-icon
                    v-if="repoMenu"
                    right
                  >
                    fas fa-angle-up
                  </v-icon>
                  <v-icon
                    v-else
                    right
                  >
                    fas fa-angle-down
                  </v-icon>
                </v-btn>
              </template>
              <v-data-iterator
                :items="[{ text: '仓库', values: repos }]"
                hide-default-footer
                class="file-iterator"
              >
                <template #no-data>
                  <v-card>
                    <v-card-text> 暂无版本 </v-card-text>
                  </v-card>
                </template>
                <template #default="props">
                  <v-card
                    v-for="item in props.items"
                    :key="item.text"
                  >
                    <v-list dense>
                      <v-list-item
                        v-for="(repo, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center font-weight-medium"
                        link
                        :style="
                          repo === selectRepo
                            ? `color: #1e88e5 !important;`
                            : ``
                        "
                        @click="setRepo(repo)"
                      >
                        <v-list-item-content>
                          <span>{{ repo }}</span>
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
    </BaseBreadcrumb>
    <v-row
      lass="pt-0 mt-0"
      style="margin-top: 0;"
    >
      <v-col
        cols="2"
        class="pt-0"
      >
        <v-card>
          <v-card-text class="pa-0 pl-2 pb-2">
            <BaseSubTitle
              title="应用类型"
              :divider="false"
              class="mt-2 mb-1"
            />
            <v-text-field
              v-model="search"
              class="mr-4 my-2 ml-2"
              solo
              flat
              hide-details
              prepend-inner-icon="mdi-magnify"
              label="应用名称"
              @input="onAppNameInput"
            />
            <v-list v-show="showFilter">
              <v-list-item
                v-for="(type, index) in types"
                :key="index"
                class="pl-0"
              >
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
                  <v-chip
                    small
                    color="primary"
                    text-color="white"
                    class="ma-1 mt-n2"
                  >
                    {{ type.count }}
                  </v-chip>
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-row class="mt-2">
          <v-col
            v-for="(app, index) in items"
            :key="index"
            cols="3"
            class="pt-0"
          >
            <AppStoreCard
              :app="app"
              :select-repo="selectRepo"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getAppStoreList, getRepositoryList } from '@/api'
import AppStoreCard from './components/AppStoreCard'

export default {
  name: 'AppStoreCenter',
  components: { AppStoreCard },
  data: () => ({
    breadcrumb: {
      title: '应用商店',
      tip: '应用商店(helmChart)是一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等',
    },
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
    selectRepo: 'gemscloud',
    repoMenu: false,
  }),
  computed: {
    ...mapState(['Circular']),
    showFilter() {
      return this.chartsNum < 50
    },
  },
  mounted() {
    this.selectRepo = this.$route.query.reponame
      ? this.$route.query.reponame
      : 'gemscloud'
    this.appStoreList()
    this.repositoryList()
  },
  methods: {
    async appStoreList() {
      if (this.selectRepo === 'gemscloud') {
        this.params.reponame = ''
      } else {
        this.params.reponame = this.selectRepo
      }
      const data = await getAppStoreList(this.params)
      this.chartsNum = data.Total
      this.items = data.List
      this.all = data.List
      this.generatTypes()
    },
    setRepo(repo) {
      this.selectRepo = repo
      this.params.reponame = repo
      this.$router.replace({ query: { reponame: repo } })
      this.appStoreList()
    },
    async repositoryList() {
      const data = await getRepositoryList({ noprocessing: true })
      this.repos = data.map((repo) => {
        return repo.ChartRepoName
      })
      this.repos.unshift('gemscloud')
    },
    generatTypes() {
      this.types = []
      let keywords = []
      this.items.forEach((app) => {
        if (app.keywords) {
          keywords = keywords.concat(app.keywords)
        }
      })
      keywords.forEach((keyword) => {
        const t = this.types.find((t) => {
          return t.keyword === keyword
        })
        if (t) {
          t.count += 1
        } else {
          this.types.push({ keyword: keyword, count: 1, checked: false })
        }
      })
    },
    onAppNameInput() {
      if (this.search.length > 0) {
        const filterItems = []
        this.items.forEach((app) => {
          if (app.name.indexOf(this.search) > -1) {
            filterItems.push(app)
          }
        })
        this.items = filterItems
      } else {
        this.items = this.all
      }
      this.generatTypes()
    },
    onFilterTypeChange(type) {
      if (type.checked) {
        this.filterKeywords.push(type.keyword)
      } else {
        const index = this.filterKeywords.indexOf(type.keyword)
        this.filterKeywords.splice(index, 1)
      }

      if (this.filterKeywords.length > 0) {
        const filterItems = []
        this.items.forEach((app) => {
          if (app.keywords) {
            app.keywords.forEach((keyword) => {
              if (this.filterKeywords.indexOf(keyword) > -1) {
                if (
                  !filterItems.find((a) => {
                    return a.name === app.name
                  })
                ) {
                  filterItems.push(app)
                }
                return
              }
            })
          }
        })
        this.items = filterItems
      } else {
        this.items = this.all
      }
    },
  },
}
</script>
