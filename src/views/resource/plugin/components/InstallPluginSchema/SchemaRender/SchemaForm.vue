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
    <JsonSchema
      ref="jsonSchema"
      :app-values="appValues"
      class="px-2 pt-3"
      :cluster-name="Cluster().ClusterName"
      :params="params"
      @changeBasicFormParam="changeBasicFormParam"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseYaml from '@/mixins/yaml';
  import { deepCopy } from '@/utils/helpers';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';

  export default {
    name: 'SchemaForm',
    components: {
      JsonSchema,
    },
    mixins: [BaseYaml],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        appValues: {},
        params: [],
        obj: {},
      };
    },
    computed: {
      ...mapGetters(['Cluster']),
      height() {
        return (window.innerHeight - 202) / this.Scale;
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.renderSchema();
            this.obj = deepCopy(newValue);
          }
        },
        deep: true,
        immediate: true,
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
        this.appValues = this.item.values;
        this.schemaJson = JSON.parse(this.item.schema);
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
    },
  };
</script>
