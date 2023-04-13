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
  <div class="mt-3 white rounded pa-4">
    <template v-if="fileItems.length > 0">
      <div v-for="(item, index) in fileItems" :key="index" class="file text-subtitle-2 kubegems__text">
        <div class="float-left file__item">
          <v-icon color="primary">mdi-file</v-icon>
          {{ item.filename }}
        </div>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <div v-else class="text-center text-body-2 kubegems__text">{{ i18n.t('data.no_data') }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { AIModel } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      item?: AIModel;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();

  const fileItems = ref<{ filename: string; content: string }[]>([]);
  const getModelContent = async (): Promise<void> => {
    const data = await new AIModel({ source: props.item.source, name: props.item.name }).getModelContent(props.item.v);
    fileItems.value = data.files || [];
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      getModelContent();
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .file {
    line-height: 24px;
    font-size: 14px;

    &__size {
      width: 120px;
      text-align: center;
    }

    &__item {
      line-height: 25px;
    }
  }
</style>
