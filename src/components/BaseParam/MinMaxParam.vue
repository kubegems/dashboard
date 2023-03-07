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
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-text-field
      :id="id"
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :rules="rules"
      type="number"
      :value="v"
      @change="sliderChanged($event)"
    >
      <template #append>
        <span class="text-body-2 kubegems__text">
          {{ param.sliderUnit }}
        </span>
      </template>
    </v-text-field>
    <v-flex />
  </v-flex>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, onMounted, ref } from 'vue';

  import { useGlobalI18n } from '@/i18n';
  import { required } from '@/utils/rules';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
    },
  );

  const i18n = useGlobalI18n();

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const v = ref<number>(0);
  const rules = [
    required,
    (v) => v >= props.param.sliderMin || i18n.t('ruler.lt_min_value'),
    (v) => v <= props.param.sliderMax || i18n.t('ruler.gt_max_value'),
  ];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };
  const sliderChanged = (val: number): void => {
    const value = val + props.param.sliderUnit;
    changed(value);
  };

  onMounted(() => {
    v.value = parseInt(props.param.value.match(/\d/g).join(''));
    sliderChanged(v.value);
  });
</script>
