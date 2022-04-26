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
  name: 'Intergated',
  data() {
    this.breadcrumb = {
      title: '接入中心',
      tip: '',
      icon: 'mdi-widgets',
    }
    return {}
}}
</script>
