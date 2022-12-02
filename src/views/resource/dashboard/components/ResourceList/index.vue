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
    <BaseSubTitle class="pt-2" :divider="false" :title="$root.$t('resource.cluster')" />
    <v-card-text class="pa-2">
      <v-tabs v-model="tab" class="rounded-t" height="30">
        <v-tab v-for="item in tabItems" :key="item.value">
          <BaseLogo
            class="mr-2"
            :icon-name="tab === 1 && item.icon === 'k3s' ? 'k3s-light' : item.icon"
            :ml="0"
            :mt="1"
            :width="20"
          />
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <component :is="tabItems[tab].value" />
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../../i18n';
  import CloudCluster from './CloudCluster';
  import EdgeCluster from './EdgeCluster';

  export default {
    name: 'Cluster',
    i18n: {
      messages: messages,
    },
    components: {
      CloudCluster,
      EdgeCluster,
    },
    data() {
      return {
        tab: 0,
      };
    },
    computed: {
      tabItems() {
        return [
          { text: this.$t('tab.cloud_cluster'), value: 'CloudCluster', icon: 'kubernetes' },
          { text: this.$t('tab.edge_cluster'), value: 'EdgeCluster', icon: 'k3s' },
        ];
      },
    },
  };
</script>
