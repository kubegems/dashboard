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

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      chips?: any;
      color?: string;
      count?: number;
      delimiter?: string;
      emptyText?: string;
      id?: string;
      itemText?: string;
      itemValue?: string;
      icon?: string;
      maxWidth?: string;
      minWidth?: string;
      singleLine?: boolean;
    }>(),
    {
      chips: [],
      color: 'success',
      count: 1,
      delimiter: '',
      emptyText: '-',
      id: '',
      itemText: 'text',
      itemValue: 'value',
      icon: undefined,
      maxWidth: undefined,
      minWidth: undefined,
      singleLine: false,
    },
  );

  const dataType = ref<string>('');
  const items = ref([]);
  const visibleItems = ref([]);
  const handleSetItems = (): void => {
    if (Array.isArray(props.chips)) {
      items.value = props.chips.map((item) => {
        if (typeof item === 'object') {
          return { ...item };
        } else {
          return {
            [props.itemText]: item,
            [props.itemValue]: item,
          };
        }
      });
      dataType.value = 'array';
    } else if (typeof props.chips === 'string') {
      const arr = Array.from(new Set(props.chips.split(props.delimiter)));
      items.value = arr.map((v) => {
        return {
          [props.itemText]: v,
          [props.itemValue]: v,
        };
      });
      dataType.value = 'string';
    } else {
      items.value = Object.keys(props.chips || {}).map((key) => {
        return {
          [props.itemText]: props.chips[key],
          [props.itemValue]: key,
        };
      });
      dataType.value = 'object';
    }
    visibleItems.value = items.value.slice(0, props.count);
  };

  watch(
    () => props.chips,
    async (newValue) => {
      if (!newValue) return;
      handleSetItems();
    },
    { immediate: true },
  );
</script>

<style lang="scss" scoped>
  .collapse {
    position: relative;

    &__chip {
      word-break: break-all;
    }
  }
</style>
