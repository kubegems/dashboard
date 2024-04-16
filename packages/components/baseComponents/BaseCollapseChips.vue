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
    <div v-if="visibleItems.length === 0" :class="{ [`mb-${emptyLineSpace}`]: emptyLineSpace > 0 }">
      {{ emptyText }}
    </div>

    <v-menu
      v-if="items.length"
      :close-delay="200"
      :close-on-content-click="false"
      :disabled="items.length <= showLength"
      max-height="350px"
      :max-width="maxWidth"
      :min-width="minWidth"
      open-on-hover
    >
      <template #activator="{ on }">
        <v-flex v-on="on">
          <!-- <v-chip v-for="item in visibleItems" :key="item[itemValue]" class="mr-2 my-1" :color="color" small>
            <v-icon v-if="icon" left small> {{ icon }} </v-icon>
            <strong v-if="dataType === 'object'" class="mr-1"> {{ item[itemValue] }} </strong>
            <slot :item="item">{{ item[itemText] }}</slot>
          </v-chip> -->

          <div v-for="(item, index) in visibleItems" :key="index" class="mr-2 my-1">
            <div class="success white--text float-left collapse__right text-caption pr-2">
              <div
                :class="`${color} pl-2 pr-1 mr-1 collapse__front ${
                  collapse ? 'collapse__collapse' : ''
                } collapse__icon float-left`"
                :style="{ maxWidth: collapse ? `${collapse - 50}px` : '' }"
              >
                <v-icon v-if="icon" class="mr-1" color="white" small> {{ icon }} </v-icon>
                <strong v-if="dataType === 'object' || forceShow" class="mr-1"> {{ item[itemValue] }} </strong>
              </div>
              <slot :item="item">
                <strong> {{ item[itemText] }} </strong>
                <slot name="action" />
              </slot>
              <div class="kubegems__clear-float" />
            </div>
            <div class="kubegems__clear-float" />
          </div>

          <div
            v-if="items.length > 1 && !all"
            :class="`${color} white--text collapse__left collapse__right text-caption px-2 float-left`"
          >
            <strong>+ {{ items.length - 1 }}</strong>
          </div>
        </v-flex>
      </template>

      <v-card v-if="!all" class="pa-2" flat>
        <template v-if="singleLine">
          <div v-for="(item, index) in items" :key="index">
            <v-flex class="ma-1 text-caption kubegems__text collapse__chip" small>
              <v-icon v-if="icon" :color="color" left small> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object' || forceShow" class="mr-1"> {{ item[itemValue] }} </strong>
              <slot :item="item">{{ item[itemText] }}</slot>
            </v-flex>
          </div>
        </template>
        <template v-else>
          <v-chip v-for="(item, index) in items" :key="index" class="ma-1" :color="color" small>
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
      collapse?: number;
      showLength?: number;
      forceShow?: boolean;
      emptyLineSpace?: number;
      all?: boolean;
    }>(),
    {
      chips: [],
      color: 'primary',
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
      collapse: 0,
      showLength: 1,
      forceShow: false,
      emptyLineSpace: 0,
      all: false,
    },
  );

  const dataType = ref<string>('');
  const items = ref<any>([]);
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
    visibleItems.value = props.all ? items.value.slice() : items.value.slice(0, props.count);
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

    &__front {
      border-radius: 20px;
    }

    &__left {
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      line-height: 22px;
    }

    &__right {
      border-radius: 20px;
      line-height: 22px;
      max-width: 435px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: auto;
    }

    &__collapse {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }

    &__icon {
      padding-top: 0;
      padding-bottom: 0;
      line-height: 22px;
    }
  }
</style>
