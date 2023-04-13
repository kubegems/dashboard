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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-cube"
    :title="i18n.t('operate.update_c', [i18nLocal.t('tip.app_store_app')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="app" :title="title" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { Application } from '@kubegems/api/typed/argocd';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import yaml from 'js-yaml';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const app = ref(undefined);
  const title = ref<string>('');
  const application = ref<Application>(new Application());
  const init = (ap: any): void => {
    app.value = deepCopy(yaml.load(ap.values));
    title.value = ap.name;
    application.value = deepCopy(ap.runtime.raw);
  };

  defineExpose({
    open,
    init,
  });

  const emit = defineEmits(['refresh']);
  const yamlForm = ref(null);
  const confirm = async (): Promise<void> => {
    if (yamlForm.value.validate()) {
      const values = yamlForm.value.getYaml();
      application.value.spec.source.helm.values = values;
      await new Application(application.value).updateApplication(store.getters.Environment().ClusterName);
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    yamlForm.value.reset();
    app.value = undefined;
    title.value = '';
  };
</script>
