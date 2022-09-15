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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.minitor_dashboard')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="obj.name" class="my-0" :label="$t('tip.name')" required :rules="objRules.nameRule" />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="variables"
            class="my-0"
            :label="$t('tip.global_var')"
            required
            @keyup="inputVariable"
          />
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            v-model="variableVal"
            class="my-0"
            color="primary"
            hide-selected
            :items="varItems"
            :label="$t('tip.global_var_val')"
            multiple
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.variableValRule"
          >
            <template #selection="{ item }">
              <v-chip close close-icon="mdi-close-circle" color="primary" label small @click:close="removeVal(item)">
                <span class="pr-2">{{ item.text }}</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <template v-if="!edit">
          <v-col cols="12">
            <v-switch v-model="tamplate" hide-details :label="$t('tip.from_template')" />
          </v-col>
          <v-col v-if="tamplate" cols="12">
            <v-autocomplete
              v-model="obj.template"
              class="my-0"
              color="primary"
              hide-selected
              :items="templateItems"
              :label="$t('tip.template')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.templateRule"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { getMonitorDashboardTemplate, getMetricsLabelValues } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'DashboardBaseForm',
    i18n: {
      messages: messages,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      env: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        tamplate: false,
        templateItems: [],
        varItems: [],
        variables: '',
        variableVal: [],
        obj: {
          name: '',
          template: '',
          variables: {},
        },
        objRules: {
          nameRule: [required],
          templateRule: [required],
          variableValRule: [required],
        },
        inputTimeout: null,
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            const keys = this.obj.variables ? Object.keys(this.obj.variables) : [];
            if (keys.length > 0) {
              this.variables = keys[0];
              this.variableVal = this.obj.variables[this.variables].split(',').filter((v) => {
                return Boolean(v);
              });
              this.monitorGlobalVariable();
            }
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.monitorDashboardTemplateList();
      });
    },
    methods: {
      async monitorDashboardTemplateList() {
        const data = await getMonitorDashboardTemplate({ size: 1000 });
        if (data) {
          this.templateItems = data.List.map((d) => {
            return { text: d.name, value: d.name };
          });
        }
      },
      inputVariable() {
        if (this.inputTimeout) {
          clearTimeout(this.inputTimeout);
        }
        this.inputTimeout = setTimeout(() => {
          this.monitorGlobalVariable();
          clearTimeout(this.inputTimeout);
        }, 200);
      },
      async monitorGlobalVariable() {
        const data = await getMetricsLabelValues(this.env?.clusterName, this.env?.environmentName, {
          noprocessing: true,
          label: this.variables,
          expr: `{namespace="${this.env?.namespace}"}`,
        });
        const items = data.map((d) => {
          return {
            text: d,
            value: d,
          };
        });
        this.varItems = items;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        if (!this.obj.variables) {
          this.obj.variables = {};
        }
        this.obj.variables[this.variables] = this.variableVal.join(',');
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      removeVal(item) {
        const index = this.variableVal.findIndex((v) => {
          return v === item.value;
        });
        if (index > -1) {
          this.variableVal.splice(index, 1);
        }
      },
    },
  };
</script>
