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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('header.model_store')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.kind"
            class="my-0"
            color="primary"
            hide-selected
            :items="registryItems"
            :label="i18nLocal.t('tip.source')"
            :no-data-text="i18n.t('data.no_data')"
            :readonly="edit"
            :rules="objRules.registry"
            @change="registryChanged"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <template v-if="obj.kind === 'modelx'">
          <v-col cols="6">
            <v-icon class="mt-6" color="orange" small>mdi-help-circle</v-icon>
            <v-btn class="mt-5" color="orange" small text @click="toDownloadClient">
              {{ i18nLocal.t('tip.download_modelx') }}
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="i18nLocal.t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.name"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.address"
              class="my-0"
              :label="i18nLocal.t('tip.address')"
              required
              :rules="objRules.address"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
    <template v-if="obj.kind === 'modelx'">
      <BaseSubTitle :title="i18nLocal.t('tip.auth')" />

      <Auth :registry="obj" @updateComponentData="updateComponentData" />
    </template>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/libs/utils/rules';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import Auth from './Auth/index.vue';
  import { AIModelRegistry } from '@/types/ai_model';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      edit?: boolean;
      item?: AIModelRegistry;
    }>(),
    {
      edit: false,
      item: undefined,
    },
  );

  const state = reactive({
    valid: false,
  });

  const registryItems = [
    { text: 'huggingface', value: 'huggingface' },
    { text: 'openmmlab', value: 'openmmlab' },
    { text: 'modelx', value: 'modelx' },
  ];

  const obj = ref<AIModelRegistry>(new AIModelRegistry());
  const objRules = {
    name: [required],
    registry: [required],
    images: [required],
    address: [required],
  };

  const emit = defineEmits(['changeStep']);
  const getRegistry = (): void => {
    if (
      registryItems.some((r) => {
        return r.value === obj.value.name;
      })
    ) {
      obj.value.kind = obj.value.name;
      emit('changeStep', 1);
    } else {
      obj.value.kind = 'modelx';
      emit('changeStep', 1);
    }
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      obj.value = props.item;
      getRegistry();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate(true);
  };

  const getData = (): AIModelRegistry => {
    return obj.value;
  };

  const reset = (): void => {
    form.value.resetValidation();
    obj.value = new AIModelRegistry();
  };

  defineExpose({
    validate,
    getData,
    reset,
  });

  const registryChanged = (): void => {
    if (obj.value.kind !== 'modelx') {
      obj.value.name = obj.value.kind;
      obj.value.online = true;
      emit('changeStep', 1);
    } else {
      obj.value.online = false;
      obj.value.name = '';
      emit('changeStep', 1);
    }
  };

  const toDownloadClient = (): void => {
    window.open('https://github.com/kubegems/modelx/releases');
  };

  const updateComponentData = (item: AIModelRegistry): void => {
    obj.value = item;
  };
</script>
