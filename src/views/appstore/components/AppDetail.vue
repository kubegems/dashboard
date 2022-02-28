<template>
  <Markdown :content="item.files['README.md'] || ''" />
</template>

<script>
import Markdown from './Markdown'

export default {
  name: 'AppDetail',
  components: { Markdown },
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
}
</script>
