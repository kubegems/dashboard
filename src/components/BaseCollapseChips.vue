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
  <div :id="id" class="d-inline-block collapse">
    <!-- 无数据显示 -->
    <span v-if="visibleItems.length === 0">{{ emptyText }}</span>

    <v-menu
      v-if="items.length"
      :close-delay="200"
      :close-on-content-click="false"
      :disabled="items.length === 1"
      :max-width="maxWidth"
      :min-width="minWidth"
      open-on-hover
    >
      <template #activator="{ on }">
        <v-flex v-on="on">
          <v-chip v-for="item in visibleItems" :key="item[itemValue]" class="mr-2 my-1" :color="color" small>
            <v-icon v-if="icon" left small> {{ icon }} </v-icon>
            <strong v-if="dataType === 'object'" class="mr-1">
              {{ item[itemValue] }}
            </strong>
            <slot :item="item">{{ item[itemText] }}</slot>
          </v-chip>

          <v-chip v-if="items.length > 1" class="my-1" :color="color" small>
            <strong>+ {{ items.length - 1 }}</strong>
          </v-chip>
        </v-flex>
      </template>

      <v-card class="pa-2" flat>
        <template v-if="singleLine">
          <div v-for="item in items" :key="item[itemValue]">
            <v-flex class="ma-1 text-caption kubegems__text collapse__chip" small>
              <v-icon v-if="icon" :color="color" left small> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object'" class="mr-1"> {{ item[itemValue] }} </strong>
              <slot :item="item">{{ item[itemText] }}</slot>
            </v-flex>
          </div>
        </template>
        <template v-else>
          <v-chip v-for="item in items" :key="item[itemValue]" class="ma-1" :color="color" small>
            <slot :item="item">{{ item[itemText] }}</slot>
          </v-chip>
        </template>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'BaseCollapseChips',
    props: {
      chips: {
        type: [Array, Object, String],
        default: () => [],
      },
      color: {
        type: String,
        default: 'success',
      },
      count: {
        type: Number,
        default: 1,
      },
      delimiter: {
        type: String,
        default: ',',
      },
      emptyText: {
        type: String,
        default: '-',
      },
      id: {
        type: String,
        default: '',
      },
      itemText: {
        type: String,
        default: 'text',
      },
      icon: {
        type: String,
        default: undefined,
      },
      itemValue: {
        type: String,
        default: 'value',
      },
      maxWidth: {
        type: String,
        default: undefined,
      },
      minWidth: {
        type: String,
        default: undefined,
      },
      singleLine: Boolean,
    },
    data() {
      return {
        items: [],
        visibleItems: [],
        dataType: null,
      };
    },
    watch: {
      chips: {
        handler() {
          this.handleSetItems();
        },
        immediate: true,
      },
    },
    methods: {
      handleSetItems() {
        if (Array.isArray(this.chips)) {
          this.items = this.chips.map((item) => {
            if (typeof item === 'object') {
              return { ...item };
            } else {
              return {
                [this.itemText]: item,
                [this.itemValue]: item,
              };
            }
          });
          this.dataType = 'array';
        } else if (typeof this.chips === 'string') {
          const arr = Array.from(new Set(this.chips.split(this.delimiter)));
          this.items = arr.map((v) => {
            return {
              [this.itemText]: v,
              [this.itemValue]: v,
            };
          });
          this.dataType = 'string';
        } else {
          this.items = Object.keys(this.chips || {}).map((key) => {
            return {
              [this.itemText]: this.chips[key],
              [this.itemValue]: key,
            };
          });
          this.dataType = 'object';
        }
        this.visibleItems = this.items.slice(0, this.count);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .collapse {
    position: relative;

    &__chip {
      word-break: break-all;
    }
  }
</style>
