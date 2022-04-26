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
  name: 'AlertChannel',
  data() {
    this.breadcrumb = {
      title: '告警渠道',
      tip: '',
      icon: 'mdi-road-variant',
    }
    return {}
}}
</script>
