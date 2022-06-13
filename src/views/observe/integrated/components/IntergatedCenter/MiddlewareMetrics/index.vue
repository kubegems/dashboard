<template>
  <div class="pa-2" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <BaseSubTitle title="监控采集配置" color="grey lighten-3" class="mx-2 mt-1" :divider="false" />

    <v-form v-model="valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" t="metrics" class="px-2 mt-0" />
      <JsonSchema
        ref="jsonSchema"
        class="px-2"
        :app-values="appValues"
        :params="params"
        :cluster-name="env ? env.clusterName : ''"
        @changeBasicFormParam="changeBasicFormParam"
      />
    </v-form>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { Base64 } from 'js-base64';
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import { postDeployAppStore, getChartSchema } from '@/api';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';
  import { YamlMixin } from '@/views/appstore/mixins/yaml';

  export default {
    name: 'MiddlewareMetrics',
    components: {
      ProjectEnvSelect,
      JsonSchema,
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
          this.appValues = this.$yamlload(Base64.decode(this.chart['values.yaml']));
        }
        this.params = this.retrieveBasicFormParams(this.appValues, this.schemaJson);
      },
      async deployMiddlewareMetricsServiceMonitor() {
        if (this.$refs.jsonSchema.validate()) {
          if (this.env?.projectid && this.env?.value) {
            const data = {
              name: this.chartName,
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
      // eslint-disable-next-line vue/no-unused-properties
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
