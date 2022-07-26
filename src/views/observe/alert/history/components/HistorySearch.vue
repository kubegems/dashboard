<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-card class="pa-3" :elevation="expand ? 3 : 0">
    <div class="d-flex">
      <v-btn color="primary" text @click="onSwitchExpand">
        查询<v-icon right>mdi-chevron-{{ expand ? 'up' : 'down' }}</v-icon>
      </v-btn>

      <v-combobox
        v-model="search"
        dense
        flat
        hide-details
        label="模糊搜索规则和标签(多个关键字请用空格分割)"
        solo
        @change="onEmitChange"
        @keydown.enter="onSearch"
      >
        <template #prepend-inner>
          <v-chip v-for="(value, key) in tagMap" v-show="tagMap[key]" :key="key" color="primary" label small>
            <span>{{ labels[key].text }}：{{ getItemText(key, value) }}</span>
            <v-icon right small @click="onRemoveTag(key)"> mdi-close </v-icon>
          </v-chip>
        </template>
        <template #selection="{ item }">
          <v-chip color="primary" label small>
            <span>告警：{{ item }}</span>
            <v-icon right small @click="onRemoveTag('search')"> mdi-close </v-icon>
          </v-chip>
        </template>
      </v-combobox>

      <v-btn class="ml-4" color="primary" text @click="onSearch">
        <v-icon left>mdi-magnify</v-icon>
        运行
      </v-btn>
    </div>

    <div v-show="expand" class="mt-3">
      <div class="tags__header">
        <span>选择标签：</span>
        <v-btn
          v-for="tag in tags"
          :key="tag.value"
          class="mr-2"
          color="primary"
          :disabled="!tag.items.length"
          label
          :outlined="!tagCols.includes(tag.value)"
          x-small
          @click="onSwitchCol(tag)"
        >
          {{ tag.text }}({{ tag.items.length }})
        </v-btn>
      </div>

      <v-row class="ma-0">
        <v-col v-for="col in tagCols" :key="col" class="tags__col" cols="2">
          <v-chip class="mb-4" color="primary" small>
            {{ labels[col].text }}
          </v-chip>
          <ul class="tags__list">
            <li v-for="item in labels[col].items" :key="item.value" class="mb-2">
              <span
                class="tags__item"
                :class="{ 'tags__item--selected': tagMap[col] && tagMap[col] === item.value }"
                @click="onSwitchTag(col, item)"
                >{{ item.text }}</span
              >
            </li>
          </ul>
        </v-col>
      </v-row>

      <div class="text-right">
        <v-btn color="error" text @click="onClear"> 清空 </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getSystemConfigData } from '@/api';

  export default {
    name: 'HistorySearch',
    props: {
      cluster: {
        type: String,
        default: undefined,
      },
      value: {
        type: Object,
        default: undefined,
      },
    },
    data() {
      return {
        expand: false,
        labels: {
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
        search: undefined,
        metricsConfig: {},
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport']),
      tags() {
        return Object.keys(this.labels).map((key) => ({
          text: this.labels[key].text,
          items: this.labels[key].items,
          value: key,
        }));
      },
    },
    watch: {
      cluster: {
        handler() {
          this.onClear();
        },
        deep: true,
      },
      value: {
        handler(newValue) {
          const v = newValue || {};
          this.tagMap = {
            resource: v.resource,
            rule: v.rule,
            status: v.status,
          };
          this.search = v.search;
          this.tagCols = Object.keys(this.tagMap)
            .filter((key) => !!this.tagMap[key])
            .map((key) => key);
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.getMonitorConfig();
    },
    methods: {
      onSwitchExpand() {
        this.expand = !this.expand;
      },
      onSwitchCol(col) {
        if (this.tagCols.includes(col.value)) {
          this.tagCols = this.tagCols.filter((item) => item !== col.value);
        } else {
          this.tagCols.push(col.value);
        }
      },
      onSwitchTag(key, tag) {
        if (!this.tagMap[key] || (this.tagMap[key] && this.tagMap[key] !== tag.value)) {
          this.$set(this.tagMap, key, tag.value);
        } else {
          this.$delete(this.tagMap, key);
        }
        if (key === 'resource') this.onResourceChange(tag.value);
        this.onEmitChange();
      },
      onRemoveTag(key) {
        this.$delete(this.tagMap, key);
        this.tagCols = this.tagCols.filter((item) => item !== key);
        if (key === 'resource') {
          this.tagCols = this.tagCols.filter((item) => item !== 'rule');
          this.$delete(this.tagMap, 'rule');
          this.$set(this.labels.rule, 'items', []);
        }
        if (key === 'search') this.search = undefined;
        this.onEmitChange();
      },
      onClear() {
        this.tagCols = [];
        this.tagMap = {};
        this.onResourceChange();
        this.onEmitChange();
      },
      format2value() {
        const value = {};
        Object.keys(this.tagMap).forEach((key) => {
          value[key] = this.tagMap[key];
        });
        value.search = this.search;
        return value;
      },
      onEmitChange() {
        const value = this.format2value();
        this.$emit('input', value);
        this.$emit('change', value);
      },
      getItemText(key, value) {
        const item = this.labels[key].items.find((it) => it.value === value);
        return item ? item.text : '';
      },
      onResourceChange(value, deleteRule = true) {
        let items = [];
        if (this.tagMap.resource) {
          const rules = this.metricsConfig.resources[value].rules || {};
          items = Object.keys(rules).map((key) => ({
            text: rules[key].showName,
            value: key,
          }));
        } else {
          this.tagCols = this.tagCols.filter((item) => item !== 'rule');
        }
        if (deleteRule) this.$delete(this.tagMap, 'rule');
        this.$set(this.labels.rule, 'items', items);
      },
      onSearch() {
        this.expand = false;
        const value = this.format2value();
        this.$emit('input', value);
        this.$emit('change', value);
        const timeout = setTimeout(() => {
          this.$emit('search');
          clearTimeout(timeout);
        }, 100);
      },
      async getMonitorConfig() {
        const data = await getSystemConfigData('Monitor');
        const config = data.content;
        this.$set(
          this.labels.resource,
          'items',
          Object.keys(config.resources).map((key) => ({
            text: config.resources[key].showName,
            value: key,
          })),
        );
        this.metricsConfig = config;
        if (this.tagMap.resource) this.onResourceChange(this.tagMap.resource, false);
      },
    },
  };
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
