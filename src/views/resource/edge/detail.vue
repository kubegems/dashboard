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
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb />

    <v-card>
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="tabChange">
          <v-tab v-for="item in tabItems" :key="item.tab">
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <component :is="tabItems[tab].value" />
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import EdgeCluster from './components/EdgeCluster.vue';
  import Namespace from './components/Namespace.vue';
  import Node from './components/Node.vue';
  import { useI18n } from './i18n';
  import { useRoute, useRouter } from '@/composition/router';

  const route = useRoute();
  const router = useRouter();
  const i18nLocal = useI18n();

  const tabMap = {
    edge: 0,
    node: 1,
    namespace: 2,
  };

  const tab = ref<number>(tabMap[route.query.tab as string] || 0);

  const tabItems = [
    { text: i18nLocal.t('tab.detail'), value: EdgeCluster, tab: 'edge' },
    { text: i18nLocal.t('tab.node'), value: Node, tab: 'node' },
    { text: i18nLocal.t('tab.namespace'), value: Namespace, tab: 'namespace' },
  ];

  const tabChange = (): void => {
    router.replace({
      query: { ...route.query, tab: tabItems[tab.value].tab },
    });
  };
</script>
