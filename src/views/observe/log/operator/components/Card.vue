<template>
  <div class="grey lighten-4 pa-3">
    <div
      v-if="!noTitle"
      class="text-subtitle-2 primary--text"
    >
      <slot name="title">
        <span class="mr-3">{{ title }}</span>
      </slot>
      <slot name="extend" />
    </div>

    <slot />
  </div>
</template>

<script>

export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      default: '',
    },
    noTitle: Boolean,
  },
}
</script>
