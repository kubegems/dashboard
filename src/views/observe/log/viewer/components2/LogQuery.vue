<template>
  <v-card
    :elevation="expand ? 3 : 0"
    class="pa-3"
  >
    <div class="d-flex ">
      <v-btn
        color="primary"
        text
        @click="handleExpand"
      >
        查询
        <v-icon>mdi-chevron-{{ expand ? 'up' : 'down' }}</v-icon>
      </v-btn>

      <!-- 标签查询 -->
      <v-combobox
        v-if="queryType === 'tag'"
        v-model="filter"
        solo
        flat
        dense
        hide-details
        @keydown.enter.native="search"
      >
        <template #prepend-inner>
          <v-chip
            v-for="tag in comboboxTags"
            :key="tag.text + tag.value"
            color="primary"
            small
            label
          >
            <span>{{ tag.text }}:{{ tag.value }}</span>
            <v-icon
              right
              small
              @click="handleRemoveTag(tag.text, tag.value)"
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
            <span>正则：{{ item }}</span>
            <v-icon
              right
              small
              @click="handleRemoveRegexp"
            >
              mdi-close
            </v-icon>
          </v-chip>
        </template>
      </v-combobox>
      <!-- 标签查询 -->

      <div>
        <v-btn
          color="primary"
          text
          @click="search"
        >
          <v-icon left>mdi-magnify</v-icon>
          运行
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="handleSaveSnapshot"
        >
          <v-icon left>mdi-content-save</v-icon>
          保存
        </v-btn>
        <v-btn
          v-if="queryType === 'tag'"
          color="primary"
          text
          :disabled="disabled"
          @click="handleHistory"
        >
          <v-icon left>mdi-history</v-icon>
          历史
        </v-btn>
      </div>
    </div>

    <div
      v-show="expand"
      class="mt-3"
    >
      <LogLabelSelector
        v-if="queryType === 'tag'"
        v-model="selected"
        :cluster="cluster.text"
        :series="series"
      />
    </div>

    <p>{{ logQL }}</p>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getLogLabels } from '@/api'
import LogLabelSelector from './LogLabelSelector.vue'

export default {
  name: 'LogLabelQuery',
  components: {
    LogLabelSelector,
  },
  props: {
    cluster: {
      type: Object,
      default: () => ({}),
    },
    series: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    this.LABEL_CLUSTER_KEY = process.env.VUE_APP_LOG_LABEL_CLUSTER_KEY

    return {
      expand: false,
      queryType: 'tag',
      selected: {},
      disabled: false,
      regexp: undefined,
      logLabels: [],
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
    comboboxTags () {
      const tags = []
      Object.keys(this.selected).forEach(k => {
        this.selected[k].forEach(v => {
          tags.push({ text: k, value: v })
        })
      })
      return tags
    },
    logQL () {
      const tenant = !this.AdminViewport && this.logLabels.includes('tenant') ? `,tenant="${this.Tenant().TenantName}"` : ''

      if (this.queryType === 'tag') {
        const obj = this.selected || {}
        const keys = Object.keys(obj).filter(k => obj[k] && obj[k].length)
        const match = keys.reduce((pre, key) => pre + `,${key}="${obj[key].join('|')}"`, '')
        const regexp = this.regexp ? ` |~ \`${this.regexp}\`` : ''
        return `{${this.LABEL_CLUSTER_KEY}="${this.cluster.text}"${tenant}${match}}${regexp}`
      } else {
        return ''
      }
    },
  },
  watch: {
    cluster () {
      this.getLogLabels()
    },
  },
  methods: {
    async getLogLabels () {
      const data = await getLogLabels(this.cluster.text, {
        start: Date.now() - 7 * 24 * 60 * 60 * 1000 + '000000',
        end: Date.now() + '000000',
        noprocessing: true,
      }) || []
      this.logLabels = data
    },

    handleExpand () {
      this.expand = !this.expand
    },

    handleRemoveRegexp () {
      this.regexp = undefined
    },

    handleRemoveTag (key, value) {
      this.$set(this.selected, key, this.selected[key].filter(v => v !== value))
    },

    handleSaveSnapshot () {
      this.$emit('saveSnapshot')
    },

    handleHistory () {
      this.$emit('showHistroy')
    },

    // eslint-disable-next-line vue/no-unused-properties
    handleParseLabel (input) {
      const labelMatchArr = input.match(new RegExp('{(.*)}'))
      if (labelMatchArr && labelMatchArr.length > 1) {
        const labelArr = labelMatchArr[1].split(',')
        const labelValueObj = {}
        labelArr.forEach((item) => {
          if (item.indexOf('=~') !== -1) {
            const label = item.split('=~')[0]
            labelValueObj[label] = item
              .split('=~')[1]
              .match(new RegExp('"(.*)"'))[1]
              .split('|')
          } else {
            const label = item.split('=')[0]
            labelValueObj[label] = [
              item.split('=')[1].match(new RegExp('"(.*)"'))[1],
            ]
          }
        })
        return labelValueObj
      } else {
        return {}
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    handleParseFilter (input) {
      const filterList = []
      const matchedArr = input.match(new RegExp('{.*}(.*)'))
      if (matchedArr && matchedArr.length > 1) {
        const filterArr = matchedArr[1].trim().split('|~')
        filterArr.forEach((item) => {
          if (item !== '') {
            const match = item.match(new RegExp('`(.*)`'))
            if (match && match.length > 0) {
              filterList.push(match[1])
            }
          }
        })
      }
      return filterList
    },

    // eslint-disable-next-line vue/no-unused-properties
    getValuesByPathQuery () {
       this.$route.query.logQl
    },

    search () {
      // 保证logQL和regexp 获取到最新值
      this.$nextTick(() => {
        this.expand = false
        this.$emit('search', { logQL: this.logQL, regexp: this.regexp })
      })
    },

    // eslint-disable-next-line vue/no-unused-properties
    clear () {
      this.selected = {}
      this.regexp = undefined
    },

    // eslint-disable-next-line vue/no-unused-properties
    setSelectedValue (key, value, switchValue = false) {
      if (this.selected[key]) {
        if (this.selected[key].includes(value)) {
          switchValue && this.handleRemoveTag(key, value)
        } else {
          this.$set(this.selected, key, [...this.selected[key], value])
        }
      } else {
        this.$set(this.selected, key, [value])
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    setRegexp (value) {
      this.regexp = value
    },
  },
}
</script>
