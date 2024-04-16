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
  <BasePanel v-model="state.panel" icon="mdi-code-json" title="YAML" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3">
        {{ item && item.metadata ? item.metadata.name : '' }}
      </span>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <BaseACEEditor
          v-model="kubeyaml"
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')} rounded-0`"
          :height="`${height}px`"
          :lang="lang"
          :options="aceOptions"
          theme="chrome"
          @keydown.stop
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import yaml from 'js-yaml';
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  const store = useStore();

  const props = withDefaults(
    defineProps<{
      item?: any;
      lang?: string;
    }>(),
    {
      item: undefined,
      lang: 'yaml',
    },
  );

  const aceOptions = {
    tabSize: 2,
    fontSize: 12,
    printMarginColumn: 100,
    showPrintMargin: false,
    wrap: true,
    readOnly: true,
  };
  const height: ComputedRef<number> = computed(() => {
    return window.innerHeight - 64 * store.state.Scale - 1;
  });

  const kubeyaml = ref<string>('');
  watch(
    () => props.item,
    async (newValue) => {
      if (newValue) {
        kubeyaml.value = yaml.dump(newValue);
      }
    },
    {
      deep: true,
    },
  );

  const state = reactive({
    panel: false,
  });

  const open = (): void => {
    state.panel = true;
  };

  const dispose = (): void => {
    return;
  };

  defineExpose({
    open,
  });
</script>
