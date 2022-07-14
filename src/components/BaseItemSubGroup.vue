<template>
  <BaseItemGroup append-icon="mdi-menu-down" class="xyz" :item="item" :prepend-icon="item.icon" sub-group text />
</template>

<script>
  export default {
    name: 'BaseItemSubGroup',
    props: {
      item: {
        type: Object,
        default: () => ({
          avatar: undefined,
          group: undefined,
          title: undefined,
          children: [],
        }),
      },
    },
  };
</script>
