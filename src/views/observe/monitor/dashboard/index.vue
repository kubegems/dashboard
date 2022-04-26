<template>
  <v-container
    fluid
    class="queryer"
  >
    <BaseBreadcrumb
      :breadcrumb="breadcrumb"
      class="queryer__header"
    />
  </v-container>
</template>

<script>
export default {
  name: 'MonitorDashboard',
  data() {
    this.breadcrumb = {
      title: '监控大盘',
      tip: '',
      icon: 'mdi-gauge',
    }
    return {}
}}
</script>
