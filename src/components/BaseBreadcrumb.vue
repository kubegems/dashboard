<template>
  <v-flex class="mb-3">
    <v-row class="ma-0 pa-0">
      <v-col cols="1" sm="12" class="pa-0">
        <v-card class="custom-shaodow pa-0" height="64" :flat="flat">
          <v-card-text>
            <v-icon v-if="breadcrumb.icon != undefined" left>
              {{ breadcrumb.icon }}
            </v-icon>
            <span class="text-subtitle-2 kubegems__detail font-weight-medium">
              {{ breadcrumb.title }}
            </span>
            <v-icon
              v-if="breadcrumb.tip !== undefined"
              class="v-tips-bg"
              right
              small
            >
              fas fa-question-circle
            </v-icon>
            <span
              v-if="breadcrumb.tip !== undefined"
              class="text-overline v-tips-bg font-weight-regular"
            >
              {{ breadcrumb.tip }}
            </span>
            <slot name="extend"></slot>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-flex>
</template>

<script>
export default {
  name: 'BaseBreadcrumb',
  props: {
    breadcrumb: {
      type: Object,
      default: () => {},
    },
    flat: {
      type: Boolean,
      default: () => false,
    }
  },
}
</script>

<style lang="scss" scoped>
.v-tips-bg {
  color: rgba(0, 0, 0, 0.6);
  text-transform: capitalize !important;
}
</style>
