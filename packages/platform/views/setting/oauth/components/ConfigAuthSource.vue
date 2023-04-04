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
    icon="mdi-star"
    :title="i18nLocal.t('tip.config_title')"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [obj.vendor])" />
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="obj.name"
                class="my-0"
                :label="i18nLocal.t('form.name')"
                readonly
                required
                :rules="objRules.name"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <component :is="components[obj.vendor]" ref="typeForm" :edit="state.edit" :item="obj" :vendor="obj.vendor" />
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="updateAuthSource">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { OAuth } from '@kubegems/api/typed/oauth';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import OauthForm from './auth_source/OauthForm.vue';
  import OpenLdapForm from './auth_source/OpenLdapForm.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const components = {
    oauth: OauthForm,
    ldap: OpenLdapForm,
    gitlab: OauthForm,
    github: OauthForm,
  };

  let obj = reactive({
    name: '',
    kind: 'OAUTH',
    vendor: '',
  });
  const objRules = {
    name: [required],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const init = (item: OAuth, edit: boolean): void => {
    state.edit = edit;
    obj = Object.assign(obj, deepCopy(item));
  };

  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const typeForm = ref(null);
  const emit = defineEmits(['refresh']);
  const updateAuthSource = async (): Promise<void> => {
    if (form.value.validate(true) && typeForm.value?.validate()) {
      const data = Object.assign(obj, typeForm.value.getData());
      if (state.edit) {
        await new OAuth(data).updateOAuth();
      } else {
        await new OAuth(data).addOAuth();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = () => {
    state.dialog = false;
    typeForm.value.reset();
  };
</script>
