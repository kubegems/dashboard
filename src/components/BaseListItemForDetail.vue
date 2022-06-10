<template>
  <v-list-item :class="`pl-2 mt-${mt}`">
    <v-list-item-content class="py-1">
      <v-list-item-title class="float-left subtitle font-weight-regular text--darken-2 pl-0 kubegems__text">
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle class="kubegems__text pl-2">
        <slot name="content"></slot>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
  export default {
    name: 'BaseListItemForDetail',
    props: {
      mt: {
        type: Number,
        default: () => 1,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item__title,
  .v-list-item__subtitle {
    overflow: auto !important;
    white-space: inherit !important;
    line-height: 1.5rem !important;
  }
</style>
