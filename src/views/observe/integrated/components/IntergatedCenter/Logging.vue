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
  <div class="pa-3">
    <BaseSubTitle class="my-0" color="grey lighten-3" :divider="false" :title="$t('tip.log_config')" />

    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="logging" />

      <v-row class="px-2">
        <v-col cols="12">
          <v-switch v-model="sampleMode" class="mt-5" hide-details :label="$t('tip.sample_log')" />
        </v-col>
      </v-row>

      <template v-if="!sampleMode">
        <BaseSubTitle class="mt-6" :title="$t('tip.diy_config')" />

        <v-row class="mt-0 px-2">
          <v-col cols="6">
            <v-autocomplete
              v-model="application"
              class="my-0"
              color="primary"
              hide-selected
              :items="applicationItems"
              :label="$t('tip.related_app')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.appRules"
              @change="onApplicationChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="6">
            <v-autocomplete
              v-model="outputName"
              class="my-0"
              color="primary"
              hide-selected
              :items="outputItems"
              :label="$t('tip.related_output')"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
              }"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.outputRules"
              @change="onOutputChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" :disabled="item.disabled" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12">
            <v-switch v-model="throttle" class="mt-5" hide-details :label="$t('tip.enable_throttle')" />
          </v-col>

          <v-col v-if="throttle" cols="6">
            <v-text-field
              v-model.number="obj.pluginConfig.throttle"
              class="my-0"
              :label="$t('tip.throttle')"
              required
              :rules="objRules.throttleRules"
              :suffix="$t('tip.item_pre_minute')"
              type="number"
            />
          </v-col>

          <v-col cols="12">
            <v-switch v-model="obj.enableMetrics" class="mt-5" hide-details :label="$t('tip.enable_log_monitor')" />
          </v-col>
        </v-row>
      </template>
    </v-form>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import ProjectEnvSelect from './ProjectEnvSelect';
  import {
    getClusterOutputsData,
    getLoggingAppList,
    getOutputsData,
    getOutputsDataByTenant,
    postLoggingFlow,
    putLoggingNsFlow,
  } from '@/api';
  import { integer, required } from '@/utils/rules';

  export default {
    name: 'Logging',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelect,
    },
    data() {
      return {
        valid: false,
        env: undefined,
        throttle: false,
        sampleMode: true,
        outputItems: [],
        outputName: undefined,
        applicationItems: [],
        application: undefined,
        applicationStatus: {},
        obj: {
          apps: {},
          clusterOutputs: [],
          enableMetrics: false,
          pluginConfig: {
            geoIPLookupKeys: [],
            throttle: 0,
          },
          outputs: [],
        },
        objRules: {
          appRules: [required],
          outputRules: [required],
          throttleRules: [integer],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      output() {
        return this.outputItems.find((o) => {
          return o.value === this.outputName;
        });
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.loggingAppList();
            this.logOutputList();
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.obj = this.$options.data().obj;
        this.$refs.form?.resetValidation();
      });
    },
    methods: {
      async loggingAppList() {
        const data = await getLoggingAppList(this.env.clusterName, this.env.namespace);
        this.applicationItems = Object.keys(data).map((d) => {
          return {
            text: `${d}${data[d].collectedBy ? `(${$t('tip.added_log_collect')})` : ''}`,
            value: d,
            disabled: data[d].collectedBy,
          };
        });
        this.applicationStatus = data;
      },
      async logOutputList() {
        let list = [];
        let res = [];
        const params = [this.env.clusterName, '_all', { page: 1, size: 1000 }];
        const outputFunc = this.AdminViewport ? getOutputsData : getOutputsDataByTenant;
        const funcParams = this.AdminViewport ? params : [this.env.clusterName, this.Tenant().TenantName];
        res = await Promise.all([outputFunc(...funcParams), getClusterOutputsData(...params)]);
        list = res.reduce((pre, current) => pre.concat(current.List || current), []);

        this.outputItems = list.map((op) => {
          return {
            text: `${op.metadata.name} (${this.getOutputKind(op.spec)})`,
            value: op.metadata.name,
            kind: op.kind,
          };
        });
      },
      getOutputKind(spec) {
        if (spec.loki) {
          return 'Loki';
        }
        if (spec.elasticsearch) {
          return 'Elasticsearch';
        }
        if (spec.kafka) {
          return 'Kafka';
        }
      },
      onApplicationChange() {
        this.obj.apps[this.application] = this.applicationStatus[this.application]?.appLabel;
      },
      onOutputChange() {
        if (this.output?.kind === 'Output') {
          this.obj.outputs = [this.outputName];
        } else if (this.output?.kind === 'ClusterOutput') {
          this.obj.clusterOutputs = [this.outputName];
        }
      },
      async addLoggingFlow() {
        if (this.$refs.form.validate(true)) {
          if (this.env?.projectid && this.env?.value) {
            await postLoggingFlow(this.env.clusterName, this.env.namespace, this.obj);
            this.$emit('close');
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_project_environment'),
              color: 'warning',
            });
          }
        }
      },
      async addData() {
        if (this.sampleMode) {
          await this.addSampleLoggingFlow();
        } else {
          await this.addLoggingFlow();
        }
      },
      async addSampleLoggingFlow() {
        if (this.env?.projectid && this.env?.value) {
          this.$store.commit('SET_CONFIRM', {
            title: $t('tip.sample'),
            content: {
              text: `${this.sampleMode ? $t('operate.open') : $t('operate.close')} ${$t('tip.sample')}`,
              type: 'confirm',
            },
            param: {},
            doFunc: async () => {
              await this.toggleLoggingNsFlow();
            },
          });
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_project_environment'),
            color: 'warning',
          });
          return;
        }
      },
      async toggleLoggingNsFlow() {
        await putLoggingNsFlow(this.env.clusterName, this.env.namespace, {
          enable: this.sampleMode,
        });
      },
    },
  };
</script>
