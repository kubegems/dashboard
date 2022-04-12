<template>
  <ProjectEnvironmentLayout>
    <v-tabs v-model="currentTab">
      <v-tab
        v-for="item in tabs"
        :key="item.component"
      >
        <v-icon class="mr-4">{{ item.icon }}</v-icon>
        {{ item.text }}
      </v-tab>
    </v-tabs>

    <component :is="currentComponent" />
  </ProjectEnvironmentLayout>
</template>

<script>
import ProjectEnvironmentLayout from '@/views/observe/components/ProjectEnvironmentLayout'
import ServiceMonitor from './servicemonitor'
import PrometheusRule from './prometheusrule'
import Receiver from './receiver'

export default {
  name: 'MonitorConfig',
  components: {
    ProjectEnvironmentLayout,
    ServiceMonitor,
    PrometheusRule,
    Receiver,
  },
  data () {
    this.tabs = [
      {
        icon: 'mdi-eyedropper',
        text: '指标采集器',
        component: 'ServiceMonitor',
        tab: 'servicemonitor',
      },
      {
        icon: 'mdi-ruler',
        text: '告警规则',
        component: 'PrometheusRule',
        tab: 'prometheusrule',
      },
      {
        icon: 'mdi-call-received',
        text: '告警接收器',
        component: 'Receiver',
        tab: 'receiver',
      },
    ]

    this.tabMap = {
      servicemonitor: 0,
      prometheusrule: 1,
      receiver: 2,
    }

    return {
      currentTab: this.tabMap[this.$route.query.tab] || 0,
      tabs: this.tabs,
    }
  },
  computed: {
    currentComponent() {
      return this.tabs[this.currentTab].component
    },
  },
  watch: {
    currentTab () {
      this.$router.replace({
        query: {
          ...this.$route.query,
          tab: this.tabs[this.currentTab].tab,
        },
      })
    },
  },
}
</script>
