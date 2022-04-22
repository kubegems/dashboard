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
  name: 'LivingAlert',
  data() {
    this.breadcrumb = {
      title: '实时告警',
      tip: '',
      icon: 'mdi-alert',
    }
    return {}
}}
</script>
