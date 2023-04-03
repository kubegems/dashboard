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
  <div class="left-steps">
    <v-stepper v-model="current" class="pb-0" vertical>
      <template v-for="(item, index) in steps">
        <v-stepper-step
          :key="item.id"
          :complete="current > index + 1"
          complete-icon="mdi-check"
          edit-icon="mdi-check"
          editable
          :step="index + 1"
        >
          <span class="kubegems__text">{{ item.name }}</span>
          <small class="mt-2 text-body-2">
            {{ item.desc }}
          </small>
        </v-stepper-step>
        <v-stepper-content :key="`${item.id}Content`" :step="index + 1" />
      </template>
    </v-stepper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  import { useI18n } from '../../i18n';

  const i18nLocal = useI18n();

  const steps = [
    {
      id: 'metrics',
      name: i18nLocal.t('tip.install_metrics'),
      desc: i18nLocal.t('tip.install_metrics_desc'),
    },
    {
      id: 'traces',
      name: i18nLocal.t('tip.install_trace'),
      desc: i18nLocal.t('tip.install_trace_desc'),
    },
    {
      id: 'logs',
      name: i18nLocal.t('tip.create_log'),
      desc: i18nLocal.t('tip.create_log_desc'),
    },
  ];

  const current = ref<number>(1);

  const props = withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {
      value: 'metrics',
    },
  );

  const emit = defineEmits(['input', 'change']);
  watch(
    () => current,
    async (newValue) => {
      const id = steps[newValue.value - 1].id;
      emit('input', id);
      emit('change', id);
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.value,
    async (newValue) => {
      current.value = steps.findIndex((item) => item.id === newValue) + 1 || 1;
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  .v-application--is-ltr .v-stepper--vertical .v-stepper__content {
    margin: -8px -36px -21px 36px !important;
  }

  .step {
    &__font {
      font-size: 14px;
      line-height: 18px;
    }
  }
</style>
