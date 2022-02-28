<template>
  <v-card>
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-left">
        <Icon
          :icon="icon"
          class="mr-4 primary--text"
          width="50px"
          height="50px"
        />
        <div class="mx-2 text-fix-width text-center">
          <h2 class="text-h5">
            {{ num }}
          </h2>
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
    num: {
      type: Number,
      default: () => 0,
    },
    title: {
      type: String,
      default: () => '',
    },
    icon: {
      type: String,
      default: () => '',
    },
  },
}
</script>

<style lang="scss" scoped>
.text-fix-width {
  width: 80px;
}
</style>
