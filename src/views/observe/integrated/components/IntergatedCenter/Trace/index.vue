<template>
  <v-form class="py-4" lazy-validation @submit.prevent>
    <div class="markdown-body px-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
      <component :is="component" />
    </div>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import Cpp from './docs/cpp.md';
  import Csharp from './docs/csharp.md';
  import Erlang from './docs/erlang.md';
  import Golang from './docs/golang.md';
  import Java from './docs/java.md';
  import Javascript from './docs/javascript.md';
  import Nodejs from './docs/nodejs.md';
  import Php from './docs/php.md';
  import Python from './docs/python.md';
  import Ruby from './docs/ruby.md';
  import Rust from './docs/rust.md';
  import Swift from './docs/swift.md';

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
