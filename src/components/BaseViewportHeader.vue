<template>
  <component
    :is="component"
    :selectable="selectable"
    :environmented="environmented"
  />
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    selectable: {
      type: Boolean,
      default: () => true,
    },
    environmented: {
      type: Boolean,
      default: () => true,
    },
    clusterable: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    ...mapState(['AdminViewport']),
    component() {
      const component =
        this.AdminViewport || this.clusterable
          ? 'BaseClusterHeader'
          : 'BaseTenantHeader'
      return component
    },
  },
}
</script>
