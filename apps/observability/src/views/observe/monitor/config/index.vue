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
  <ProjectEnvironmentLayout v-model="pass">
    <v-tabs v-model="currentTab" :height="30">
      <v-tab v-for="item in tabs" :key="item.component">
        <v-icon class="mr-4">{{ item.icon }}</v-icon>
        {{ item.text }}
      </v-tab>
    </v-tabs>

    <component :is="currentComponent" :pass="pass" />
  </ProjectEnvironmentLayout>
</template>

<script>
  import ProjectEnvironmentLayout from '../../components/ProjectEnvironmentLayout';
  import messages from '../i18n';
  import PrometheusRule from './prometheusrule';
  import ServiceMonitor from './servicemonitor';

  export default {
    name: 'MonitorConfig',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvironmentLayout,
      PrometheusRule,
      ServiceMonitor,
    },
    data() {
      this.tabMap = {
        servicemonitor: 0,
        prometheusrule: 1,
      };

      return {
        currentTab: this.tabMap[this.$route.query.tab] || 0,
        pass: false,
      };
    },
    computed: {
      currentComponent() {
        return this.tabs[this.currentTab].component;
      },
      tabs() {
        return [
          {
            icon: 'mdi-eyedropper',
            text: this.$t('tab.servicemonitor'),
            component: 'ServiceMonitor',
            tab: 'servicemonitor',
          },
          {
            icon: 'mdi-ruler',
            text: this.$t('tab.prometheus_rule'),
            component: 'PrometheusRule',
            tab: 'prometheusrule',
          },
        ];
      },
    },
    watch: {
      currentTab() {
        this.$router.replace({
          query: {
            ...this.$route.query,
            tab: this.tabs[this.currentTab].tab,
          },
        });
      },
    },
  };
</script>
