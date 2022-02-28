<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="AI模型定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.Name"
            required
            label="模型名称"
            :rules="objRules.nameRules"
            :readonly="edit"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.Repository"
            required
            label="模型仓库"
            :rules="objRules.repositoryRules"
            :readonly="edit"
          />
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            v-model="obj.Keywords"
            :items="keywordsItems"
            :rules="objRules.keywordRules"
            multiple
            color="primary"
            label="模型关键字(回车)"
            hide-selected
            hide-no-data
            class="my-0"
            no-data-text="暂无可选数据"
            :search-input.sync="keywordText"
            @keyup.enter="createKeyword"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="mx-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="obj.Description"
            class="my-0"
            auto-grow
            required
            label="模型描述"
            :rules="objRules.descriptionRules"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { required } from '@/utils/rules'

export default {
  name: 'AiModelBaseForm',
  props: {
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    obj: {
      ID: 0,
      Name: '',
      Description: '',
      Repository: '',
      Keywords: [],
    },
    objRules: {
      nameRules: [required],
      repositoryRules: [required],
      descriptionRules: [
        required,
        (v) => !!(v && v.length >= 10) || '大于10字符',
      ],
      keywordRules: [required],
    },
    keywordsItems: [],
    keywordText: '',
  }),
  computed: {
    ...mapState(['Scale']),
  },
  methods: {
    createKeyword() {
      if (
        !this.keywordsItems.find((v) => {
          return v.value === this.keywordText
        })
      ) {
        this.keywordsItems.push({
          text: this.keywordText,
          value: this.keywordText,
        })
      }
      this.obj.Keywords.push(this.keywordText)
      this.keywordText = ''
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
      this.keywordsItems = []
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
