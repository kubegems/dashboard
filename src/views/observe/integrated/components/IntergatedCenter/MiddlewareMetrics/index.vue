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
  <div class="pa-2" :style="{ height: `${height}px`, overflowY: 'auto', overflowX: 'hidden' }">
    <BaseSubTitle class="mx-2 mt-1" color="grey lighten-3" :divider="false" :title="$t('tip.metrics_config')" />

    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <template v-if="deploying">
        <v-timeline align-top dense :style="{ width: '60%', paddingTop: '60px' }">
          <v-timeline-item class="timeline__item" color="success">
            <v-card class="elevation-2">
              <v-card-title class="text-body-1"> {{ $t('tip.integated_info') }} </v-card-title>
              <v-card-text>
                <div class="my-1">
                  {{ $root.$t('resource.project') }}
                  <div>{{ env ? env.projectName : '' }}</div>
                </div>
                <div class="my-1">
                  {{ $root.$t('resource.environment') }}
                  <div>{{ env ? env.environmentName : '' }}</div>
                </div>
                <div class="my-1">
                  {{ $t('tip.name') }}
                  <div>{{ `${obj.appName}-obs-${randomStr}` }}</div>
                </div>
                <div class="my-1">
                  {{ $t('tip.status') }}
                  <div>{{ appStatus }}</div>
                </div>
              </v-card-text>
            </v-card>

            <template #icon>
              <v-icon :class="{ 'kubegems__waiting-circle-flashing': appStatus !== 'Healthy' }" color="white">
                {{ appStatus !== 'Healthy' ? 'mdi-autorenew' : 'mdi-check' }}
              </v-icon>
            </template>
          </v-timeline-item>
          <v-timeline-item class="timeline__item" color="success">
            <v-card class="elevation-2">
              <v-card-title class="text-body-1"> {{ $t('tip.integated_status') }} </v-card-title>
              <v-card-text>
                <div v-if="deployStatus === 'up'" class="mb-2">
                  {{ $t('status.ready') }}
                </div>
                <div v-if="deployStatus === 'up'">
                  <v-icon color="success" size="28">mdi-check-circle</v-icon>
                </div>
                <v-btn
                  v-if="deployStatus !== 'up'"
                  class="my-2"
                  color="primary"
                  :disabled="appStatus !== 'Healthy'"
                  :loading="loading"
                  small
                  @click="getServiceMonitorStatus"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  {{ $t('operate.refresh_middleware_status') }}
                </v-btn>
              </v-card-text>
            </v-card>

            <template #icon>
              <v-icon
                :class="{ 'kubegems__waiting-circle-flashing': appStatus === 'Healthy' && deployStatus !== 'up' }"
                color="white"
              >
                {{
                  appStatus === 'Healthy'
                    ? deployStatus !== 'up'
                      ? 'mdi-autorenew'
                      : 'mdi-check'
                    : 'mdi-circle-slice-4'
                }}
              </v-icon>
            </template>
          </v-timeline-item>
          <v-timeline-item class="timeline__item" color="success">
            <v-card class="elevation-2">
              <v-card-title class="text-body-1"> {{ $t('tip.integated_complete') }} </v-card-title>
              <v-card-text @click="toApp" v-html="$t('tip.link_2_app')" />
            </v-card>

            <template #icon>
              <v-icon color="white">
                {{ deployStatus !== 'up' ? 'mdi-circle-slice-4' : 'mdi-check' }}
              </v-icon>
            </template>
          </v-timeline-item>
        </v-timeline>
      </template>
      <template v-else>
        <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="metrics" />
        <v-row class="px-2 mt-0">
          <v-col cols="6">
            <v-text-field v-model="obj.appName" :label="$t('tip.name')" :rules="objRules.appNameRule" />
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
      </template>
    </v-form>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../i18n';
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import { getChartSchema, postDeployAppStore, getServiceMonitorStatus, getAppStoreRunningDetail } from '@/api';
  import { randomString } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';
  import { YamlMixin } from '@/views/appstore/mixins/yaml';

  export default {
    name: 'MiddlewareMetrics',
    i18n: {
      messages: messages,
    },
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
      this.randomStr = randomString(4);

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
        deploying: false,
        deployStatus: 'deploying',
        lastError: '',
        loading: false,
        appStatus: 'Pending',
        appStatusInterval: undefined,
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
    destroyed() {
      if (this.appStatusInterval) {
        clearInterval(this.appStatusInterval);
        this.appStatusInterval = undefined;
      }
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
              name: `${appName}-obs-${this.randomStr}`,
              project_id: this.env?.projectid,
              environment_id: this.env?.value,
              repoURL: this.chart.repo || 'kubegems_online_store',
              chart: this.chartName,
              chartVersion: this.chart.version,
              tenant_id: this.Tenant().ID,
              values: this.appValues,
            };
            await postDeployAppStore(this.Tenant().ID, this.env?.projectid, this.env?.value, data);
            this.deploying = true;
            this.$emit('deploying');

            this.getAppStatus();
            this.appStatusInterval = setInterval(() => {
              this.getAppStatus();
              if (this.appStatus === 'Healthy') {
                clearInterval(this.appStatusInterval);
              }
            }, 1000 * 5);
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_project_environment'),
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
      async getAppStatus() {
        const data = await getAppStoreRunningDetail(
          this.Tenant().ID,
          this.env.projectid,
          this.env.value,
          `${this.obj.appName}-obs-${this.randomStr}`,
          {
            watch: false,
          },
        );
        this.appStatus = data?.health?.status;
      },
      async getServiceMonitorStatus() {
        this.loading = true;
        const data = await getServiceMonitorStatus(this.env.clusterName, this.env.environmentName, {
          service: this.appValues.nameOverride,
        });
        this.loading = false;
        this.deployStatus = data.health;
        this.lastError = data.lastError;
      },
      toApp() {
        this.$router.push({
          name: 'app-detail',
          params: {
            name: `${this.obj.appName}-obs-${this.randomStr}`,
            tenant: this.Tenant().TenantName,
            project: this.env.projectName,
            environment: this.env.environmentName,
          },
          query: {
            kind: 'appstore',
            name: `${this.obj.appName}-obs-${this.randomStr}`,
            type: 'Deployment',
            projectid: this.env.projectid,
            environmentid: this.env.value,
            tenantid: this.Tenant().ID,
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .timeline__item {
    padding-bottom: 60px;
  }
</style>
