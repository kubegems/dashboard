<template>
  <v-sheet
    :height="height"
    :class="`py-1 pl-2 text-subtitle-1 primary--text rounded-t ${color}`"
  >
    <span
      :class="`float-left subtitle font-weight-regular ${
        color === 'primary' ? 'white--text' : 'blue-grey--text text--darken-2'
      }`"
      style="line-height: 28px;"
    >
      {{ title }}
    </span>
    <span class="float-left text-body-2 title-line">
      <slot name="tips"></slot>
    </span>
    <span class="float-left ml-4 text-body-2 title-line">
      <slot name="header"></slot>
    </span>
    <span :class="actionFloat">
      <slot name="action"></slot>
    </span>
    <span class="float-right mr-1">
      <slot name="selector"></slot>
    </span>
    <div class="float-clear"></div>
    <v-divider v-if="divider" class="mr-2" />
  </v-sheet>
</template>

<script>
export default {
  name: 'BaseSubTitle',
  props: {
    title: {
      type: String,
      default: () => '',
    },
    height: {
      type: String,
      default: () => '36px',
    },
    divider: {
      type: Boolean,
      default: () => true,
    },
    color: {
      type: String,
      default: () => '',
    },
    actionFloat: {
      type: String,
      default: () => 'float-right',
    },
  },
}
</script>

<style lang="scss" scoped>
.float-clear {
  clear: both;
}
.title-line {
  line-height: 28px !important;
}
</style>
