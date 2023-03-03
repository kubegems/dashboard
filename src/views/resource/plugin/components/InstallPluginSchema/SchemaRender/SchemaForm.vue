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
    <v-form ref="schemaForm" v-model="valid" class="px-2 ma-0" lazy-validation @submit.prevent>
      <v-flex class="pa-0 ma-0">
        <BaseParam
          v-for="(param, index) in params"
          :id="`p${index}`"
          :key="`p${index}`"
          :all-params="params"
          :app-values="appValues"
          class="mt-0"
          :cluster-name="Cluster().ClusterName"
          :param="param"
          v-bind="$attrs"
          v-on="$listeners"
          @changeBasicFormParam="changeBasicFormParam"
        />
      </v-flex>
    </v-form>
    <v-card v-if="!params || params.length === 0" flat :style="{ marginTop: '250px' }">
      <v-card-text class="pa-5 text-center">
        <Icon class="ml-0 warning--text" height="70px" icon="mdi:alert-circle" width="70px" />
        <h4 class="text-h6 mt-3 mb-8">{{ $t('tip.no_params') }}</h4>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { retrieveFromSchema } from '@/utils/schema';
  import { deleteValue, setValue } from '@/utils/yaml';

  export default {
    name: 'SchemaForm',
    i18n: {
      messages: messages,
    },
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
        i18nDict: {
          ja: 'jp',
          en: 'en',
        },
      };
    },
    computed: {
      ...mapState(['Scale', 'Locale']),
      ...mapGetters(['Cluster']),
      height() {
        return (window.innerHeight - 132) / this.Scale;
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
        return this.$refs.schemaForm.validate();
      },
      getData() {
        this.obj.values = deepCopy(this.appValues);
        return this.obj;
      },
      async renderSchema() {
        this.appValues = this.item.values;
        this.schemaJson = JSON.parse(this.item.files?.['values.schema.json'] || '{}');

        if (this.Locale !== 'zh-Hans' && this.Locale !== 'zh-Hant') {
          if (this.item.files?.[`i18n/values.schema.${this.i18nDict[this.Locale] || 'en'}.json`]) {
            const enSchemaJson = JSON.parse(
              this.item.files?.[`i18n/values.schema.${this.i18nDict[this.Locale] || 'en'}.json`] || '{}',
            );
            this.schemaJson = Object.assign(this.schemaJson, enSchemaJson);
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.no_i18n_file'),
              color: 'warning',
            });
          }
        }

        this.params = retrieveFromSchema(this.appValues, this.schemaJson);
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
      reset() {
        this.appValues = {};
        this.params = [];
        this.obj = {};
      },
    },
  };
</script>
