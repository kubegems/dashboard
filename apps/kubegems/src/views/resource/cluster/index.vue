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

    <v-card>
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            <BaseLogo
              class="mr-2"
              :icon-name="tab === 1 && item.tab === 'edge' ? 'k3s-light' : item.icon"
              :ml="0"
              :mt="1"
              :width="20"
            />
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <component :is="tabItems[tab].value" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import CloudCluster from './components/CloudCluster';
  import EdgeCluster from './components/EdgeCluster';
  import messages from './i18n';

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
      this.tabMap = {
        cloud: 0,
        edge: 1,
      };

      return {
        tab: this.tabMap[this.$route.query.tab] || 0,
      };
    },
    computed: {
      ...mapState(['GlobalPlugins']),
      tabItems() {
        const tabs = [{ text: this.$t('tab.cloud_cluster'), value: 'CloudCluster', icon: 'kubernetes', tab: 'cloud' }];
        if (this.GlobalPlugins['kubegems-edge']) {
          tabs.push({ text: this.$t('tab.edge_cluster'), value: 'EdgeCluster', icon: 'k3s', tab: 'edge' });
        }
        return tabs;
      },
    },
    mounted() {
      this.$store.commit('SET_NAMESPACE_FILTER', null);
    },
    methods: {
      onTabChange() {
        this.$router.replace({
          query: { ...this.$route.query, tab: this.tabItems[this.tab].tab },
        });
      },
    },
  };
</script>
