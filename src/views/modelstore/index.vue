<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
            <v-btn
              text
              small
              color="white"
              class="primary--text"
              @click="addAiModel"
            >
              <v-icon
                left
                small
              >
                fas fa-boxes
              </v-icon>
              添加AI模型
            </v-btn>
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
              title="模型类型"
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
              label="模型名称"
              @input="onModelNameInput"
            />
            <v-list>
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
            v-for="(model, index) in items"
            :key="index"
            cols="3"
            class="pt-0"
          >
            <v-hover #default="{ hover }">
              <v-card
                class="mx-auto"
                height="100%"
                :elevation="hover ? 5 : 0"
              >
                <v-list-item three-line>
                  <v-list-item-avatar
                    tile
                    size="80"
                  >
                    <img
                      class="img"
                      src="/icon/ai-model.png"
                    />
                  </v-list-item-avatar>
                  <v-list-item-content class="kubegems__break-all">
                    <v-list-item-title class="text-h6 mb-1">
                      <a>{{ model.name }}</a>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 text--lighten-4">
                      描述：{{
                        model.description === '' ? '-' : model.description
                      }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-body-2 text--lighten-4">
                      仓库：{{
                        model.repository === '' ? '-' : model.repository
                      }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    text
                    small
                    color="primary"
                    @click="modelStoreDetail(model)"
                  >
                    详情
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <AddAiModel ref="addAiModel" />
  </v-container>
</template>

<script>
import AddAiModel from './components/AddAiModel'

export default {
  name: 'ModelStoreCenter',
  components: {
    AddAiModel,
  },
  data: () => ({
    items: [
      {
        id: 1,
        name: 'asr-speech-bokan-v2',
        description: 'asr bokan model',
        repository: '',
        keywords: ['asr', 'speech'],
      },
    ],
    all: [],
    types: [],
    search: '',
    filterKeywords: [],
  }),
  mounted() {
    this.modelStoreList()
  },
  methods: {
    async modelStoreList() {
      this.all = this.items
      this.generatTypes()
    },
    addAiModel() {
      this.$refs.addAiModel.open()
    },
    generatTypes() {
      this.types = []
      let keywords = []
      this.items.forEach((model) => {
        if (model.keywords) {
          keywords = keywords.concat(model.keywords)
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
    onModelNameInput() {
      if (this.search.length > 0) {
        const filterItems = []
        this.items.forEach((model) => {
          if (model.name.indexOf(this.search) > -1) {
            filterItems.push(model)
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
        this.items.forEach((model) => {
          if (model.keywords) {
            model.keywords.forEach((keyword) => {
              if (this.filterKeywords.indexOf(keyword) > -1) {
                if (
                  !filterItems.find((a) => {
                    return a.name === model.name
                  })
                ) {
                  filterItems.push(model)
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
    modelStoreDetail(model) {
      this.$router.push({
        name: 'modelstores-detail',
        params: { name: model.name },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.img {
  width: 60px;
  height: 60px;
  margin-left: 8px;
}
</style>
