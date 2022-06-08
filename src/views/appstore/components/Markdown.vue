<template>
  <div
    class="markdown-body"
    v-html="html"
  />
</template>

<script>
import MarkdownIt from 'markdown-it'
import hljs from 'markdown-it-highlightjs'

export default {
  name: 'Markdown',
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    md: null,
  }),
  computed: {
    html: function() {
      const res = this.md.render(this.content)
      return res
    },
  },
  created() {
    this.md = new MarkdownIt()
    this.md.use(hljs)
  },
}
</script>

<style lang="scss">
.hljs {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
