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
  import messages from '../i18n';
  import AlertRule from './alert_rule';
  import Flow from './flow';
  import Output from './output';
  import Receiver from './receiver';
  import ProjectEnvironmentLayout from '@/views/observe/components/ProjectEnvironmentLayout';

  export default {
    name: 'MonitorConfig',
    i18n: {
      messages: messages,
    },
    components: {
      AlertRule,
      Flow,
      Output,
      ProjectEnvironmentLayout,
      Receiver,
    },
    data() {
      this.tabMap = {
        flow: 0,
        output: 1,
        alert: 2,
        receiver: 3,
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
            icon: 'mdi-arrange-send-backward',
            text: this.$t('tab.log_flow'),
            component: 'Flow',
            tab: 'flow',
          },
          {
            icon: 'mdi-router-wireless',
            text: this.$t('tab.log_ouput'),
            component: 'Output',
            tab: 'output',
          },
          {
            icon: 'mdi-ruler',
            text: this.$t('tab.log_alert_rule'),
            component: 'AlertRule',
            tab: 'alert',
          },
          {
            icon: 'mdi-call-received',
            text: this.$t('tab.log_receiver'),
            component: 'Receiver',
            tab: 'receiver',
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
