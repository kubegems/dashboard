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
  <div>
    <BaseSubTitle :title="$t('tip.base_config')" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.kind"
            class="my-0"
            color="primary"
            hide-selected
            :items="typeItems"
            :label="$root.$t('resource.type')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.kindRules"
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
            v-model="obj.metadata.name"
            class="my-0"
            :label="$t('table.name')"
            :readonly="edit"
            required
            :rules="objRules.nameRules"
          />
        </v-col>

        <v-col cols="6">
          <v-select
            v-model="plugin"
            class="my-0"
            color="primary"
            hide-selected
            :items="pluginItems"
            :label="$t('tip.plugin_type')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.pluginRules"
            @change="onPluginChange"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <component :is="formComponent" :ref="formComponent" :edit="true" :item="obj" />
    </v-form>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import Elasticsearch from './Elasticsearch';
  import Kafka from './Kafka';
  import Loki from './Loki';
  import { deepCopy } from '@/utils/helpers';
  import { SERVICE_LOGGING_NS } from '@/utils/namespace';
  import { required } from '@/utils/rules';

  export default {
    name: 'OutputBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      Elasticsearch,
      Loki,
      Kafka,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      this.pluginItems = [
        { text: 'Loki', value: 'loki' },
        { text: 'Kafka', value: 'kafka' },
        { text: 'Elasticsearch', value: 'elasticsearch' },
      ];

      return {
        valid: false,
        obj: {
          apiVersion: 'logging.banzaicloud.io/v1beta1',
          kind: 'Output',
          metadata: {
            name: '',
            labels: {},
          },
          spec: {},
        },
        plugin: undefined,
        objRules: {
          kindRules: [required],
          nameRules: [required],
          pluginRules: [required],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'ApiResources']),
      typeItems() {
        return [{ text: 'Output', value: 'Output' }].concat(
          this.$route.query.namespace === SERVICE_LOGGING_NS ? [{ text: 'ClusterOutput', value: 'ClusterOutput' }] : [],
        );
      },
      formComponent() {
        return this.pluginItems.find((p) => {
          return p.value === this.plugin;
        })?.text;
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['output'] || 'logging.banzaicloud.io/v1beta1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      loadData() {
        this.$nextTick(() => {
          if (!this.item) {
            this.$refs.form.resetValidation();
          } else {
            this.obj = deepCopy(this.item);
            this.getPlugin();
          }
        });
      },
      reset() {
        this.$refs.form && this.$refs.form.resetValidation();
        this.$refs[this.formComponent] && this.$refs[this.formComponent].reset();
        this.obj = this.$options.data().obj;
      },
      validate() {
        return (
          this.$refs.form &&
          this.$refs.form.validate(true) &&
          this.$refs[this.formComponent] &&
          this.$refs[this.formComponent].validate()
        );
      },
      onPluginChange(value) {
        this.pluginItems.forEach((plugin) => {
          delete this.obj.spec[plugin.value];
        });
        this.obj.spec[value] = {};
        if (value === 'kafka') {
          this.obj.spec[value].brokers = '';
          this.obj.spec[value].format = { type: 'json' };
        }
      },
      checkSaved() {
        return true;
      },
      setData(data) {
        this.obj = data;
        this.getPlugin();
      },
      getData() {
        return this.obj;
      },
      getPlugin() {
        if (this.obj.spec.loki) {
          this.plugin = 'loki';
        } else if (this.obj.spec.kafka) {
          this.plugin = 'kafka';
        } else if (this.obj.spec.elasticsearch) {
          this.plugin = 'elasticsearch';
        }
      },
    },
  };
</script>
