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
          <!-- <ServiceSelect v-model="service" :date="date" :env="env" :offset-y="0" /> -->
          <ProjectEnvSelectCascade v-model="env" first :offset-y="0" reverse :tenant="store.getters.Tenant()" />
          <BaseDatetimePicker v-model="date" :default-value="30" :offset-y="0" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-card>
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="tabChange">
          <v-tab v-for="item in tabItems" :key="item.tab">
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <component :is="tabItems[tab].value" :date="date" :env="env" />
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import { useI18n } from '../i18n';
  import Overview from './components/Overview.vue';
  import ServiceList from './components/ServiceList.vue';
  import Trace from './components/Trace.vue';
  import { useRoute, useRouter } from '@/composition/router';
  import { useStore } from '@/store';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade.vue';

  const i18nLocal = useI18n();
  const route = useRoute();
  const router = useRouter();
  const store = useStore();

  const env = ref({});
  const date = ref([]);

  const tabMap: { [key: string]: number } = { service: 0, overview: 1, trace: 2 };
  const tab = ref(tabMap[route.query.tab as string] || 0);
  const tabItems = [
    { text: i18nLocal.t('tab.service'), value: ServiceList, tab: 'service' },
    { text: i18nLocal.t('tab.overview'), value: Overview, tab: 'overview' },
    { text: i18nLocal.t('tab.trace'), value: Trace, tab: 'trace' },
  ];
  const tabChange = (): void => {
    router.replace({
      query: { ...route.query, tab: tabItems[tab.value].tab },
    });
  };
</script>
