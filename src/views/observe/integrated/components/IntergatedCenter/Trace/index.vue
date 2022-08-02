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
  <v-form class="py-4" lazy-validation @submit.prevent>
    <div v-highlight class="markdown-body px-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
      <component :is="component" />
    </div>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import Cpp from './docs/cpp.mdx';
  import Csharp from './docs/csharp.mdx';
  import Erlang from './docs/erlang.mdx';
  import Golang from './docs/golang.mdx';
  import Java from './docs/java.mdx';
  import Javascript from './docs/javascript.mdx';
  import Nodejs from './docs/nodejs.mdx';
  import Php from './docs/php.mdx';
  import Python from './docs/python.mdx';
  import Ruby from './docs/ruby.mdx';
  import Rust from './docs/rust.mdx';
  import Swift from './docs/swift.mdx';

  export default {
    name: 'Trace',
    components: {
      Cpp,
      Csharp,
      Erlang,
      Golang,
      Java,
      Javascript,
      Nodejs,
      Php,
      Python,
      Ruby,
      Rust,
      Swift,
    },
    props: {
      v: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        component: '',
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
            this.component = `${newValue[0].toUpperCase()}${newValue.substr(1)}`;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async addData() {
        this.$emit('close');
      },
    },
  };
</script>
