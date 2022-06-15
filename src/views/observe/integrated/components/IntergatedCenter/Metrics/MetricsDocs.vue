<template>
  <v-form ref="form" class="pb-4 metrics" lazy-validation @submit.prevent>
    <div class="markdown-body px-4" :style="{ height: `${height}px`, overflowY: 'auto' }" v-html="html" />
  </v-form>
</template>

<script>
  import MarkdownIt from 'markdown-it';
  import hljs from 'markdown-it-highlightjs';
  import { mapState } from 'vuex';

  export default {
    name: 'MetricsDocs',
    data() {
      return {
        md: null,
        content: '',
        html: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 208) / this.Scale);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.form?.resetValidation();
        this.content = this.unicodeToUtf8(this.loadFile(`/docs/metrics/metrics.md`));
        this.md = new MarkdownIt();
        this.md.use(hljs);
        this.html = this.md.render(this.content);
      });
    },
    methods: {
      async addData() {
        this.$emit('close');
      },
      loadFile(name) {
        const xhr = new XMLHttpRequest();
        const okStatus = document.location.protocol === 'file:' ? 0 : 200;
        xhr.open('GET', name, false);
        xhr.overrideMimeType('text/html;charset=utf-8');
        xhr.send(null);
        return xhr.status === okStatus ? xhr.responseText : null;
      },
      unicodeToUtf8(data) {
        data = data.replace(new RegExp('\\\\', 'g'), '%');
        return unescape(data);
      },
    },
  };
</script>
