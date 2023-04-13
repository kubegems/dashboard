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
  <div class="white rounded mt-3 pa-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <Markdown v-if="content" :content="content" />
    <div v-else class="text-center text-body-2 mt-12 kubegems__text">{{ i18n.t('data.no_data') }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { AIModel } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { ComputedRef, computed, ref, watch } from 'vue';

  import Markdown from './Markdown.vue';

  const props = withDefaults(
    defineProps<{
      item?: AIModel;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();

  const height: ComputedRef<number> = computed(() => {
    return parseInt(((window.innerHeight - 214) / store.state.Scale).toString());
  });

  const content = ref<string>('');
  const getModelContent = async (): Promise<void> => {
    const data = await new AIModel({ source: props.item.source, name: props.item.name }).getModelContent(props.item.v);
    content.value = data.intro || '';
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (newValue && newValue.source && newValue.name && newValue.v) {
        getModelContent();
      }
    },
    { immediate: true, deep: true },
  );
</script>
