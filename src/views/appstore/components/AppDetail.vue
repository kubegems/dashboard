<template>
  <div class="pa-3 white rounded mt-3" :style="{ height: `${height}px`, overflowY: 'auto' }">
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
        return parseInt((window.innerHeight - 214) / this.Scale);
      },
    },
  };
</script>
