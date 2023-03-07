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
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    >
      <template v-if="param.items && param.items.type === 'object'" #action>
        <v-btn class="mt-n1" color="primary" icon small @click="addItem">
          <v-icon small>mdi-plus-box</v-icon>
        </v-btn>
      </template>
    </BaseSubTitle>
    <template v-if="param.items && param.items.type === 'object'">
      <div v-for="(item, ii) in list" :id="`${id}-${ii}`" :key="`${id}-${ii}`" class="grey lighten-5 rounded ma-3 pa-2">
        <v-btn class="float-right" color="error" icon small @click="removeItem(item, `${param.path}/${item}`)">
          <v-icon small>mdi-close-box</v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
        <BaseParam
          v-for="(childrenParam, index) in retrieveFromSchema(appValues, param.items, `${param.path}/${item}/`)"
          :id="`${id}-${index}`"
          :key="`${id}-${index}`"
          :all-params="allParams"
          :app-values="appValues"
          class="my-0 mt-0"
          :cluster-name="clusterName"
          :param="childrenParam"
          v-bind="$attrs"
          v-on="$listeners"
        />
      </div>
    </template>
    <template v-else-if="param.items && Array.isArray(param.items)">
      <BaseSubTitle class="mb-4" color="grey lighten-3" :divider="false" :title="param.title || param.path">
        <template v-if="param.items && param.additionalItems" #action>
          <v-btn class="mt-n1" color="primary" icon small @click="addAdditionalItems">
            <v-icon small>mdi-plus-box</v-icon>
          </v-btn>
        </template>
      </BaseSubTitle>
      <template v-for="(childrenParam, iii) in param.items.concat(additionalItems)">
        <BaseParam
          v-for="(p, index) in retrieveFromSchema(
            appValues,
            {
              properties: {
                [iii]: {
                  ...childrenParam,
                  title: `${param.title}.${iii}`,
                  form: true,
                },
              },
            },
            `${param.path}/`,
          )"
          :id="`${id}-${index}`"
          :key="`${id}-${index}-${iii}`"
          :all-params="allParams"
          :allow-delete="iii > 0"
          :app-values="appValues"
          class="my-0 mt-0"
          :cluster-name="clusterName"
          :level="0"
          :param="p"
          v-bind="$attrs"
          v-on="$listeners"
          @removeItem="removeAdditionalItem"
        />
      </template>
    </template>
    <template v-else>
      <v-combobox
        v-model="state.selectedItems"
        :attach="`#${id}`"
        class="my-2"
        hide-selected
        :items="state.items"
        :label="pathLevel === 1 ? '' : label"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        multiple
        :search-input.sync="state.search"
        @change="changed($event)"
      >
        <template #no-data>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                {{ state.search }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <v-chip
            class="ma-1"
            close
            close-icon="mdi-close-circle"
            color="success"
            dense
            small
            @click:close="removeCommand(item)"
          >
            {{ item }}
          </v-chip>
        </template>
        <template #append-outer><v-flex :id="id" /></template>
      </v-combobox>
    </template>
  </v-flex>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, onMounted, reactive, ref } from 'vue';

  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { sleep } from '@/utils/helpers';
  import { retrieveFromSchema } from '@/utils/schema';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      appValues?: any;
      clusterName?: string;
      allParams?: any[];
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      appValues: {},
      clusterName: '',
      allParams: undefined,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string[]): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  const state = reactive({
    search: '',
    items: [],
    selectedItems: [],
  });
  const removeCommand = (item: { text: string; value: string }): void => {
    const tmp = state.selectedItems.filter((selectItem) => {
      return selectItem !== item;
    });
    state.selectedItems = tmp;
    emit('changeBasicFormParam', props.param, state.selectedItems);
  };

  const list = ref<number[]>([]);
  const addItem = (): void => {
    list.value.push(list.value.length);
  };

  const removeItem = async (index: number, path: string): Promise<void> => {
    emit('changeBasicFormParam', props.param, '', 'deleted', path);
    await sleep(100);
    list.value = list.value.map((item, i) => {
      if (i > index) {
        item -= 1;
      }
      return item;
    });
    list.value.splice(index, 1);
  };

  const additionalItems = ref<any>([]);
  const addAdditionalItems = async (): Promise<void> => {
    const len = props.param?.items?.concat(additionalItems.value)?.length;
    if (len < props.param?.minItems) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('ruler.lt_min_item', [props.param.minItems]),
        color: 'warning',
      });
      return;
    }
    if (len >= props.param?.maxItems) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('ruler.gt_max_item', [props.param.maxItems]),
        color: 'warning',
      });
      return;
    }
    emit('changeBasicFormParam', props.param, '', 'set', `${props.param.path}/${len}`);
    await sleep(100);
    additionalItems.value.push({ type: 'string' });
  };

  const removeAdditionalItem = async (path: string): Promise<void> => {
    const index = parseInt(path.substr(path.lastIndexOf('/') + 1));
    emit('changeBasicFormParam', props.param, '', 'deleted', path);
    await sleep(100);
    additionalItems.value.splice(index - 1, 1);
  };

  onMounted(() => {
    if (props.param.items && props.param.items.enum && props.param.items.enum.length > 0) {
      const enums = props.param.items.enum;
      // 去重
      state.items = [...new Set(enums)];
    }
    if (props.param.default && props.param.default.length > 0) {
      state.selectedItems = props.param.default;
    }
    if (props.param.items && Array.isArray(props.param.items)) return;
    changed(state.selectedItems);
  });
</script>
