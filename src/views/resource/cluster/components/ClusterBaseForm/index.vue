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
  <component :is="steps[step]" :ref="steps[step]" :control="control" :edit="edit" :item="item" @refresh="refresh" />
</template>

<script>
  import InitClusterConfig from './InitClusterConfig';
  import TestKubeConfig from './TestKubeConfig';
  import ValidateKubeConfig from './ValidateKubeConfig';

  export default {
    name: 'ClusterBaseForm',
    components: {
      InitClusterConfig,
      TestKubeConfig,
      ValidateKubeConfig,
    },
    props: {
      control: {
        type: Boolean,
        default: () => false,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      steps: ['ValidateKubeConfig', 'TestKubeConfig', 'InitClusterConfig'],
    }),
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
      getData() {
        return this.$refs[this.steps[this.step]].getData();
      },
      getExtend() {
        return this.$refs[this.steps[this.step]].getExtend();
      },
      refresh(data) {
        this.$emit('refresh', data);
      },
    },
  };
</script>
