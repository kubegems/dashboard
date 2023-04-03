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
  <v-autocomplete
    v-model="args"
    hide-no-data
    hide-selected
    :items="argsItems"
    :label="i18nLocal.t('tip.params')"
    :menu-props="{
      bottom: true,
      left: true,
      origin: `top center`,
    }"
    multiple
    :search-input.sync="argsText"
    @keydown.enter="createArgs"
  >
    <template #selection="{ item }">
      <v-chip class="my-1" close close-icon="mdi-close-circle" color="primary" small @click:close="removeArgs(item)">
        <span class="mx-1">
          {{ item.text }}
        </span>
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';

  const props = withDefaults(
    defineProps<{
      value: any[];
    }>(),
    {
      value: undefined,
    },
  );

  const i18nLocal = useI18n();
  const argsItems = ref([]);
  const argsText = ref('');
  const args = ref([]);

  const emit = defineEmits(['input', 'change']);
  const createArgs = (): void => {
    if (!argsText.value) return;
    args.value.push(argsText.value);
    argsItems.value.push({
      text: argsText.value,
      value: argsText.value,
    });
    argsText.value = '';
    emit('input', args.value);
    emit('change', args.value);
  };

  const removeArgs = (item: { text: string; value: string }): void => {
    const index = args.value.findIndex((args) => {
      return args !== item.value;
    });
    if (index > -1) {
      args.value.splice(index, 1);
      emit('input', args.value);
      emit('change', args.value);
    }
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      args.value = newValue;
    },
    { immediate: true, deep: true },
  );
</script>
