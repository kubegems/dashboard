<template>
  <v-card
    :elevation="expand ? 3 : 0"
    class="pa-3"
  >
    <div class="d-flex">
      <v-btn
        color="primary"
        text
        @click="onSwitchExpand"
      >
        查询<v-icon right>mdi-chevron-{{ expand ? 'up' : 'down' }}</v-icon>
      </v-btn>

      <v-combobox
        v-model="alertname"
        solo
        flat
        dense
        hide-details
        @keydown.enter="onSearch"
        @change="onEmitChange"
      >
        <template #prepend-inner>
          <v-chip
            v-for="(value, key) in tagMap"
            v-show="tagMap[key]"
            :key="key"
            color="primary"
            small
            label
          >
            <span>{{ labels[key].text }}：{{ getItemText(key, value) }}</span>
            <v-icon
              right
              small
              @click="onRemoveTag(key)"
            >
              mdi-close
            </v-icon>
          </v-chip>
        </template>
        <template #selection="{ item }">
          <v-chip
            color="primary"
            small
            label
          >
            <span>告警名称：{{ item }}</span>
            <v-icon
              right
              small
              @click="onRemoveTag('alertname')"
            >
              mdi-close
            </v-icon>
          </v-chip>
        </template>
      </v-combobox>

      <v-btn
        color="primary"
        text
        class="ml-4"
        @click="onSearch"
      >
        <v-icon left>mdi-magnify</v-icon>
        运行
      </v-btn>
    </div>

    <div
      v-show="expand"
      class="mt-3"
    >
      <div class="tags__header">
        <span>选择标签：</span>
        <v-btn
          v-for="tag in tags"
          :key="tag.value"
          x-small
          label
          :outlined="!tagCols.includes(tag.value)"
          class="mr-2"
          color="primary"
          :disabled="!tag.items.length"
          @click="onSwitchCol(tag)"
        >
          {{ tag.text }}({{ tag.items.length }})
        </v-btn>
      </div>

      <v-row class="ma-0">
        <v-col
          v-for="col in tagCols"
          :key="col"
          cols="2"
          class="tags__col"
        >
          <v-chip
            color="primary"
            small
            class="mb-4"
          >
            {{ labels[col].text }}
          </v-chip>
          <ul class="tags__list">
            <li
              v-for="item in labels[col].items"
              :key="item.value"
              class="mb-2"
            >
              <span
                class="tags__item"
                :class="{ 'tags__item--selected': tagMap[col] && tagMap[col] === item.value }"
                @click="onSwitchTag(col, item)"
              >{{ item.text }}</span>
            </li>
          </ul>
        </v-col>
      </v-row>

      <div class="text-right">
        <v-btn
          color="error"
          text
          @click="onClear"
        >
          清空
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getSystemConfigData, getProjectList, getProjectEnvironmentList } from '@/api'

