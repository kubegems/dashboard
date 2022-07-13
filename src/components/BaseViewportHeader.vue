<template>
  <component :is="component" :environmented="environmented" :selectable="selectable" />
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseViewportHeader',
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
