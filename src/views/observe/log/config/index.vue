<template>
  <ProjectEnvironmentLayout>
    <v-tabs v-model="currentTab" :height="30">
      <v-tab v-for="item in tabs" :key="item.component">
        <v-icon class="mr-4">{{ item.icon }}</v-icon>
        {{ item.text }}
      </v-tab>
    </v-tabs>

    <component :is="currentComponent" />
  </ProjectEnvironmentLayout>
</template>

<script>
  import AlertRule from './alert_rule';
  import Flow from './flow';
  import Output from './output';
  import Receiver from './receiver';
  import ProjectEnvironmentLayout from '@/views/observe/components/ProjectEnvironmentLayout';

  export default {
    name: 'MonitorConfig',
    components: {
      AlertRule,
      Flow,
      Output,
      ProjectEnvironmentLayout,
      Receiver,
    },
    data() {
      this.tabs = [
        {
          icon: 'mdi-arrange-send-backward',
          text: '日志采集器',
          component: 'Flow',
          tab: 'flow',
        },
        {
          icon: 'mdi-router-wireless',
          text: '日志路由器',
          component: 'Output',
          tab: 'output',
        },
        {
          icon: 'mdi-ruler',
          text: '日志告警规则',
          component: 'AlertRule',
          tab: 'alert',
        },
        {
          icon: 'mdi-call-received',
          text: '告警接收器',
          component: 'Receiver',
          tab: 'receiver',
        },
      ];

      this.tabMap = {
        flow: 0,
        output: 1,
        alert: 2,
        receiver: 3,
      };

      return {
        currentTab: this.tabMap[this.$route.query.tab] || 0,
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
