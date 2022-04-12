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
import Flow from './flow'
import Output from './output'

export default {
  name: 'MonitorConfig',
  components: {
    ProjectEnvironmentLayout,
    Flow,
    Output,
  },
  data () {
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
    ]

    this.tabMap = {
      flow: 0,
      output: 1,
    }

    return {
      currentTab: this.tabMap[this.$route.query.tab] || 0,
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
