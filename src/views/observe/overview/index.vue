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
    <BaseBreadcrumb />
    <IntroSteps />
    <OverviewList class="mt-3" :tenant="tenant" />
  </v-container>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, ref } from 'vue';

  import IntroSteps from './components/IntroSteps/index.vue';
  import OverviewList from './components/OverviewList/index.vue';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';

  const store = useStore();
  const i18n = useGlobalI18n();

  const tenant = ref(undefined);

  onMounted(() => {
    nextTick(() => {
      if (!store.getters.Tenant().ID) {
        store.commit('SET_SNACKBAR', {
          text: i18n.t('tip.select_tenant'),
          color: 'warning',
        });
        return;
      }
      tenant.value = store.getters.Tenant();
    });
  });
</script>
