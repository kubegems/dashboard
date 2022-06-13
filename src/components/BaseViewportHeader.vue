<template>
  <component :is="component" :selectable="selectable" :environmented="environmented" />
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    props: {
      clusterable: {
        type: Boolean,
        default: () => false,
      },
      environmented: {
        type: Boolean,
        default: () => true,
      },
      selectable: {
        type: Boolean,
        default: () => true,
      },
    },
    computed: {
      ...mapState(['AdminViewport']),
      component() {
        const component = this.AdminViewport || this.clusterable ? 'BaseClusterHeader' : 'BaseTenantHeader';
        return component;
      },
    },
  };
</script>
