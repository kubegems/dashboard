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
          <v-switch v-model="template" hide-details :label="$t('tip.from_template')" :readonly="edit" />
        </v-col>
        <v-col v-if="template" cols="12">
          <v-autocomplete
            v-model="obj.template"
            class="my-0"
            color="primary"
            hide-selected
            :items="templateItems"
            :label="$t('tip.template')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.templateRule"
            @change="onTemplateChange"
          >
            <template #item="{ item }">
              <BaseLogo class="mr-2" :icon-name="item.value" :ml="0" :mt="1" :width="20" />
              {{ item.text }}
            </template>
            <template #selection="{ item }">
              <v-chip color="primary" small>
                <BaseLogo class="mr-2" :icon-name="item.value" :ml="0" :mt="1" :width="20" />
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12">
          <v-switch v-model="globalVariable" class="float-left" hide-details :label="$t('tip.global_var')" />
          <span class="orange--text ml-2">
            <v-icon color="orange" right small> mdi-information-variant </v-icon>
            {{ $t('tip.global_var_tip') }}
          </span>
        </v-col>

        <template v-if="globalVariable">
          <v-col cols="12">
            <v-autocomplete
              v-model="variables"
              class="my-0"
              color="primary"
              hide-selected
              :items="variableItems"
              :label="$t('tip.global_var')"
              :no-data-text="$root.$t('data.no_data')"
              :search-input.sync="variableText"
              @change="onVariableChange"
              @keyup.enter="inputVariable"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small>
                  <span>{{ item.text }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12">
            <VariableSelect
              v-model="variableVal"
              :edit="edit"
              :form-variables="variableVal"
              in-form
              :variable-select-items="variableSelectItems"
              :width="400"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { getMetricsLabelValues, getMonitorDashboardTemplate } from '@kubegems/api/direct';
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';

  import messages from '../../i18n';
  import VariableSelect from './VariableSelect';
  import { convertResponse2List } from '@kubegems/api/utils';

  export default {
    name: 'DashboardBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      VariableSelect,
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
        template: false,
        templateItems: [],
        varItems: [],
        variables: '',
        variableVal: [],
        variableText: '',
        obj: {
          name: '',
          template: '',
          variables: {},
        },
        objRules: {
          nameRule: [required],
          templateRule: [required],
        },
        inputTimeout: null,
        globalVariable: false,
      };
    },
    computed: {
      variableItems() {
        let t = null;
        if (this.template) {
          t = this.templateItems.find((t) => {
            return t.name === this.obj.template;
          });
        } else {
          t = {
            variables: {},
          };
        }
        if (t) {
          const variableItems = t.variables ? Object.keys(t?.variables || {}) : [];
          return variableItems.concat(this.variables ? [this.variables] : []).map((v) => {
            return { text: v, value: v };
          });
        }
        return [];
      },
      variableSelectItems() {
        return this.varItems.map((v) => {
          return v.value;
        });
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            if (this.obj.template) {
              this.template = true;
            }
            this.globalVariable = this.obj.variables && Object.keys(this.obj?.variables || {}).length > 0;
            const keys = this.obj.variables ? Object.keys(this.obj?.variables || {}) : [];
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
          this.templateItems = convertResponse2List(data).map((d) => {
            return { text: d.name, value: d.name, ...d };
          });
        }
      },
      inputVariable() {
        if (
          this.variableItems.findIndex((v) => {
            return v.value === this.variableText?.trim() || [];
          }) === -1
        ) {
          this.variables = this.variableText?.trim() || [];
          this.onVariableChange();
        }
      },
      onVariableChange() {
        if (this.inputTimeout) {
          clearTimeout(this.inputTimeout);
        }
        this.inputTimeout = setTimeout(() => {
          this.variableVal = [];
          this.monitorGlobalVariable();
          clearTimeout(this.inputTimeout);
        }, 200);
      },
      async monitorGlobalVariable() {
        const data = await getMetricsLabelValues(this.env?.clusterName, this.env?.namespace, {
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
        if (this.globalVariable && this.variables) {
          this.obj.variables = {};
          this.obj.variables[this.variables] = this.variableVal.join(',');
        } else {
          this.obj.variables = null;
        }
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
        this.variableVal = [];
        this.variables = '';
        this.globalVariable = false;
        this.template = false;
      },
      onTemplateChange() {
        this.globalVariable = this.variableItems.length > 0;
      },
    },
  };
</script>
