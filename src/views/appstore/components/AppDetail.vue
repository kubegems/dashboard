<template>
  <div :style="{ height: `${height}px`, overflowY: 'auto' }">
    <Markdown :content="item.files['README.md'] || ''" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import Markdown from './Markdown';

  export default {
    name: 'AppDetail',
    components: {
      Markdown,
    },
    props: {
      item: {
        type: Object,
        default: null,
      },
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 224) / this.Scale);
      },
    },
  };
</script>
