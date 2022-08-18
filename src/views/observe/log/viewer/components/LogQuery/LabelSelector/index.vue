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
  <div class="label-select">
    <div class="label-select__header">
      <v-row>
        <v-col v-for="tag in tags" :key="tag.key" cols="2">
          <v-btn
            class="mr-2"
            color="primary"
            :disabled="!tag.children.length"
            label
            min-width="100px"
            :outlined="!selectedMap[tag.key]"
            small
            @click="handleClickTag(tag)"
          >
            {{ tag.key }}({{ tag.children.length }})
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div v-if="tags.length === 0" class="pt-2 kubegems__text text-body-2"> {{ $root.$t('data.no_data') }} </div>

    <v-row class="ma-0">
      <v-col
        v-for="(col, index) in cols"
        :key="col.key"
        :class="`${index !== cols.length - 1 ? 'label-select__col' : ''}`"
        cols="2"
      >
        <template v-if="!!selectedMap[col.key]">
          <div class="d-flex justify-content-between">
            <v-chip color="primary" small>
              {{ col.key }}({{ selectedMap[col.key].length }}/{{ col.children.length }})
            </v-chip>
            <v-text-field
              v-if="col.children.length >= 5"
              v-model="cols[index].search"
              class="label-select__search"
              clearable
              color="primary"
              dense
              flat
              hide-details
              label="搜索"
              solo
            />
          </div>

          <ul class="label-select__list">
            <li v-for="item in col.children" v-show="!col.search || item.includes(col.search)" :key="item" class="mt-2">
              <span
                class="label-select__item"
                :class="{
                  'label-select__item--selected': selectedMap[col.key] && selectedMap[col.key].includes(item),
                }"
                @click="handleClickChip(col.key, item)"
              >
                <EllipsisText :text="item" />
              </span>
            </li>
          </ul>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import EllipsisText from './EllipsisText';

  export default {
    name: 'LabelSelector',
    components: {
      EllipsisText,
    },
    props: {
      series: {
        type: Array,
        default: () => [],
      },
      value: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        selectedMap: {},
        tags: [],
        layer: [],
        keyArr: ['app', 'pod', 'container', 'stream', 'node', 'image'],
      };
    },
    computed: {
      ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
      cols() {
        return this.tags;
      },
    },
    watch: {
      value: {
        handler(newValue) {
          this.selectedMap = newValue;
          if (JSON.stringify(this.selectedMap) === '{}') {
            this.layer = [];
          }
        },
        deep: true,
        immediate: true,
      },
      series() {
        this.handleSetTags();
      },
    },
    methods: {
      handleClickTag(tag) {
        if (this.selectedMap[tag.key]) {
          this.$delete(this.selectedMap, tag.key);
        } else {
          this.$set(this.selectedMap, tag.key, []);
        }
        this.handleEmit();
      },

      handleClickChip(key, value) {
        if (this.selectedMap[key]) {
          if (this.selectedMap[key].includes(value)) {
            this.$set(
              this.selectedMap,
              key,
              this.selectedMap[key].filter((v) => v !== value),
            );
          } else {
            this.$set(this.selectedMap, key, [...this.selectedMap[key], value]);
          }
        } else {
          this.$set(this.selectedMap, key, [value]);
        }
        const hasValue = Object.keys(this.selectedMap).some((k) => {
          return this.selectedMap[k].length > 0;
        });
        if (hasValue) {
          if (this.layer.length < 2 && !this.layer.includes(key)) {
            this.layer.push(key);
          }
        } else {
          this.layer = [];
        }
        this.handleSetTags();
        this.handleEmit();
      },
      handleSetTags() {
        const s = this.series || [];
        const tagMap = {};

        for (let i = 0, len = s.length; i < len; i++) {
          let flag = true;
          for (const key in this.selectedMap) {
            if (this.selectedMap[key]?.length === 0) {
              continue;
            }
            if (!this.selectedMap[key].includes(s[i][key])) {
              flag = false;
              break;
            }
          }
          for (const key in s[i]) {
            // 两级过滤判断
            if (!flag) {
              if (this.layer && this.layer[0] === key) {
                //
              } else if (
                this.layer.length > 1 &&
                this.layer[1] === key &&
                this.selectedMap[this.layer[0]].includes(s[i][this.layer[0]])
              ) {
                //
              } else {
                continue;
              }
            }

            if (!this.keyArr.includes(key)) continue;
            if (!tagMap[key]) {
              tagMap[key] = {};
            }
            tagMap[key][s[i][key]] = 1;
          }
        }
        const labels = Object.keys(tagMap);
        const orderLabels = this.keyArr.filter((k) => {
          return labels.includes(k);
        });
        this.tags = orderLabels.map((key) => {
          return {
            key,
            search: '',
            children: Object.keys(tagMap[key]),
          };
        });
      },
      handleCheckSeriesItemIsHidden(item) {
        let contain = true;
        Object.keys(this.selectedMap).forEach((k) => {
          if (!item[k]) {
            contain = false;
            return;
          }
          if (this.selectedMap[k].length && !this.selectedMap[k].includes(item[k])) {
            contain = false;
          }
        });
        return contain;
      },

      handleEmit() {
        this.$emit('change', this.selectedMap);
        this.$emit('input', this.selectedMap);
      },
      clear() {
        this.selectedMap = {};
        this.handleEmit();
        this.$router.replace({
          name: this.$route.name,
        });
      },

      // handleRefresh () {

      // },
    },
  };
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
