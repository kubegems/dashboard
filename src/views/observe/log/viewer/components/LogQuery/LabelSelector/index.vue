<template>
  <div class="label-select">
    <div class="label-select__header">
      <v-row>
        <v-col
          v-for="tag in tags"
          :key="tag.key"
          cols="2"
        >
          <v-btn
            small
            label
            :outlined="!selectedMap[tag.key]"
            class="mr-2"
            color="primary"
            :disabled="!tag.children.length"
            min-width="100px"
            @click="handleClickTag(tag)"
          >
            {{ tag.key }}({{ tag.children.length }})
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div
      v-if="tags.length === 0"
      class="pt-2 kubegems__detail text-body-2"
    >
      暂无可选标签
    </div>

    <v-row class="ma-0">
      <v-col
        v-for="(col, index) in cols"
        :key="col.key"
        cols="2"
        :class="`${ index !== cols.length-1 ? 'label-select__col' : '' }`"
      >
        <template v-if="!!selectedMap[col.key]">
          <div class="d-flex justify-content-between">
            <v-chip
              color="primary"
              small
            >
              {{ col.key }}({{ selectedMap[col.key].length }}/{{ col.children.length }})
            </v-chip>
            <v-text-field
              v-if="col.children.length >= 5"
              v-model="cols[index].search"
              solo
              dense
              hide-details
              flat
              clearable
              color="primary"
              class="label-select__search"
              label="搜索"
            />
          </div>

          <ul class="label-select__list">
            <li
              v-for="item in col.children"
              v-show="!col.search || item.includes(col.search)"
              :key="item"
              class="mt-2"
            >
              <span
                class="label-select__item"
                :class="{ 'label-select__item--selected': selectedMap[col.key] && selectedMap[col.key].includes(item) }"
                @click="handleClickChip(col.key, item)"
              >
                <EllipsisText :text="item" />
              </span>
            </li>
          </ul>
        </template>
      </v-col>
    </v-row>

    <div class="text-right">
      <v-btn
        small
        bottom
        text
        color="error"
        @click="handleClear"
      >
        清空
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import EllipsisText from './EllipsisText'

export default {
  name: 'LabelSelector',
  components: {
    EllipsisText,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    series: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      selectedMap: {},
      tags: [],
    }
  },
  computed: {
    ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
    ...mapGetters(['Tenant']),
    cols () {
      return this.tags
    },
  },
  watch: {
    value: {
      handler (newValue) {
        this.selectedMap = newValue
      },
      deep: true,
      immediate: true,
    },
    series () {
      this.handleSetTags()
    },
  },
  methods: {
    handleClickTag (tag) {
      if (this.selectedMap[tag.key]) {
        this.$delete(this.selectedMap, tag.key)
      } else {
        this.$set(this.selectedMap, tag.key, [])
      }
      this.handleEmit()
    },

    handleClickChip (key, value) {
      if (this.selectedMap[key]) {
        if (this.selectedMap[key].includes(value)) {
          this.$set(this.selectedMap, key, this.selectedMap[key].filter(v => v !== value))
        } else {
          this.$set(this.selectedMap, key, [...this.selectedMap[key], value])
        }
      } else {
        this.$set(this.selectedMap, key, [value])
      }
      this.handleEmit()
    },
    handleSetTags () {
      const keyArr = ['app', 'pod', 'container', 'host', 'stream', 'image']
      const s = this.series || []
      const tagMap = {}
      for (let i = 0, len = s.length; i < len; i++) {
        for (const key in s[i]) {
          if (!keyArr.includes(key)) continue
          if (!tagMap[key]) {
            tagMap[key] = {}
          }
          tagMap[key][s[i][key]] = 1
        }
      }
      const labels = Object.keys(tagMap)
      this.tags = labels.map(key => {
        return {
          key,
          search: '',
          children: Object.keys(tagMap[key]),
        }
      })
    },

    // eslint-disable-next-line vue/no-unused-properties
    handleCheckSeriesItemIsHidden (item) {
      let contain = true
      Object.keys(this.selectedMap).forEach(k => {
        if (!item[k]) {
          contain = false
          return
        }
        if (this.selectedMap[k].length && !this.selectedMap[k].includes(item[k])) {
          contain = false
        }
      })
      return contain
    },

    handleEmit () {
      this.$emit('change', this.selectedMap)
      this.$emit('input', this.selectedMap)
    },

    handleClear () {
      this.selectedMap = {}
      this.handleEmit()
      this.$router.replace({
        name: this.$route.name,
      })
    },

    // handleRefresh () {

    // },
  },
}
</script>

<style lang="scss" scoped>
.label-select {
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
    display: inline-block;
    max-width: 100%;
    padding: 0 8px;
    background-color: #f0f4f7;
    border-radius: 3px;
    font-size: 14px;
    white-space: nowrap;
    transition: background-color 0.5s ease;
    cursor: pointer;

    &:hover {
      background-color: #e0eaf0;
    }

    &--selected {
      background-color: #00bcd4 !important;
      color: white;
    }
  }

  &__search {
    width: 1px;
    margin-left: 24px;

    ::v-deep {
      .v-input__control {
        min-height: 24px !important;
      }
    }
  }
}
</style>
