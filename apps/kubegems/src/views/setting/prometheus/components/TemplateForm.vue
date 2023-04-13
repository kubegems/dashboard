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
    icon="mdi-file-powerpoint-box"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18n.t('resource.template')])
        : i18n.t('operate.create_c', [i18n.t('resource.template')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <TemplateBaseForm ref="form" :edit="state.edit" :item="template" title="Reocrding Rules" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { PrometheusTemplate } from '@kubegems/api/typed/prometheus_template';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import TemplateBaseForm from './TemplateBaseForm.vue';

  const i18n = useGlobalI18n();
  const store = useStore();
  const query = useQuery();

  const state = reactive({
    dialog: false,
    edit: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const init = async (item: PrometheusTemplate): Promise<void> => {
    state.edit = true;
    template.value = await new PrometheusTemplate({ id: item.id }).getPrometheusTemplate('_all');
  };

  defineExpose({
    open,
    init,
  });

  const template = ref<PrometheusTemplate>(new PrometheusTemplate());

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      let data = form.value.getData();
      data.resourceID = parseInt(query.value.resourceId as string);
      template.value = Object.assign(template.value, data);
      if (state.edit) {
        await new PrometheusTemplate(template.value).updatePrometheusTemplate('_all');
      } else {
        await new PrometheusTemplate(template.value).addPrometheusTemplate('_all');
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    state.edit = false;
  };
</script>
