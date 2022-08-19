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
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.template')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('form.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.showName"
              class="my-0"
              :label="$t('form.show_name')"
              required
              :rules="objRules.showNameRule"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="obj.description" auto-grow class="my-0" :label="$t('form.description')" required />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="obj.expr" auto-grow class="my-0" label="Expr" required :rules="objRules.exprRule" />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="labels"
              height="32"
              hide-no-data
              :items="[]"
              :label="$t('form.label')"
              multiple
              :search-input.sync="labelText"
              @change="onLabelChange"
              @keydown.enter="createLabel"
            >
              <template #selection="{ item }">
                <v-chip close close-icon="mdi-close-circle" color="primary" small @click.close="removeLabel(item)">
                  <span>
                    {{ item.text }}
                  </span>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="obj.unit"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_metrics_unitItems"
              :label="$t('form.unit')"
              :no-data-text="$root.$t('data.no_data')"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  <span>
                    {{ item['text'] }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import messages from '../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'TemplateBaseForm',
    i18n: {
      messages: messages,
    },
    mixins: [Metrics],
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
    data: () => ({
      valid: false,
      expand: false,
      labels: [],
      labelText: '',
      obj: {
        name: '',
        showName: '',
        expr: '',
        labels: [],
        unit: '',
        description: '',
        resourceID: 0,
      },
    }),
    computed: {
      objRules() {
        return {
          nameRule: [required],
          showNameRule: [required],
          exprRule: [required],
          descriptionRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          if (this.item) {
            this.obj = deepCopy(this.item);
            this.labels = this.obj.labels
              ? this.obj.labels.map((l, index) => {
                  return { text: l, value: index };
                })
              : [];
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onLabelChange() {
        const labels = this.labels.filter((label) => {
          return label !== '' && typeof label === 'object';
        });
        this.labels = labels;
      },
      createLabel() {
        if (!this.labelText) return;
        const index = this.labels.length;
        this.labels.push({
          text: this.labelText,
          value: index,
        });
        this.labelText = '';
      },
      removeLabel(item) {
        const labels = this.labels.filter((label) => {
          return label.value !== item.value;
        });
        this.labels = labels;
      },
      reset() {
        this.$refs.form.reset();
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        this.obj.labels = this.labels.map((l) => {
          return l.text;
        });
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
