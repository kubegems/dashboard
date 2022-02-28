<template>
  <v-btn
    class="item"
    :class="{ 'item--active': active }"
    :color="active ? 'primary' : '#424242'"
    depressed
    text
    small
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  name: 'ClusterSelectItem',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClick () {
      this.$emit('click')
    },
  },
}
</script>

<style lang="scss" scoped>
.item {
  position: relative;
  background-color: #f0f4f7;

  &--active {
    background-color: #bbdefb;
  }
}
</style>
