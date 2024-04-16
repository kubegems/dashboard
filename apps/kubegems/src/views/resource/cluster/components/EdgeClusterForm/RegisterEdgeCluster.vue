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
    <v-flex :class="state.expand ? 'kubegems__overlay' : ''" />
    <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.edge_cluster')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field v-model="obj.metadata.name" :label="i18nLocal.t('form.name')" required :rules="objRule.name" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2">
          <v-switch
            v-model="state.customImage"
            class="mt-5"
            hide-details
            :label="i18nLocal.t('tip.custom_image')"
            @change="clearImage"
          />
        </v-col>
        <v-col v-if="state.customImage" cols="10">
          <v-text-field
            v-model="obj.spec.register.image"
            :label="i18nLocal.t('form.image')"
            required
            :rules="objRule.image"
          />
        </v-col>
        <v-col v-else cols="10">
          <v-autocomplete
            v-model="obj.spec.register.image"
            color="primary"
            :items="imageItems"
            :label="i18nLocal.t('form.image')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRule.image"
          >
            <template #selection="{ item, disabled }">
              <v-chip color="primary" :disabled="disabled" small>
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      update?: boolean;
      edgeCluster?: EdgeCluster;
    }>(),
    {
      update: false,
      edgeCluster: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
    customImage: false,
    expand: false,
  });

  const imageItems = ref([
    { text: 'docker.io/kubegems/kubegems-edge-agent', value: 'docker.io/kubegems/kubegems-edge-agent' },
    {
      text: 'registry.cn-beijing.aliyuncs.com/kubegems/kubegems-edge-agent',
      value: 'registry.cn-beijing.aliyuncs.com/kubegems/kubegems-edge-agent',
    },
  ]);

  const obj = reactive<EdgeCluster>(props.edgeCluster);
  const objRule = reactive({ image: [], name: [required] });

  watch(
    () => obj,
    async (value) => {
      if (!value) return;
      if (
        !imageItems.value.some((image) => {
          return image.value === obj.spec.register.image;
        }) &&
        props.update
      ) {
        state.customImage = true;
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const clearImage = (): void => {
    obj.spec.register.image = '';
  };

  defineExpose({
    validate,
  });
</script>
