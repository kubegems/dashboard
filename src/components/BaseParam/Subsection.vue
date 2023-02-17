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
    <BaseSubTitle
      class="my-0 mt-0"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :freeze="pathLevel !== 1"
      :pl="pathLevel === 1 ? 2 : 0"
      :title="label"
    >
      <template v-if="itemAdd" #action>
        <v-btn class="mt-n1" color="primary" icon small @click="addItem">
          <v-icon small>mdi-plus-box</v-icon>
        </v-btn>
      </template>
    </BaseSubTitle>
    <v-flex v-if="itemAdd" class="my-0 mt-0" :v-if="param.value">
      <div
        v-for="(itemParam, ii) in param.value"
        :id="`${id}-${ii}`"
        :key="`${id}-${ii}`"
        class="grey lighten-5 rounded ma-3 pa-2"
      >
        <v-btn class="float-right" color="error" icon small>
          <v-icon small>mdi-close-box</v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
        <BaseParam
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
      </div>
    </v-flex>
    <v-flex v-else class="my-0 mt-0" :v-if="param.children && param.children.length > 0">
      <BaseParam
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
    props: {
      allParams: {
        type: Array,
        default: () => [],
      },
      appValues: {
        type: Object,
        default: () => ({}),
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
        default: () => ({}),
      },
      itemAdd: {
        type: Boolean,
        default: () => false,
      },
    },
    computed: {
      pathLevel() {
        if (this.param?.path?.indexOf('/') > -1) return this.param.path.split('/').length;
        if (this.param?.path?.indexOf('.') > -1) return this.param.path.split('.').length;
        return 1;
      },
    },
    methods: {
      addItem() {
        return;
      },
    },
  };
</script>
