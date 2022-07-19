<template>
  <div v-highlight class="markdown-body" v-html="html" />
</template>

<script>
  import MarkdownIt from 'markdown-it';

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
      html: function () {
        const res = this.md.render(this.content);
        return this.htmlDecodeByRegExp(res);
      },
    },
    created() {
      this.md = new MarkdownIt();
    },
    methods: {
      htmlDecodeByRegExp(str) {
        var s = '';
        if (str.length == 0) return '';
        s = str.replace(/&amp;/g, '&');
        s = s.replace(/&lt;/g, '<');
        s = s.replace(/&gt;/g, '>');
        s = s.replace(/&nbsp;/g, ' ');
        s = s.replace(/&#39;/g, "'");
        s = s.replace(/&quot;/g, '"');
        return s;
      },
    },
  };
</script>
