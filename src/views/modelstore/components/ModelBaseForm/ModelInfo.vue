<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field class="my-0" label="模型名称" :readonly="edit" required />
        </v-col>
        <v-col cols="6">
          <v-autocomplete class="my-0" label="类型" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete class="my-0" label="Libraries" />
        </v-col>
        <v-col cols="6">
          <v-autocomplete class="my-0" label="License" />
        </v-col>
        <v-col cols="12">
          <v-textarea auto-grow class="my-0" label="模型简介" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  export default {
    name: 'ModelInfo',
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
    },
    data() {
      return {
        valid: false,
        // obj: {},
        // objRules: {},
      };
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
