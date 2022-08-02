<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

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
