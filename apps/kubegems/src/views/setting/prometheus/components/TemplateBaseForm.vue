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
    <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
      <v-flex :class="state.expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.template')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="i18nLocal.t('form.name')"
              :readonly="edit"
              required
              :rules="objRules.name"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.showName"
              class="my-0"
              :label="i18nLocal.t('form.show_name')"
              required
              :rules="objRules.showName"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="obj.description"
              auto-grow
              class="my-0"
              :label="i18nLocal.t('form.description')"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="obj.expr" auto-grow class="my-0" label="Expr" required :rules="objRules.expr" />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="label.labels"
              height="32"
              hide-no-data
              hide-selected
              :items="[]"
              :label="i18nLocal.t('form.label')"
              multiple
              :search-input.sync="label.labelText"
              @change="labelChanged"
              @keydown.enter="createLabel"
            >
              <template #selection="{ item }">
                <v-chip close close-icon="mdi-close-circle" color="primary" small @click:close="removeLabel(item)">
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
              :items="getUnitItems()"
              :label="i18nLocal.t('form.unit')"
              :no-data-text="i18n.t('data.no_data')"
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

<script lang="ts" setup>
  import { getUnitItems } from '@kubegems/api/hooks/metrics';
  import { PrometheusTemplate } from '@kubegems/api/typed/prometheus_template';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      item?: PrometheusTemplate;
      edit?: boolean;
    }>(),
    {
      item: undefined,
      edit: false,
    },
  );

  const state = reactive({
    valid: false,
    expand: false,
  });

  const obj = ref({
    name: '',
    showName: '',
    expr: '',
    labels: [],
    unit: '',
    description: '',
    resourceID: 0,
  });
  const objRules = {
    name: [required],
    showName: [required],
    expr: [required],
    description: [],
  };

  const label = reactive({
    labels: [],
    labelText: '',
  });
  const labelChanged = (): void => {
    const labels = label.labels.filter((label) => {
      return label !== '' && typeof label === 'object';
    });
    label.labels = labels;
  };

  const createLabel = (): void => {
    if (!label.labelText) return;
    const index = label.labels.length;
    label.labels.push({
      text: label.labelText,
      value: index,
    });
    label.labelText = '';
  };

  const removeLabel = (item): void => {
    const labels = label.labels.filter((label) => {
      return label.value !== item.value;
    });
    label.labels = labels;
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      obj.value = deepCopy(newValue);
      label.labels = obj.value.labels
        ? obj.value.labels.map((l, index) => {
            return { text: l, value: index };
          })
        : [];
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const form = ref(null);
  const reset = (): void => {
    form.value.reset();
  };

  const init = (data: PrometheusTemplate) => {
    obj.value = deepCopy(data);
  };

  const setData = (data: PrometheusTemplate): void => {
    obj.value = data;
  };

  const getData = (): PrometheusTemplate => {
    obj.value.labels = label.labels.map((l) => {
      return l.text;
    });
    return obj.value as PrometheusTemplate;
  };

  const validate = (): boolean => {
    return form.value.validate(true);
  };

  defineExpose({
    reset,
    init,
    setData,
    getData,
    validate,
  });
</script>
