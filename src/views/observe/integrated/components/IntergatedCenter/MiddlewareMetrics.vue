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
            <div>
              <div class="timeline__title font-weight-normal mb-3"> {{ $t('tip.instance_status') }} </div>
              <div
                class="timeline__div"
                v-html="$t('tip.cpnfirm_project_and_env', [env ? env.projectName : '', env ? env.environmentName : ''])"
              />
              <div class="timeline__div">
                {{ `${appName}-metrics-obs-${randomStr}` }}
                <v-icon
                  :class="{ 'kubegems__waiting-circle-flashing': appStatus !== 'Healthy', 'ml-2': true }"
                  color="success"
                >
                  {{ appStatus !== 'Healthy' ? 'mdi-autorenew' : 'mdi-check-circle' }}
                </v-icon>
                <span class="px-1">{{ appStatus }}</span>
              </div>
              <div class="timeline__div" @click="toApp" v-html="$t('tip.link_2_app')" />
            </div>

            <template #icon>
              <v-icon color="white"> mdi-numeric-1-circle </v-icon>
            </template>
          </v-timeline-item>

          <v-timeline-item class="timeline__item" color="success">
            <div>
              <div class="timeline__title font-weight-normal mb-3"> {{ $t('tip.data_status') }} </div>
              <div class="timeline__div">
                {{ $t('tip.data_from_prometheus') }}
                <v-btn
                  v-if="deployStatus !== 'up'"
                  class="my-2"
                  color="primary"
                  depressed
                  :disabled="appStatus !== 'Healthy'"
                  :loading="loading"
                  small
                  @click="getServiceMonitorStatus"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  {{ $t('operate.refresh_middleware_status') }}
                </v-btn>
              </div>
              <div class="timeline__div mt-3">
                <div
                  v-if="deployStatus !== 'up'"
                  class="v-alert v-sheet theme--dark v-alert--border v-alert--dense v-alert--border-left yellow-bg py-2"
                  mdxtype="Alert"
                  role="alert"
                >
                  <div class="v-alert__wrapper">
                    <i
                      aria-hidden="true"
                      class="v-icon notranslate v-alert__icon mdi mdi-alert theme--dark warning--text"
                    />
                    <div class="v-alert__content warning--text"> {{ $root.$t('data.no_data') }} </div>
                    <div class="v-alert__border v-alert__border--left" />
                  </div>
                </div>
                <div
                  v-else
                  class="v-alert v-sheet theme--dark v-alert--border v-alert--dense v-alert--border-left success py-2"
                  mdxtype="Alert"
                  role="alert"
                >
                  <div class="v-alert__wrapper">
                    <i
                      aria-hidden="true"
                      class="v-icon notranslate v-alert__icon mdi mdi-check theme--dark white--text"
                    />
                    <div class="v-alert__content white--text"> {{ $t('tip.success_data') }} </div>
                    <div class="v-alert__border v-alert__border--left" />
                  </div>
                </div>
              </div>
            </div>

            <template #icon>
              <v-icon color="white"> mdi-numeric-2-circle </v-icon>
            </template>
          </v-timeline-item>
          <v-timeline-item class="timeline__item" color="success">
            <div>
              <div class="timeline__title font-weight-normal mb-3"> Explore </div>
              <div class="timeline__div" @click="toMetrics" v-html="$t('tip.preview_data')" />
            </div>

            <template #icon>
              <v-icon color="white"> mdi-numeric-3-circle </v-icon>
            </template>
          </v-timeline-item>
        </v-timeline>
      </template>
      <template v-else>
        <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="metrics" />
        <v-form ref="schemaForm" v-model="valid" class="px-2 ma-0" lazy-validation @submit.prevent>
          <v-flex class="pa-0 ma-0">
            <BaseParam
              v-for="(param, index) in params"
              :id="`p${index}`"
              :key="`p${index}`"
              :all-params="params"
              :app-values="appValues"
              class="mt-0"
              :cluster-name="env ? env.clusterName : ''"
              :param="param"
              v-bind="$attrs"
              v-on="$listeners"
              @changeBasicFormParam="changeBasicFormParam"
            />
          </v-flex>
        </v-form>
      </template>
    </v-form>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import ProjectEnvSelect from './ProjectEnvSelect';
  import {
    getAppStoreRunningDetail,
    getChartSchema,
    getServiceMonitorStatus,
    postDeployAppStore,
    postImportPrometheusRule,
  } from '@/api';
  import { randomString } from '@/utils/helpers';
  import { retrieveFromSchema } from '@/utils/schema';
  import { deleteValue, setValue } from '@/utils/yaml';

  export default {
    name: 'MiddlewareMetrics',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelect,
    },
    props: {
      appName: {
        type: String,
        default: () => '',
      },
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
      ...mapState(['Scale', 'AdminViewport']),
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
        this.params = retrieveFromSchema(this.appValues, this.schemaJson);
      },

      async deployMiddlewareMetricsServiceMonitor() {
        if (this.$refs.form.validate(true) && this.$refs.schemaForm.validate()) {
          if (this.env?.projectid && this.env?.value) {
            const appName = `${this.appName}-metrics-obs-${this.randomStr}`;
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

            this.deploying = true;
            this.$emit('deploying');

            // 添加告警规则
            if (this.chart?.['alerts.yaml']) {
              try {
                const alertsYaml = Base64.decode(this.chart['alerts.yaml'])
                  .replaceAll('__namespace__', this.env?.namespace)
                  .replaceAll('__fullname__', appName)
                  .replaceAll(new RegExp('name: ([\\w-_]+)', 'g'), `name: $1-${this.randomStr}`);
                await postImportPrometheusRule(this.env?.clusterName, this.env?.namespace, alertsYaml);
              } catch {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.add_alert_failed'),
                  color: 'warning',
                });
              }
            }

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
        } else if (operate === 'set') {
          this.appValues = setValue(this.appValues, path, value);
        }
        this.reRender();
      },
      reRender() {
        this.params = [];
        this.params = retrieveFromSchema(this.appValues, this.schemaJson);
      },
      async getAppStatus() {
        const data = await getAppStoreRunningDetail(
          this.Tenant().ID,
          this.env.projectid,
          this.env.value,
          `${this.appName}-metrics-obs-${this.randomStr}`,
          {
            watch: false,
          },
        );
        this.appStatus = data?.health?.status;
      },
      async getServiceMonitorStatus() {
        this.loading = true;
        const data = await getServiceMonitorStatus(this.env.clusterName, this.env.namespace, {
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
            name: `${this.appName}-metrics-obs-${this.randomStr}`,
            tenant: this.Tenant().TenantName,
            project: this.env.projectName,
            environment: this.env.environmentName,
          },
          query: {
            kind: 'appstore',
            name: `${this.appName}-metrics-obs-${this.randomStr}`,
            type: 'Deployment',
            projectid: this.env.projectid,
            environmentid: this.env.value,
            tenantid: this.Tenant().ID,
          },
        });
      },
      toMetrics() {
        if (this.AdminViewport) {
          this.$router.push({
            name: 'admin-observe-monitor-metrics',
          });
        } else {
          this.$router.push({
            name: 'observe-monitor-metrics',
            params: {
              tenant: this.Tenant().TenantName,
            },
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .timeline {
    &__item {
      padding-bottom: 60px;
    }

    &__title {
      font-weight: 600;
      padding-bottom: 0.3em;
      font-size: 1.5em;
      border-bottom: 1px solid hsla(210, 18%, 87%, 1);
    }

    &__div {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji';
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      color: #24292f;
    }
  }

  .v-alert__content {
    font-size: 14px;
  }
  .yellow-bg {
    background-color: rgb(253, 242, 231);
  }
</style>
