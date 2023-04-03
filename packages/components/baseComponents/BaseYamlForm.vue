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
    <BaseSubTitle :title="title" />
    <v-form ref="form" v-model="state.valid" class="mt-2 rounded-t mx-2" lazy-validation @submit.prevent />
    <div class="px-2">
      <ACEEditor
        v-model="kubeyaml"
        :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')} rounded`"
        height="600"
        lang="yaml"
        :options="aceOptions"
        theme="chrome"
        @keydown.stop
      />
    </div>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import yaml from 'js-yaml';
  import { onMounted, reactive, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      item?: any;
      title?: string;
    }>(),
    {
      item: '',
      title: '',
    },
  );

  const store = useStore();
  const state = reactive({
    valid: false,
  });

  const aceOptions = {
    tabSize: 2,
    fontSize: 12,
    printMarginColumn: 100,
    showPrintMargin: false,
    wrap: true,
    readOnly: false,
  };

  const kubeyaml = ref<string>('');
  const dump = (data: any): string | null => {
    try {
      const d: string = yaml.dump(data);
      return d;
    } catch (e) {
      store.commit('SET_SNACKBAR', {
        text: e.reason,
        color: 'warning',
      });
      return null;
    }
  };
  onMounted(() => {
    if (props.item) kubeyaml.value = dump(props.item) as string;
  });

  watch(
    () => props.item,
    async (newValue) => {
      kubeyaml.value = dump(newValue) as string;
    },
    {
      deep: true,
    },
  );

  const form = ref<any>(null);
  const validate = (): boolean => {
    return form.value.validate(true);
  };
  const checkSaved = (): boolean => {
    return true;
  };
  const reset = (): void => {
    kubeyaml.value = '';
    form.value.reset();
  };
  const setYaml = (data): void => {
    kubeyaml.value = data;
  };
  const getYaml = (): string => {
    return kubeyaml.value;
  };

  defineExpose({
    validate,
    checkSaved,
    reset,
    setYaml,
    getYaml,
  });
</script>
