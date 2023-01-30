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
  <v-form ref="form" v-model="state.valid" class="my-2" lazy-validation>
    <v-expand-transition>
      <v-card v-show="state.expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
              <span>{{ i18nLocal.t('tip.label_match') }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.name"
                color="primary"
                hide-selected
                :items="labelItems"
                :label="i18nLocal.t('tip.label')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRule.nameRules"
                @change="nameChanged"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.type"
                color="primary"
                hide-selected
                :items="typeItems"
                :label="i18nLocal.t('tip.operate')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRule.typeRules"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__long-width">
              <v-autocomplete
                v-model="labelValues"
                color="primary"
                hide-selected
                :items="labelValueItems"
                :label="i18nLocal.t('tip.label_value')"
                multiple
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRule.valueRules"
                :search-input.sync="valueText"
                @change="labelValueChanged"
                @keyup.enter="createLabelValue"
              >
                <template #selection="{ item }">
                  <v-chip
                    class="mx-1"
                    close
                    close-icon="mdi-close-circle"
                    color="primary"
                    small
                    @click:close="removeLabelValue(item)"
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ i18n.t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ i18n.t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, reactive, ref } from 'vue';

  import { useI18n } from '../../../../../i18n';
  import { useRoute } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { PrometheusRule } from '@/types/prometheus_rule';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const route = useRoute();

  type Matcher = {
    index?: number;
    type?: string;
    name?: string;
    value?: string;
  };

  const props = withDefaults(
    defineProps<{
      labelMatchers?: Matcher[];
      labels?: { [key: string]: any };
      promqlGenerator?: any;
      mode: string;
    }>(),
    {
      labelMatchers: undefined,
      labels: undefined,
      promqlGenerator: undefined,
      mode: 'monitor',
    },
  );

  const labelItems: ComputedRef<{ [key: string]: string }[]> = computed(() => {
    return Object.keys(props.labels || {}).map((l) => {
      return { text: l, value: l };
    });
  });

  const state = reactive({
    valid: false,
    expand: false,
  });

  const typeItems: { [key: string]: string }[] = [
    { text: '=', value: '=' },
    { text: '!=', value: '!=' },
    { text: '=~', value: '=~' },
    { text: '!~', value: '!~' },
  ];

  let obj = reactive<Matcher>({ index: -1, type: '', name: '', value: '' });
  const objRule = reactive({ typeRules: [required], nameRules: [required], valueRules: [required] });

  const form = ref(null);
  const emits = defineEmits(['closeOverlay', 'addData']);

  const init = async (data: Matcher): Promise<void> => {
    obj = Object.assign(obj, data);
    state.expand = true;
    form.value.resetValidation();
    if (obj.value) {
      await nameChanged();
      labelValues.value = obj.value.split('|');
      labelValues.value.forEach((val) => {
        if (
          !labelValueItems.value.find((item) => {
            return item.value === val;
          })
        ) {
          labelValueItems.value.push({
            text: val,
            value: val,
          });
        }
      });
    }
  };

  const addData = () => {
    if (form.value.validate(true)) {
      const labelMatchers = deepCopy(props.labelMatchers);
      const newObj = {
        name: obj.name,
        value: obj.value,
        type: obj.type,
      };
      if (obj.index === -1) {
        labelMatchers.push(newObj);
      } else {
        labelMatchers[obj.index] = newObj;
      }
      emits('addData', labelMatchers);
      closeCard();
    }
  };

  const closeCard = () => {
    state.expand = false;
    form.value.reset();
    obj.index = -1;
    emits('closeOverlay');
  };

  const expandCard = (): void => {
    state.expand = true;
  };

  const labelValues = ref<string[]>([]);
  const labelValueItems = ref<{ [key: string]: string }[]>([]);
  const valueText = ref<string>('');
  const nameChanged = async (): Promise<void> => {
    let params = {};
    if (props.mode === 'monitor') {
      params = {
        label: obj.name,
        scope: props.promqlGenerator?.scope || null,
        resource: props.promqlGenerator?.resource || null,
        rule: props.promqlGenerator?.rule || null,
        unit: props.promqlGenerator?.unit || null,
      };
    } else {
      params = {
        label: obj.name,
        match: `{namespace="${route.query.namespace}"}`,
      };
    }
    const data: string[] = await new PrometheusRule({
      cluster: route.query.cluster,
      namespace: route.query.namespace,
      alertType: props.mode,
    }).getLabelValues(params);
    labelValueItems.value = data.map((d) => {
      return { text: d, value: d };
    });
  };
  const labelValueChanged = (): void => {
    obj.value = labelValues.value.join('|');
  };
  const createLabelValue = (): void => {
    if (
      !labelValueItems.value.find((val) => {
        return val.value === valueText.value.trim();
      })
    ) {
      labelValueItems.value.push({
        text: valueText.value.trim(),
        value: valueText.value.trim(),
      });
      labelValues.value.push(valueText.value.trim());
      labelValueChanged();
    }
  };
  const removeLabelValue = (item: { [key: string]: string }): void => {
    const index = labelValues.value.findIndex((val) => {
      return val === item.value;
    });
    if (index > -1) {
      labelValues.value.splice(index, 1);
    }
  };

  defineExpose({
    init,
    closeCard,
    expandCard,
  });
</script>
