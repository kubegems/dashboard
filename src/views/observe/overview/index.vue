<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <IntroSteps />
    <OverviewList class="mt-4" />
  </v-container>
</template>

<script>
import IntroSteps from './components/IntroSteps'
import OverviewList from './components/OverviewList'

export default {
  name: 'Observe',
  components: {
    IntroSteps,
    OverviewList,
  },
  data () {
    this.breadcrumb = {
      title: '可观测性',
      tip: '提供日志采集，查看，告警/监控指标采集，告警/告警中心，历史/链路追踪等所有功能',
      icon: 'mdi-view-dashboard',
    }

    return {}
  },
}
</script>
