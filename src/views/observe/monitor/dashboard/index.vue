<template>
  <v-container
    fluid
    class="queryer"
  >
    <BaseBreadcrumb
      :breadcrumb="breadcrumb"
      class="queryer__header"
    />

    <Info />

    <OverviewList
      class="mt-4"
    />
  </v-container>
</template>

<script>
import Info from './components/Info'
import OverviewList from './components/OverviewList'

export default {
  name: 'MonitorDashboard',
  components: {
    Info,
    OverviewList,
  },
  data() {
    this.breadcrumb = {
      title: '监控大盘',
      tip: '',
      icon: 'mdi-gauge',
    }
    return {}
}}
</script>
