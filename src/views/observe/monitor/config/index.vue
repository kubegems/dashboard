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
  import PrometheusRule from './prometheusrule';
  import Receiver from './receiver';
  import ServiceMonitor from './servicemonitor';
  import ProjectEnvironmentLayout from '@/views/observe/components/ProjectEnvironmentLayout';

  export default {
    name: 'MonitorConfig',
    components: {
      ProjectEnvironmentLayout,
      PrometheusRule,
      Receiver,
      ServiceMonitor,
    },
    data() {
      this.tabs = [
        {
          icon: 'mdi-eyedropper',
          text: '指标采集器',
          component: 'ServiceMonitor',
          tab: 'servicemonitor',
        },
        {
          icon: 'mdi-ruler',
          text: '监控告警规则',
          component: 'PrometheusRule',
          tab: 'prometheusrule',
        },
        {
          icon: 'mdi-call-received',
          text: '告警接收器',
          component: 'Receiver',
          tab: 'receiver',
        },
      ];

      this.tabMap = {
        servicemonitor: 0,
        prometheusrule: 1,
        receiver: 2,
      };

      return {
        currentTab: this.tabMap[this.$route.query.tab] || 0,
        tabs: this.tabs,
        pass: false,
      };
    },
    computed: {
      currentComponent() {
        return this.tabs[this.currentTab].component;
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
