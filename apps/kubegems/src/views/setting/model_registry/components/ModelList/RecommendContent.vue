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
    icon="mdi-content-copy"
    :title="i18nLocal.t('tip.recomment_content')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-flex>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.recomment_content')])" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="obj.recommentContent"
                  auto-grow
                  :label="i18nLocal.t('tip.recomment_content')"
                  :rules="objRules.recommentContent"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="updateRecommentContent">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import { AIModel } from '@/types/ai_model';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const obj = ref({
    recommentContent: '',
  });
  const objRules = {
    recommentContent: [required],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const init = (item: AIModel): void => {
    obj.value = deepCopy(item);
  };

  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    obj.value = { recommentContent: '' };
  };

  const emit = defineEmits(['refresh']);
  const updateRecommentContent = async (): Promise<void> => {
    await new AIModel(obj.value).updateModelByAdmin();
    reset();
    emit('refresh');
  };
</script>
