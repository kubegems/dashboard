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
  <v-flex class="my-0 mt-0">
    <BaseSubTitle class="my-0 mt-0" :color="pathLevel === 1 ? 'grey lighten-3' : ''" :divider="false" :title="label" />
    <v-flex class="my-0 mt-0" :v-if="param.children && param.children.length > 0">
      <Param
        v-for="(childrenParam, index) in param.children"
        :id="`${id}-${index}`"
        :key="`${id}-${index}`"
        :all-params="allParams"
        :app-values="appValues"
        class="my-0 mt-0"
        :cluster-name="clusterName"
        :param="childrenParam"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'Subsection',
    // 异步加载, 解决与Param组件循环引用的问题
    components: {
      Param: () => import('./DeployWizard/Param'),
    },
    props: {
      allParams: {
        type: Array,
        default: () => [],
      },
      appValues: {
        type: Object,
        default: () => {},
      },
      clusterName: {
        type: String,
        default: () => '',
      },
      id: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
    },
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
  };
</script>
