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
  <div class="d-inline-block">
    <!-- 无数据显示 -->
    <span v-if="visibleItems.length === 0">{{ emptyText }}</span>

    <v-menu
      v-if="items.length"
      :close-delay="200"
      :close-on-content-click="false"
      :disabled="items.length === 0"
      :max-width="maxWidth"
      open-on-hover
    >
      <template #activator="{ on }">
        <v-flex v-on="on">
          <v-icon v-if="icon" :color="color" left> {{ icon }} </v-icon>
        </v-flex>
      </template>

      <v-card class="pa-2" flat>
        <template v-if="singleLine">
          <div v-for="item in items" :key="item[itemValue]">
            <v-flex
              :class="{ 'ma-1': true, 'text-caption': true, kubegems__text: true, kubegems__pointer: linked }"
              small
            >
              <v-icon v-if="icon" :color="color" left small> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object'" class="mr-1">
                {{ item[itemValue] }}
              </strong>
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
    name: 'BaseTipChips',
    props: {
      chips: {
        type: [Array, Object, String],
        default: () => [],
      },
      color: {
        type: String,
        default: 'success',
      },
      delimiter: {
        type: String,
        default: ',',
      },
      emptyText: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: undefined,
      },
      itemText: {
        type: String,
        default: 'text',
      },
      itemValue: {
        type: String,
        default: 'value',
      },
      linked: {
        type: Boolean,
        default: () => false,
      },
      maxWidth: {
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
        this.visibleItems = this.items;
      },
      // linkToPage() {
      //   this.$emit('linkToPage');
      // },
    },
  };
</script>