export default {
  name: 'HistorySearch',
  props: {
    value: {
      type: Object,
      default: undefined,
    },
    cluster: {
      type: Number,
      default: undefined,
    },
  },
  data () {
    this.cache = {
      namespace: {},
    }

    return {
      expand: false,
      labels: {
        project: {
          text: '项目',
          items: [],
        },
        namespace: {
          text: '环境',
          items: [],
        },
        resource: {
          text: '资源',
          items: [],
        },
        rule: {
          text: '规则',
          items: [],
        },
        status: {
          text: '状态',
          items: [
            { text: 'firing', value: 'firing' },
            { text: 'resolved', value: 'resolved' },
          ],
        },
      },
      tagCols: [],
      tagMap: {},
      alertname: undefined,
      projectList: [],
      metricsConfig: {},
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport']),
    tags () {
      return Object.keys(this.labels).map(key => ({
        text: this.labels[key].text,
        items: this.labels[key].items,
        value: key,
      }))
    },
  },
  watch: {
    cluster () {
      this.onClear()
      this.setProjectItems()
    },
    value: {
      handler (newValue) {
        const v = newValue || {}
        this.tagMap = {
          project: v.project,
          namespace: v.namespace,
          resource: v.resource,
          rule: v.rule,
          status: v.status,
        }
        this.alertname = v.alertname
        this.tagCols = Object.keys(this.tagMap).filter(key => !!this.tagMap[key]).map(key => key)
        if (v.project) this.onProjectChange(v.project, false)
      },
      immediate: true,
      deep: true,
    },
  },
  mounted () {
    this.getMonitorConfig()
    this.getProjectList()
  },
  methods: {
    onSwitchExpand () {
      this.expand = !this.expand
    },
    onSwitchCol (col) {
      if (this.tagCols.includes(col.value)) {
        this.tagCols = this.tagCols.filter(item => item !== col.value)
      } else {
        this.tagCols.push(col.value)
      }
    },
    onSwitchTag (key, tag) {
      if (!this.tagMap[key] || this.tagMap[key] && this.tagMap[key] !== tag.value) {
        this.$set(this.tagMap, key, tag.value)
      } else {
        this.$delete(this.tagMap, key)
      }
      // if (key === 'project') this.onProjectChange(tag.value)
      if (key === 'resource') this.onResourceChange(tag.value)
      this.onEmitChange()
    },
    onRemoveTag (key) {
      this.$delete(this.tagMap, key)
      this.tagCols = this.tagCols.filter(item => item !== key)
      if (key === 'project') {
        this.tagCols = this.tagCols.filter(item => item !== 'namespace')
        this.$delete(this.tagMap, 'namespace')
        this.$set(this.labels.namespace, 'items', [])
      }
      if (key === 'resource') {
        this.tagCols = this.tagCols.filter(item => item !== 'rule')
        this.$delete(this.tagMap, 'rule')
        this.$set(this.labels.rule, 'items', [])
      }
      if (key === 'alertname') this.alertname = undefined
      this.onEmitChange()
    },
    onClear () {
      this.tagCols = []
      this.tagMap = {}
      this.onProjectChange()
      this.onResourceChange()
      this.onEmitChange()
    },
    format2value () {
      const value = {}
      Object.keys(this.tagMap).forEach(key => {
        value[key] = this.tagMap[key]
      })
      value.alertname = this.alertname
      return value
    },
    onEmitChange () {
      const value = this.format2value()
      this.$emit('input', value)
      this.$emit('change', value)
    },
    getItemText (key, value) {
      const item = this.labels[key].items.find(it => it.value === value)
      return item ? item.text : ''
    },
    onResourceChange (value, deleteRule = true) {
      let items = []
      if (this.tagMap.resource) {
        const rules = this.metricsConfig.resources[value].rules || {}
        items = Object.keys(rules).map(key => ({
          text: rules[key].showName,
          value: key,
        }))
      } else {
        this.tagCols = this.tagCols.filter(item => item !== 'rule')
      }
      if (deleteRule) this.$delete(this.tagMap, 'rule')
      this.$set(this.labels.rule, 'items', items)
    },
    onSearch () {
      this.expand = false
      this.$emit('search', this.format2value())
    },
    setProjectItems () {
      const items = this.projectList.filter(
        (pro) => !this.cluster || pro.environments.some((env) => env.ClusterID === this.cluster),
      )
      this.$set(this.labels.project, 'items', items)
    },
    async onProjectChange (value, deleteNamespace = true) {
      let items = []
      if (this.tagMap.project) {
        if (!this.cache.namespace[value]) {
          const data = await getProjectEnvironmentList(value, { noprocessing: true })
          this.cache.namespace[value] = data.List.map(item => ({
            text: item.EnvironmentName,
            value: item.Namespace,
            ClusterID: item.ClusterID,
          }))
        }
        items = this.cache.namespace[value].filter((pro) => !this.cluster || pro.ClusterID === this.cluster)
      } else {
        this.tagCols = this.tagCols.filter(item => item !== 'namespace')
      }
      if (deleteNamespace) this.$delete(this.tagMap, 'namespace')
      this.$set(this.labels.namespace, 'items', items)
    },
    async getMonitorConfig () {
      const data = await getSystemConfigData('Monitor')
      const config = data.content
      this.$set(this.labels.resource, 'items', Object.keys(config.resources).map(key => ({
        text: config.resources[key].showName,
        value: key,
      })))
      this.metricsConfig = config
      if (this.tagMap.resource) this.onResourceChange(this.tagMap.resource, false)
    },
    async getProjectList () {
      const data = await getProjectList(this.Tenant().ID, { noprocessing: true })
      this.projectList = data.List.map((item) => ({
        value: item.ID.toString(),
        text: item.ProjectName,
        environments: item.Environments,
      }))
      this.setProjectItems()
    },
  },
}
</script>

<style lang="scss" scoped>
.tags {
  &__header {
    font-size: 14px;
    line-height: 24px;
    margin-bottom: 12px;
  }

  &__col {
    border-right: 1px solid rgba(200, 200, 200, 0.3);
  }

  &__list {
    list-style: none;
    padding-left: 0;
    height: 240px;
    overflow: auto;
  }

  &__item {
    background-color: #f0f4f7;
    white-space: nowrap;
    border-radius: 3px;
    padding: 0 8px;
    transition: background-color 0.5s ease;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #e0eaf0;
    }

    &--selected {
      background-color: #00bcd4 !important;
      color: white;
    }
  }
}
</style>
