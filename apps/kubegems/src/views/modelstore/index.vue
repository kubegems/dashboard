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
    <Breadcrumb sync-status @setOnline="setOnline" @updateModelCount="updateModelCount">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegistrySelect v-model="state.registry" />
        </v-flex>
      </template>
    </Breadcrumb>
    <template v-if="store.state.GlobalPlugins['kubegems-models']">
      <v-row class="mt-0">
        <v-col class="pt-0" cols="3">
          <ModelFilter :model-count="state.modelCount" :registry="state.registry" @filter="filter" @search="search" />
        </v-col>
        <v-col class="pt-0" cols="9">
          <ModelCard ref="card" :online="state.online" :registry="state.registry" />
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-card class="mt-6" flat :height="`400px`">
        <v-row :style="{ height: `400px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  {{ i18n.t('plugin.missing', ['kubegems-model']) }}
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ i18n.t('plugin.no_permission') }}
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import Breadcrumb from './components/Breadcrumb.vue';
  import ModelCard from './components/ModelCard/index.vue';
  import ModelFilter from './components/ModelFilter/index.vue';
  import RegistrySelect from './components/RegistrySelect.vue';

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    registry: undefined,
    modelCount: 0,
    online: true,
  });

  const card = ref(null);
  const search = (search: string): void => {
    card.value.search(search);
  };

  const filter = (filter: { [key: string]: any }): void => {
    card.value.filter(filter);
  };

  const updateModelCount = (modelCount: number): void => {
    state.modelCount = modelCount;
  };

  const setOnline = (online: boolean): void => {
    state.online = online;
  };
</script>
