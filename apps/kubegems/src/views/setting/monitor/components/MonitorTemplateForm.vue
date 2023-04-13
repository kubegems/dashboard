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
    icon="mdi-code-json"
    :title="i18nLocal.t('operate.load_c', [i18n.t('resource.monitor_template')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="form" :item="template" :title="i18n.t('resource.monitor_template')" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { MonitorTemplate } from '@kubegems/api/typed/monitor_template';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
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

  const template = ref<MonitorTemplate>(undefined);
  const init = async (item: MonitorTemplate): Promise<void> => {
    template.value = await new MonitorTemplate(item).getMonitorTemplate();
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      const data = form.value.getYaml();
      try {
        const temp: MonitorTemplate = yaml.load(data);
        if (template.value) {
          await new MonitorTemplate({ ...temp, name: template.value.name }).updateMonitorTemplate();
        } else {
          await new MonitorTemplate(temp).addMonitorTemplate();
        }
        reset();
        emit('refresh');
      } catch (e) {
        store.commit('SET_SNACKBAR', {
          text: e,
          color: 'warning',
        });
      }
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
  };

  defineExpose({
    open,
    init,
  });
</script>
