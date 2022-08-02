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
  <v-flex>
    <BaseSubTitle :title="title" />
    <v-form ref="form" v-model="valid" class="mt-2 rounded-t mx-2" lazy-validation @submit.prevent />
    <div class="px-2">
      <ACEEditor
        v-model="kubeyaml"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
        height="600"
        lang="yaml"
        :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
        theme="chrome"
        @init="$aceinit"
        @keydown.stop
      />
    </div>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseYamlForm',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      valid: false,
      kubeyaml: '',
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.kubeyaml = this.$yamldump(this.item);
      },
    },
    mounted() {
      if (this.item) this.kubeyaml = this.$yamldump(this.item);
    },
    methods: {
      init() {},
      validate() {
        return this.$refs.form.validate(true);
      },
      checkSaved() {
        return true;
      },
      reset() {
        this.kubeyaml = '';
        this.$refs.form.reset();
      },
      setYaml(data) {
        this.kubeyaml = data;
      },
      getYaml() {
        return this.kubeyaml;
      },
    },
  };
</script>
