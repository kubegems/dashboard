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
  <v-form ref="form" v-model="valid" lazy-validation>
    <component
      :is="steps[step]"
      :ref="steps[step]"
      :edit="edit"
      :expr="expr"
      :generator="generator"
      :item="item"
      :mode="mode"
    />
  </v-form>
</template>

<script>
  import Receiver from './Receiver';
  import Rule from './Rule';

  export default {
    name: 'PrometheusRuleBaseForm',
    components: {
      Receiver,
      Rule,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      expr: {
        type: String,
        default: () => '',
      },
      generator: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      mode: {
        type: String,
        default: () => 'monitor',
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      steps: ['Rule', 'Receiver'],
    }),
    computed: {
      obj() {
        return this.$refs[this.steps[this.step]].getData();
      },
    },
    watch: {
      item() {},
    },
    methods: {
      init(data) {
        this.$refs[this.steps[this.step]].init(data);
      },
      back(data) {
        this.$refs[this.steps[this.step]].back(data);
      },
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      reset() {
        this.$refs[this.steps[this.step]].reset();
      },
      setData(data) {
        this.$refs[this.steps[this.step]].setData(data);
      },
      getInhibitLabels() {
        return this.$refs[this.steps[this.step]].getInhibitLabels();
      },
      setLabelpairs(data) {
        this.$refs[this.steps[this.step]].setLabelpairs(data);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
