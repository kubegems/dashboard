<template>
  <v-form lazy-validation @submit.prevent>
    <BaseSubTitle title="模型信息" />
    <v-card-text class="pa-2">
      <v-row />
    </v-card-text>

    <BaseSubTitle title="资源部署" />
  </v-form>
</template>

<script>
  export default {
    name: 'ModelDeploy',
  };
</script>
