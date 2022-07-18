<template>
  <div class="white rounded mt-3 pa-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <Markdown :content="content" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import Markdown from './Markdown';

  export default {
    name: 'Description',
    components: {
      Markdown,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        content: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 214) / this.Scale);
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.content = newValue?.intro || '';
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
