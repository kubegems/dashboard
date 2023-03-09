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
  <v-sheet :width="width">
    <v-combobox
      ref="filter"
      v-model="combobox.conditions"
      chips
      class="filter__label"
      color="primary"
      dense
      flat
      full-width
      hide-details
      hide-selected
      :items="combobox.items"
      :label="i18n.t('filter.placehold')"
      multiple
      :no-data-text="i18n.t('data.no_data')"
      prepend-inner-icon="mdi-magnify"
      :search-input.sync="combobox.filterText"
      solo
      @blur="filterConditionBlurd"
      @change="filterConditionChanged"
      @focus="filterConditionFocusd"
      @keydown.enter="contructFilterTextCondition"
    >
      <template #selection="{ item, selected }">
        <v-chip
          v-if="item && item.text && (item.items.length > 0 || item.text.indexOf(':') > -1)"
          close
          close-icon="mdi-close-circle"
          color="primary"
          :input-value="selected"
          label
          small
          @click:close="filterConditionChanged(item, 'delete')"
        >
          <span class="pr-2">{{ item.text }}</span>
        </v-chip>
        <span v-else-if="item.text && item.text.length > 0" class="text-body-1 font-weight-medium">
          {{ item.text }}:
        </span>
      </template>
    </v-combobox>
  </v-sheet>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';

  import { useRoute, useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { deepCopy } from '@/utils/helpers';

  const props = withDefaults(
    defineProps<{
      default?: any;
      filters?: any[];
      width?: number;
    }>(),
    {
      default: undefined,
      filters: undefined,
      width: 700,
    },
  );

  const i18n = useGlobalI18n();
  const query = useQuery();
  const router = useRouter();
  const route = useRoute();

  const combobox = reactive({
    conditions: [],
    items: [],
    filterText: '',
  });

  const init = (): void => {
    combobox.conditions = [];
    const params = query.value;
    const filters = deepCopy(props.filters);
    // 生成键值对
    for (const key in params) {
      if (params[key]) {
        const condition = filters.find((c) => {
          return c.value === key;
        });
        if (condition !== undefined && condition.text.length > 0) {
          condition.text = `${condition.text}:${params[key]}`;
          combobox.conditions.push(condition);
        }
      }
    }
  };

  const emit = defineEmits(['filter']);
  const filter = ref(null);
  const filterConditionChanged = async (
    item: { items: any[]; text: string; value: string; parent?: string },
    operator: string,
  ): Promise<void> => {
    if (operator === 'delete') {
      const index = combobox.conditions.findIndex((c) => {
        return c.value === item.value;
      });
      combobox.conditions.splice(index, 1);
      const params = constructQueryParams();
      await getFilterList(params);
      const timeout = setTimeout(() => {
        emit('filter');
        clearTimeout(timeout);
      }, 100);
      filter.value.blur();
    } else {
      const lastConditions = combobox.conditions.slice(-1);
      if (lastConditions.length === 0) return;
      const condition = lastConditions[0];
      if (Object.prototype.hasOwnProperty.call(condition, 'parent')) {
        const index = combobox.conditions.findIndex((c) => {
          return c.value === condition.parent;
        });
        if (index > -1 && combobox.conditions[index].text.length > 0) {
          combobox.conditions[index].text = `${combobox.conditions[index].text}:${condition.value}`;
        }
        combobox.conditions = combobox.conditions.slice(0, -1);
        resetFilterCondition();

        const params = constructQueryParams();
        await getFilterList(params);
        const timeout = setTimeout(() => {
          emit('filter');
          clearTimeout(timeout);
        }, 100);
        filter.value.blur();
      } else {
        combobox.items = condition.items;
      }
    }
  };

  const contructFilterTextCondition = async (): Promise<void> => {
    if (combobox.filterText === '' || combobox.filterText === null) return;
    let lastConditions = combobox.conditions.slice(-1);
    if (lastConditions.length === 0) {
      if (props.default) lastConditions = [props.default];
      else return;
    }
    const condition = lastConditions[0];
    if (condition.text && condition.text.indexOf(':') > -1) {
      combobox.filterText = '';
      return;
    }
    if (condition.text && condition.text.length === 0) {
      combobox.filterText = '';
      return;
    }
    if (typeof condition === 'string') {
      combobox.filterText = '';
      return;
    }
    condition.text = `${condition.text}:${combobox.filterText}`;
    const index = combobox.conditions.findIndex((c) => {
      return c.value === condition.value;
    });
    combobox.conditions.splice(index, 1);
    combobox.conditions.push(condition);
    resetFilterCondition();

    const params = constructQueryParams();
    await getFilterList(params);
    const timeout = setTimeout(() => {
      emit('filter');
      clearTimeout(timeout);
    }, 100);
    filter.value.blur();
  };

  const constructQueryParams = (): { [key: string]: any } => {
    const params = {};
    combobox.conditions.forEach((c) => {
      if (c.text) {
        const kv = c.text.split(':');
        params[c.value] = kv[1];
      }
    });
    const defaultParams = {};
    combobox.items.forEach((i) => {
      defaultParams[i.value] = null;
    });
    return Object.assign(defaultParams, params);
  };

  const filterConditionBlurd = (): void => {
    resetFilterCondition();
  };

  const filterConditionFocusd = (): void => {
    resetFilterCondition();
  };

  const resetFilterCondition = (): void => {
    if (combobox.conditions === undefined) combobox.conditions = [];
    const conditions = [];
    combobox.conditions.forEach((c) => {
      if (c.text && c.text.indexOf(':') > -1) conditions.push(c);
    });
    combobox.conditions = conditions;
    combobox.items = deepCopy(props.filters);
    combobox.filterText = '';
  };

  const getFilterList = async (params): Promise<void> => {
    // 处理多tab列表
    const tab = query.value.tab || null;
    await router.replace({
      params: route.params,
      name: route.name,
      query: Object.assign({ tab: tab, ...query.value, ...{ page: 1 } }, params),
    });
  };

  watch(
    () => props.filters,
    async (newValue) => {
      if (!newValue) return;
      init();
    },
    { deep: true },
  );

  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      init();
    },
    { deep: true, immediate: true },
  );
</script>

<style lang="scss" scoped>
  .filter {
    &__label {
      font-weight: 500;
    }
  }
</style>
