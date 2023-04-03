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
  <v-card class="my-3" flat>
    <BaseSubTitle class="pt-2" :divider="false" :title="i18n.t('resource.cluster')" />
    <v-card-text class="pa-2 px-4">
      <v-tabs v-model="state.tab" class="rounded-t" height="30">
        <v-tab v-for="item in tabItems" :key="item.icon">
          <BaseLogo
            class="mr-2"
            :icon-name="state.tab === 1 && item.icon === 'k3s' ? 'k3s-light' : item.icon"
            :ml="0"
            :mt="1"
            :width="20"
          />
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <component :is="tabItems[state.tab].value" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import CloudCluster from './CloudCluster.vue';
  import EdgeCluster from './EdgeCluster.vue';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    tab: 0,
  });

  const tabItems = ref<any[]>([{ text: i18nLocal.t('tab.cloud_cluster'), value: CloudCluster, icon: 'kubernetes' }]);
  if (store.state.GlobalPlugins['kubegems-edge']) {
    tabItems.value.push({ text: i18nLocal.t('tab.edge_cluster'), value: EdgeCluster, icon: 'k3s' });
  }
</script>
