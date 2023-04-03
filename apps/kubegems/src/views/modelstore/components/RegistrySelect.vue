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
  <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
    <span class="text-body-2 mr-1">{{ i18n.t('header.model_store') }}</span>
    <v-menu
      v-model="state.menu"
      bottom
      class="mx-1 px-1"
      left
      offset-y
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
          <BaseLogo
            class="mr-2"
            :icon-name="selectRegistry ? selectRegistry.name : ''"
            :ml="0"
            :style="{ marginTop: '6px' }"
            :width="16"
          />
          {{ selectRegistry ? selectRegistry.name : '' }}
          <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
      </template>
      <v-data-iterator
        class="file-iterator"
        hide-default-footer
        :items="[{ text: i18n.t('header.model_store'), values: registryItems }]"
      >
        <template #no-data>
          <v-card>
            <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
          </v-card>
        </template>
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
            <v-list dense>
              <v-flex class="text-subtitle-2 text-center ma-2">
                <span>{{ i18n.t('header.model_store') }}</span>
              </v-flex>
              <v-divider class="mx-2" />
              <v-list-item
                v-for="(repo, index) in item.values"
                :key="index"
                class="text-body-2 text-start font-weight-medium mx-2"
                link
                :style="{ color: selectRegistry && repo.value === selectRegistry.name ? `#1e88e5 !important` : `` }"
                @click="setRepo(repo)"
              >
                <v-list-item-content>
                  <div>
                    <div class="float-left mr-2">
                      <BaseLogo class="mr-2" :icon-name="repo.value" :ml="0" :mt="0" :width="16" />
                    </div>
                    <div class="float-left"> {{ repo.text }}</div>
                    <div class="kubegems__clear-float" />
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>
  </v-sheet>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useQuery } from '@kubegems/extension/router';
  import { onMounted, reactive, ref, watch } from 'vue';

  import { AIModelRegistry } from '@/types/ai_model';

  const props = withDefaults(
    defineProps<{
      value: AIModelRegistry;
    }>(),
    {
      value: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const query = useQuery();
  const router = useRouter();

  const state = reactive({
    menu: false,
  });

  const emit = defineEmits(['change', 'input']);
  const selectRegistry = ref<AIModelRegistry>(undefined);
  const setRepo = (repo: AIModelRegistry): void => {
    selectRegistry.value = repo;
    emit('change', selectRegistry.value);
    emit('input', selectRegistry.value);
    router.replace({ query: { ...query.value, registry: selectRegistry.value?.name } });
  };

  const registryItems = ref<AIModelRegistry[]>([]);
  const getModelSourceList = async () => {
    const data = await new AIModelRegistry().getRegistryList({ noprocessing: true });
    registryItems.value = data
      .filter((s) => {
        return s.enabled;
      })
      .map((s) => {
        return new AIModelRegistry({ text: s?.name, value: s?.name, ...s });
      });
    if (query.value.registry) {
      selectRegistry.value = registryItems.value.find((r) => {
        return r.name === query.value.registry;
      });
      emit('change', selectRegistry.value);
      emit('input', selectRegistry.value);
    } else if (registryItems.value?.length > 0) {
      selectRegistry.value = registryItems.value[0];
      emit('change', selectRegistry.value);
      emit('input', selectRegistry.value);
      router.replace({
        query: { ...query.value, registry: selectRegistry.value?.name },
      });
    }
  };

  onMounted(() => {
    getModelSourceList();
  });

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      selectRegistry.value = newValue;
    },
    { immediate: true, deep: true },
  );
</script>
