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
  <div :style="{ height: `${height}px`, overflowY: 'auto' }">
    <v-row>
      <v-col cols="6">
        <ACEEditor
          v-model="jsonSchema"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          :style="{ height: `${height - 120}px !important` }"
          theme="chrome"
          @keydown.stop
        />
      </v-col>
      <v-col cols="1" :style="{ position: 'relative' }">
        <div class="kubegems__full-center">
          <v-btn color="primary" small @click="renderSchema">>></v-btn>
          <v-btn class="mt-2" color="primary" small @click="getData">Get</v-btn>
        </div>
      </v-col>
      <v-col cols="5">
        <v-card
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
          :height="height - 120"
          :style="{ overflowY: 'auto' }"
        >
          <v-form v-model="valid" class="pa-0 ma-3" lazy-validation @submit.prevent>
            <v-flex class="pa-0 ma-0">
              <BaseParam
                v-for="(param, index) in params"
                :id="`p${index}`"
                :key="`p${index}`"
                :all-params="params"
                :app-values="appValues"
                class="mt-0"
                :cluster-name="''"
                :param="param"
                v-bind="$attrs"
                v-on="$listeners"
                @changeBasicFormParam="changeBasicFormParam"
              />
            </v-flex>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import { retrieveFromSchema } from '@/utils/schema';
  import { deleteValue, setValue } from '@/utils/yaml';

  export default {
    name: 'SchemaForm',
    data() {
      return {
        appValues: {},
        params: [],
        jsonSchema: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return (window.innerHeight - 64) / this.Scale;
      },
    },
    methods: {
      getData() {
        console.log(this.appValues);
      },
      async renderSchema() {
        this.appValues = {};
        this.schemaJson = JSON.parse(this.jsonSchema);
        this.params = retrieveFromSchema(this.appValues, this.schemaJson);
      },
      changeBasicFormParam(param, value, operate = 'changed', path = '') {
        // Change raw values 修改原始值, 返回的是字符串
        if (operate === 'changed') {
          const parentPath = param.path.substr(0, param.path.lastIndexOf('/'));
          const typeFlag = param.path.substr(param.path.lastIndexOf('/') + 1);
          if (parseInt(typeFlag) === 0) {
            this.appValues = setValue(this.appValues, parentPath, []);
          }
          this.appValues = setValue(this.appValues, param.path, value);
        } else if (operate === 'deleted') {
          this.appValues = deleteValue(this.appValues, path);
        }
        this.reRender();
      },
      reRender() {
        this.params = [];
        this.params = retrieveFromSchema(this.appValues, this.schemaJson);
      },
    },
  };
</script>
