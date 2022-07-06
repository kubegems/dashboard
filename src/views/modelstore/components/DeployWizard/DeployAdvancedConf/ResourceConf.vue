<template>
  <v-form lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="资源部署" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="4">
          <v-text-field label="实例数" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="分配CPU" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="分配内存" />
        </v-col>
        <v-col cols="4">
          <v-switch v-model="gpu" hide-details label="分配GPU" />
        </v-col>
      </v-row>
    </v-card-text>
    <template v-if="gpu">
      <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="nvidia.com/gpu" />
      <v-card-text class="pa-2" />

      <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="tencent.com/vcuda" />
      <v-card-text class="pa-2" />
    </template>
  </v-form>
</template>

<script>
  export default {
    name: 'ResourceConf',
    data() {
      return {
        gpu: false,
      };
    },
  };
</script>
