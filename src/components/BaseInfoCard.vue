<template>
  <v-card :flat="flat">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-left">
        <Icon class="mr-4 primary--text" height="50px" :icon="icon" width="50px" />
        <div class="mx-2 info-card-width text-center">
          <h2 class="text-h5">{{ num }} {{ unit }}</h2>
          <h5 class="text-subtitle-2 font-weight-regular">{{ title }}</h5>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'BaseInfoCard',
    props: {
      flat: {
        type: Boolean,
        default: () => false,
      },
      icon: {
        type: String,
        default: () => '',
      },
      num: {
        type: Number,
        default: () => 0,
      },
      title: {
        type: String,
        default: () => '',
      },
      unit: {
        type: String,
        default: () => '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .info-card-width {
    width: 100px;
  }
</style>
