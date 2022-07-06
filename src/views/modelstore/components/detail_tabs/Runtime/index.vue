<template>
  <component :is="displayCompnent" @toDetail="toDetail" />
</template>

<script>
  import Detail from './Detail';
  import List from './List';

  export default {
    name: 'Runtime',
    components: {
      Detail,
      List,
    },
    data() {
      return {
        displayCompnent: 'List',
      };
    },
    methods: {
      toDetail() {
        this.displayCompnent = 'Detail';
      },
    },
  };
</script>
