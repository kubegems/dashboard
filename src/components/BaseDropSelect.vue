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
  <v-menu
    v-model="state.menu"
    bottom
    close-on-click
    :close-on-content-click="false"
    max-height="450px"
    max-width="450px"
    min-width="275px"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div class="float-left">
        <v-btn class="mr-2 mt-1 font-weight-medium primary--text" color="white" dark depressed small v-on="on">
          {{ variable }} {{ showText() }}
          <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> {{ variable }} </div>
        <div class="float-right">
          <v-btn class="mx-1" color="primary" small @click="reset">{{ i18n.t('operate.reset') }}</v-btn>
          <v-btn class="ml-1" color="primary" small @click="confirm">
            {{ i18n.t('operate.confirm') }}
          </v-btn>
        </div>
        <div class="kubegems__clear-float" />
      </div>
      <div class="select__div" :style="{ width: '100%' }">
        <v-text-field
          v-model="searchText"
          class="mt-2"
          dense
          flat
          hide-details
          prepend-inner-icon="mdi-magnify"
          solo
          @keyup="search"
        />
        <div class="text-caption pa-1 mt-2">{{ variable }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group color="primary">
            <v-list-item v-for="(item, index) in variableItemsCopy" :key="item.value" dense>
              <v-list-item-action class="mx-2">
                <v-checkbox v-model="item.active" />
              </v-list-item-action>
              <v-list-item-content @click="selectItem(item, index)">
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.value }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="kubegems__clear-float" />
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useGlobalI18n } from '@/i18n';
  import { deepCopy } from '@/utils/helpers';

  const props = withDefaults(
    defineProps<{
      variable?: string;
      variableValues?: any[];
    }>(),
    {
      variable: '',
      variableValues: undefined,
    },
  );

  const i18n = useGlobalI18n();

  const state = reactive({
    menu: false,
  });

  const variableItems = ref([]);
  const variableItemsCopy = ref([]);

  const selectedItems: ComputedRef = computed(() => {
    return variableItems.value.filter((v) => {
      return v.active;
    });
  });

  const searchText = ref<string>('');
  const search = (): void => {
    if (searchText.value) {
      variableItemsCopy.value = variableItems.value.filter((v) => {
        return v.value.indexOf(searchText.value) > -1;
      });
    } else {
      variableItemsCopy.value = deepCopy(variableItems.value);
    }
  };

  const emit = defineEmits(['input', 'change']);
  const confirm = (): void => {
    variableItems.value = deepCopy(variableItemsCopy.value);
    const val = selectedItems.value.map((s) => {
      return s.value;
    });
    emit('input', val);
    emit('change', val);

    state.menu = false;
  };

  const reset = (): void => {
    variableItems.value.forEach((v, index) => {
      v.active = false;
      variableItems.value[index] = v;
    });
    variableItemsCopy.value = deepCopy(variableItems.value);
  };

  const showText = (): string => {
    if (selectedItems.value.length > 1) {
      return `${selectedItems.value[0].value} (+${selectedItems.value.length - 1})`;
    } else if (selectedItems.value.length > 0) {
      return `${selectedItems.value[0].value}`;
    }
    return i18n.t('tip.select_one_match').toString();
  };

  const selectItem = (item, index): void => {
    variableItemsCopy.value.forEach((item, index) => {
      item.active = false;
      variableItemsCopy.value[index] = item;
    });
    item.active = true;
    variableItemsCopy.value[index] = item;
  };

  watch(
    () => props.variableValues,
    async (newValue) => {
      if (!newValue) return;
      if (newValue?.length > 0) {
        const items = newValue.map((d) => {
          return {
            text: d,
            value: d,
            active: true,
          };
        });
        variableItems.value = deepCopy(items);
        variableItemsCopy.value = deepCopy(items);
      } else {
        variableItems.value = [];
        variableItemsCopy.value = [];
      }
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .select {
    &__div {
      float: left;
      width: 50%;
      padding: 8px;
    }

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 93%;
      max-height: 93%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;
      }
    }
  }
</style>
