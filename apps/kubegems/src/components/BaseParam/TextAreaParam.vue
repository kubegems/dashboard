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
    <v-textarea
      :id="id"
      auto-grow
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :placeholder="param.placeholder || ''"
      :rules="rules"
      :value="param.value"
      @change="changed($event)"
    />
  </v-flex>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/libs/utils/rules';
  import { ComputedRef, computed, onMounted } from 'vue';

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

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules = [required];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  onMounted(() => {
    changed(props.param.value);
  });
</script>
