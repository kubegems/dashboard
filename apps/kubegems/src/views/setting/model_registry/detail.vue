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
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu v-if="useEnvironmentAllow()" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateModelRegistry">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeModelRegistry">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BaseResourceInfo :item="registry" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="registry" />
      </v-col>
    </v-row>

    <ModelRegistryForm ref="modelRegistry" @refresh="getModelRegistryDetail" />
  </v-container>
</template>

<script lang="ts" setup>
  import { AIModelRegistry } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useEnvironmentAllow } from '@kubegems/extension/permission';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, ref } from 'vue';

  import BaseResourceInfo from './components/BaseResourceInfo.vue';
  import ModelList from './components/ModelList/index.vue';
  import ModelRegistryForm from './components/ModelRegistryForm/index.vue';

  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();

  const tab = ref(0);
  const tabItems = [{ text: i18n.t('header.model_store'), value: ModelList }];

  const registry = ref<AIModelRegistry>(undefined);
  const getModelRegistryDetail = async (): Promise<void> => {
    registry.value = await new AIModelRegistry({ name: routeParams.value.name }).getRegistryByAdmin();
  };

  onMounted(() => {
    getModelRegistryDetail();
  });

  const modelRegistry = ref(null);
  const updateModelRegistry = (): void => {
    modelRegistry.value.init(registry.value);
    modelRegistry.value.open();
  };

  const removeModelRegistry = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('header.model_store')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('header.model_store')])} ${registry.value.name}`,
        type: 'delete',
        name: registry.value.name,
      },
      param: {},
      doFunc: async () => {
        await new AIModelRegistry({ name: registry.value.name }).deleteRegistry();
        router.push({ name: 'model-repository-list' });
      },
    });
  };
</script>
