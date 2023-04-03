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
  <div>
    <v-autocomplete
      v-model="command"
      hide-no-data
      hide-selected
      :items="commandItems"
      :label="i18nLocal.t('tip.run_command')"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      multiple
      :search-input.sync="commandText"
      @keydown.enter="createCommand"
    >
      <template #selection="{ item }">
        <v-chip
          class="my-1"
          close
          close-icon="mdi-close-circle"
          color="primary"
          small
          @click:close="removeCommand(item)"
        >
          <span class="mx-1">
            {{ item.text }}
          </span>
        </v-chip>
      </template>
    </v-autocomplete>
  </div>
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

  const commandItems = ref([]);
  const commandText = ref('');
  const command = ref([]);

  const emit = defineEmits(['input', 'change']);
  const createCommand = (): void => {
    if (!commandText.value) return;
    command.value.push(commandText.value);
    commandItems.value.push({
      text: commandText.value,
      value: commandText.value,
    });
    commandText.value = '';
    emit('input', command.value);
    emit('change', command.value);
  };

  const removeCommand = (item: { text: string; value: string }): void => {
    const index = command.value.findIndex((command) => {
      return command !== item.value;
    });
    if (index > -1) {
      command.value.splice(index, 1);
      emit('input', command.value);
      emit('change', command.value);
    }
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      command.value = newValue;
    },
    { immediate: true, deep: true },
  );
</script>
