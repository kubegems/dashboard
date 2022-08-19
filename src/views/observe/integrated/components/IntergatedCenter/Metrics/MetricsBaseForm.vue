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
  <div class="pa-3 pt-0">
    <BaseSubTitle class="my-0" color="grey lighten-3" :divider="false" :title="$t('tip.metrics_config')" />

    <v-form ref="form" v-model="valid" class="px-2" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="mt-0" t="metrics" />

      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.service"
            class="my-0"
            color="primary"
            hide-selected
            :items="serviceItems"
            :label="$t('tip.related_service')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.serviceRules"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6">
          <div :style="{ lineHeight: '66px' }">
            <v-icon small> mdi-help-circle </v-icon>
            <span @click="toAppstore" v-html="$t('tip.no_service_tip')" />
          </div>
        </v-col>

        <v-col cols="6">
          <v-autocomplete
            v-model="obj.port"
            class="my-0"
            color="primary"
            hide-selected
            :items="portItems"
            :label="$t('tip.servicemonitor_port')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.portRules"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6">
          <v-text-field
            v-model="obj.path"
            class="my-0"
            :label="$t('tip.request_path')"
            required
            :rules="objRules.pathRules"
          />
        </v-col>
      </v-row>
    </v-form>

    <BaseSubTitle class="my-0 mt-3" color="grey lighten-3" :divider="false" :title="$t('tip.metrics')" />
    <MetricsList />
  </div>
</template>

<script>
  import messages from '../../../i18n';
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import MetricsList from './MetricsList';
  import { getServiceList, postServiceMonitor } from '@/api';
  import { required } from '@/utils/rules';

  export default {
    name: 'MetricsBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      MetricsList,
      ProjectEnvSelect,
    },
    data() {
      return {
        valid: false,
        env: undefined,
        serviceItems: [],
        obj: {
          path: undefined,
          port: undefined,
          service: undefined,
        },
        objRules: {
          pathRules: [required],
          portRules: [required],
          serviceRules: [required],
        },
      };
    },
    computed: {
      portItems() {
        const service = this.serviceItems.find((s) => {
          return s.value === this.obj.service;
        });
        if (service) {
          const ports = service.model.spec?.ports;
          if (ports) {
            return ports.map((p) => {
              return {
                text: `${p.name} (${p.port})`,
                value: p.name,
              };
            });
          }
          return [];
        }
        return [];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.serviceList();
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
      toAppstore() {
        this.$router.push({ name: 'appstore-center' });
      },
      async serviceList() {
        const data = await getServiceList(this.env.clusterName, this.env.namespace, { size: 1000 });
        this.serviceItems = data.List.map((s) => {
          return {
            text: s.metadata.name,
            value: s.metadata.name,
            model: s,
          };
        });
      },
      async addMetrics() {
        if (this.$refs.form.validate(true)) {
          if (this.env?.projectid && this.env?.value) {
            await postServiceMonitor(this.env.clusterName, this.env.namespace, this.obj);
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
        await this.addMetrics();
      },
    },
  };
</script>
