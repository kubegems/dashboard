<template>
  <v-form ref="form" class="py-4" lazy-validation @submit.prevent>
    <div class="markdown-body px-4" :style="{ height: `${height}px`, overflowY: 'auto' }" v-html="html" />
  </v-form>
</template>

<script>
  import MarkdownIt from 'markdown-it';
  import hljs from 'markdown-it-highlightjs';
  import { mapState } from 'vuex';

  export default {
    name: 'Trace',
    props: {
      v: {
        type: String,
        default: () => '',
      },
    },
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
    watch: {
      v: {
        handler(newValue) {
          if (newValue) {
            this.content = this.unicodeToUtf8(this.loadFile(`/docs/trace/${newValue}.md`));
            this.md = new MarkdownIt();
            this.md.use(hljs);
            this.html = this.md.render(this.content);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.form?.resetValidation();
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
