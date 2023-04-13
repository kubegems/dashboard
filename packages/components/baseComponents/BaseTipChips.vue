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
        <v-flex v-on="on" :class="{ 'mt-2': extensionIcon }">
          <div class="float-left">
            <v-icon v-if="icon && !extensionIcon" :color="color" left :small="small"> {{ icon }} </v-icon>
            <BaseLogo v-if="icon && extensionIcon" :icon-name="icon" class="mr-1" :mt="1"></BaseLogo>
          </div>
          <div class="float-left" :style="{ lineHeight: extensionIcon ? '30px' : '24px' }" v-if="showLength">
            {{ items.length }}
          </div>
          <div class="kubegems__clear-float" />
        </v-flex>
      </template>

      <v-card class="pa-2" flat>
        <template v-if="singleLine">
          <div v-for="item in items" :key="item[itemValue]">
            <v-flex
              v-if="icon && !extensionIcon"
              :class="{ 'ma-1': true, 'text-caption': true, kubegems__text: true, kubegems__pointer: linked }"
              small
            >
              <v-icon :color="color" left small> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object'" class="mr-1">
                {{ item[itemValue] }}
              </strong>
              <slot :item="item">{{ item[itemText] }}</slot>
            </v-flex>
            <v-flex
              v-if="icon && extensionIcon"
              :class="{ 'ma-1': true, 'text-caption': true, kubegems__text: true, kubegems__pointer: linked }"
              small
            >
              <div class="float-left">
                <BaseLogo :icon-name="icon" class="mr-1" width="16"></BaseLogo>
              </div>
              <div class="float-left" v-if="showLength">
                <strong v-if="dataType === 'object'" class="mr-1">
                  {{ item[itemValue] }}
                </strong>
                <slot :item="item">{{ item[itemText] }}</slot>
              </div>
              <div class="kubegems__clear-float" />
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
      small?: boolean;
      showLength?: boolean;
      extensionIcon?: boolean;
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
      small: false,
      showLength: false,
      extensionIcon: false,
    },
  );

  const items = ref<{ [key: string]: any }[]>([]);
  const visibleItems = ref<{ [key: string]: any }[]>([]);
  const dataType = ref<string>('');
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
