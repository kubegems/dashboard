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
  <v-card>
    <v-card-text class="pa-0 pl-2 pb-2">
      <BaseSubTitle class="pt-2 mb-1" :divider="false" :title="i18nLocal.t('tip.ai_model')">
        <template #action>
          <span class="text-body-2 kubegems__text mr-2"> {{ i18nLocal.t('tip.model_count') }} : {{ modelCount }} </span>
        </template>
      </BaseSubTitle>
      <v-text-field
        v-model="search"
        class="mr-4 my-2 ml-2"
        flat
        hide-details
        :label="i18nLocal.t('filter.model_name')"
        prepend-inner-icon="mdi-magnify"
        solo
        @keyup.enter="seareched"
      />
      <div class="mt-4">
        <FilterItems :tags="condition.tasks || []" title="Task" @search="filtered" />
      </div>
      <div class="mt-4">
        <FilterItems :tags="condition.frameworks || []" title="Framework" @search="filtered" />
      </div>
      <div class="mt-4">
        <FilterItems :tags="condition.licenses || []" title="License" @search="filtered" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import FilterItems from './FilterItems.vue';
  import { useQuery } from '@/router';
  import { AIModelRegistry } from '@/types/ai_model';

  const props = withDefaults(
    defineProps<{
      modelCount?: number;
      registry?: AIModelRegistry;
    }>(),
    {
      modelCount: 0,
      registry: undefined,
    },
  );

  const i18nLocal = useI18n();
  const query = useQuery();
  const search = ref<string>('');

  const emit = defineEmits(['search', 'filter']);
  const seareched = () => {
    emit('search', search.value);
  };

  const filtered = (filter) => {
    emit('filter', filter);
  };

  const condition = ref<{ frameworks: string[]; licenses: string[]; tags: string[]; tasks: string[] }>({
    frameworks: [],
    licenses: [],
    tags: [],
    tasks: [],
  });
  const getModelStoreFilterCondition = async () => {
    condition.value = await new AIModelRegistry({ name: props.registry.name }).getSelector();
  };

  watch(
    () => props.registry,
    async (newValue) => {
      if (!newValue) return;
      getModelStoreFilterCondition();
    },
    { immediate: true, deep: true },
  );

  onMounted(() => {
    search.value = query.value.search || '';
  });
</script>
