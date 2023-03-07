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

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      chips?: any;
      color?: string;
      delimiter?: string;
      emptyText?: string;
      icon?: string;
      itemText?: string;
      itemValue?: string;
      linked?: boolean;
      maxWidth?: string;
      singleLine?: boolean;
    }>(),
    {
      chips: [],
      color: 'success',
      delimiter: '',
      emptyText: '',
      icon: undefined,
      itemText: 'text',
      itemValue: 'value',
      linked: false,
      maxWidth: undefined,
      singleLine: false,
    },
  );

  const items = ref<{ [key: string]: any }[]>([]);
  const visibleItems = ref<{ [key: string]: any }[]>([]);
  const dataType = ref<string>(undefined);
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
    visibleItems.value = items.value;
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
