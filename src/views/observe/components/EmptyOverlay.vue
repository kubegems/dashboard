<template>
  <transition name="fade">
    <v-flex
      v-if="visible"
      class="empty-overlay"
    >
      <slot>{{ text }}</slot>
    </v-flex>
  </transition>
</template>

<script>
export default {
  name: 'EmptyOverlay',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '请选择环境',
    },
  },
}
</script>

<style lang="scss" scoped>
.empty-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background-color: rgba(#ffffff, 0.95);
  backdrop-filter: blur(2px);
  color: $primary;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>
