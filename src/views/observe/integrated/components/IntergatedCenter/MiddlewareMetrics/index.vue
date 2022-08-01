<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <div class="pa-2" :style="{ height: `${height}px`, overflowY: 'auto', overflowX: 'hidden' }">
    <BaseSubTitle class="mx-2 mt-1" color="grey lighten-3" :divider="false" title="监控采集配置" />

    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="metrics" />
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-text-field v-model="obj.appName" label="名称" :rules="objRules.appNameRule" />
        </v-col>
      </v-row>
      <JsonSchema
        ref="jsonSchema"
        :app-values="appValues"
        class="px-2"
        :cluster-name="env ? env.clusterName : ''"
        :params="params"
        @changeBasicFormParam="changeBasicFormParam"
      />
    </v-form>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapGetters, mapState } from 'vuex';

  import ProjectEnvSelect from '../ProjectEnvSelect';
  import { getChartSchema, postDeployAppStore } from '@/api';
  import { required } from '@/utils/rules';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';
  import { YamlMixin } from '@/views/appstore/mixins/yaml';

  export default {
    name: 'MiddlewareMetrics',
    components: {
      JsonSchema,
      ProjectEnvSelect,
    },
    mixins: [YamlMixin],
    props: {
      chartName: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        valid: false,
        env: undefined,
        appValues: {},
        schemaJson: {},
        params: [],
        chart: {},
        obj: {
          appName: '',
        },
        objRules: {
          appNameRule: [required],
        },
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 152) / this.Scale);
      },
    },
    watch: {
      chartName: {
        handler(newValue) {
          if (newValue) {
            this.middlewareChartInfo();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async middlewareChartInfo() {
        const data = await getChartSchema(this.chartName);
        this.chart = data;
        if (this.chart['values.schema.json']) {
          this.schemaJson = JSON.parse(Base64.decode(this.chart['values.schema.json']));
        }
        if (this.chart['values.yaml']) {
          this.appValues = this.$yamlload(Base64.decode(this.chart['values.yaml'])) || {};
        }
        this.params = this.retrieveBasicFormParams(this.appValues, this.schemaJson);
      },

      async deployMiddlewareMetricsServiceMonitor() {
        if (this.$refs.form.validate(true) && this.$refs.jsonSchema.validate()) {
          if (this.env?.projectid && this.env?.value) {
            const appName = this.obj.appName;
            if (Object.prototype.hasOwnProperty.call(this.appValues, 'nameOverride')) {
              this.appValues.nameOverride = appName;
            }
            if (Object.prototype.hasOwnProperty.call(this.appValues, 'fullnameOverride')) {
              this.appValues.fullnameOverride = appName;
            }
            const data = {
              name: appName,
              project_id: this.env?.projectid,
              environment_id: this.env?.value,
              repoURL: this.chart.repo || 'kubegems_online_store',
              chart: this.chartName,
              chartVersion: this.chart.version,
              tenant_id: this.Tenant().ID,
              values: this.appValues,
            };
            await postDeployAppStore(this.Tenant().ID, this.env?.projectid, this.env?.value, data);
            this.$emit('close');
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: '请先选择项目环境',
              color: 'warning',
            });
          }
        }
      },
      async addData() {
        await this.deployMiddlewareMetricsServiceMonitor();
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
      changeBasicFormParam(param, value) {
        // Change raw values 修改原始值, 返回的是字符串
        this.appValues = this.setValue(this.appValues, param.path, value);
        this.reRender();
      },
      reRender() {
        this.params = [];
        this.params = this.retrieveBasicFormParams(this.appValues, this.schemaJson);
      },
    },
  };
</script>
