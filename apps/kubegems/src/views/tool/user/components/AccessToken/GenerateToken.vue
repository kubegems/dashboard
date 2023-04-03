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
    icon="mdi-account-multiple-plus"
    :title="i18nLocal.t('operate.generate_c', [i18nLocal.t('setting.tip.auth')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tab.auth')])">
        <template #tips>
          <span class="orange--text text-caption">
            <v-icon color="orange" right small> mdi-information-variant </v-icon>
            {{ i18nLocal.t('token.tip.token_tip') }}
          </span>
        </template>
      </BaseSubTitle>

      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model.number="obj.expire"
              class="my-0"
              :label="i18nLocal.t('setting.tip.exprie')"
              required
              :rules="objRules.expireRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="generateToken">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { positiveInteger, required } from '@kubegems/libs/utils/rules';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import { Auth } from '@/types/auth';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
  };

  const obj = reactive({
    expire: 600,
    grant_type: 'client_credentials',
    scope: 'validate',
  });
  const objRules = reactive({
    expireRules: [required, positiveInteger],
  });

  const emit = defineEmits(['refresh']);
  const generateToken = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new Auth().generateAccessToken(obj);
      reset();
      emit('refresh');
    }
  };

  defineExpose({
    open,
  });
</script>
