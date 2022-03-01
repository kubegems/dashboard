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
      title: '可观测性概览',
      tip: '指标、日志、追溯',
      icon: 'mdi-eyedropper',
    }

    return {}
  },
}
</script>
