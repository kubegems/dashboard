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
    icon="mdi-cube-outline"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18n.t('resource.project')])
        : i18n.t('operate.create_c', [i18n.t('resource.project')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.project')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.ProjectName"
                class="my-0"
                :label="i18nLocal.t('form.project.name')"
                :readonly="state.edit"
                required
                :rules="objRules.projectName"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="obj.ProjectAlias"
                class="my-0"
                :label="i18nLocal.t('form.project.alias')"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-textarea
                v-model="obj.Remark"
                auto-grow
                class="my-0"
                :label="i18nLocal.t('form.project.remark')"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { Project } from '@kubegems/api/typed/project';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required, k8sName } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const obj = ref<Project>(new Project());
  const objRules = {
    projectName: [required, (v) => !!(v && v.length <= 20) || i18nLocal.t('form.project.nameRule'), k8sName],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const init = async (item: Project): Promise<void> => {
    state.edit = true;
    obj.value = await new Project(item).getProject();
  };

  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      if (state.edit) {
        await new Project(obj.value).updateProject();
      } else {
        await new Project(obj.value).addProject();
      }

      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.reset();
    obj.value = new Project();
  };
</script>
