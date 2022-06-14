<template>
  <transition name="fade">
    <v-flex v-if="visible" class="empty-overlay">
      <slot>{{ text }}</slot>
    </v-flex>
  </transition>
</template>

<script>
  export default {
    name: 'EmptyOverlay',
    props: {
      text: {
        type: String,
        default: '请选择环境',
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .empty-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 45px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(#ffffff, 1);
    backdrop-filter: blur(2px);
    color: $primary;
    font-size: 1.2rem;
    font-weight: 600;
  }
</style>
