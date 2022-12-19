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
        <v-btn class="kubegems__full-center" color="primary" small @click="renderSchema">>></v-btn>
      </v-col>
      <v-col cols="5">
        <v-card :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`" :height="height - 120">
          <JsonSchema
            ref="jsonSchema"
            :app-values="appValues"
            class="px-2 pt-3"
            :cluster-name="''"
            :params="params"
            @changeBasicFormParam="changeBasicFormParam"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import BaseYaml from '@/mixins/yaml';
  import { deepCopy } from '@/utils/helpers';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';

  export default {
    name: 'SchemaForm',
    i18n: {
      messages: messages,
    },
    components: {
      JsonSchema,
    },
    mixins: [BaseYaml],
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
      validate() {
        return this.$refs.jsonSchema.validate();
      },
      getData() {
        this.obj.values = deepCopy(this.appValues);
        return this.obj;
      },
      async renderSchema() {
        this.appValues = {};
        this.schemaJson = JSON.parse(this.jsonSchema);
        this.params = this.retrieveBasicFormParams(this.appValues, this.schemaJson);
      },
      changeBasicFormParam(param, value) {
        // Change raw values 修改原始值, 返回的是字符串
        this.appValues = this.setValue(this.appValues, param.path, value);
        this.reRender();
      },
      reRender() {
        this.params = [];
        this.params = this.retrieveBasicFormParams(this.appValues, this.schemaJson);
      },
      retrieveBasicFormParams(defaultValues, schema, parentPath = '') {
        let params = [];
        if (schema && schema.properties) {
          const properties = schema.properties;
          Object.keys(properties).forEach((propertyKey) => {
            const itemPath = `${parentPath || ''}${propertyKey}`;
            const { type, form } = properties[propertyKey];
            if (form) {
              // Use the default value either from the JSON schema or the default values
              // 使用schema中的默认值
              // const value = properties[propertyKey].default
              // 使用values.yaml的默认值
              const value = this.getValueSchema(defaultValues, itemPath, properties[propertyKey].default);
              const param = {
                ...properties[propertyKey],
                path: itemPath,
                name: propertyKey,
                type,
                value,
                enum: properties[propertyKey].enum?.map((item) => item?.toString() ?? ''),
                children:
                  properties[propertyKey].type === 'object'
                    ? this.retrieveBasicFormParams(defaultValues, properties[propertyKey], `${itemPath}/`)
                    : undefined,
              };
              params = params.concat(param);
            } else {
              // form为假不渲染
              // If the property is an object, iterate recursively 递归遍历
              if (schema.properties[propertyKey].type !== 'object') {
                params = params.concat(
                  this.retrieveBasicFormParams(defaultValues, properties[propertyKey], `${itemPath}/`),
                );
              }
            }
          });
        }
        return params;
      },
      reset() {
        this.appValues = {};
        this.params = [];
        this.obj = {};
      },
    },
  };
</script>
