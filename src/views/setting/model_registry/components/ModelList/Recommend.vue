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
    icon="mdi-comment"
    :title="i18nLocal.t('tip.recomment')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-flex>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.recomment')])" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="obj.recomment"
                  :label="i18nLocal.t('tip.recomment')"
                  :rules="objRules.recomment"
                  type="number"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="updateRecomment">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { AIModel } from '@/types/ai_model';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const obj = ref({
    recomment: 0,
  });
  const objRules = {
    recomment: [required, positiveInteger, (v) => v <= 100 || i18nLocal.t('form.recomment_rule')],
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
    obj.value = { recomment: 0 };
  };

  const emit = defineEmits(['refresh']);
  const updateRecomment = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new AIModel(obj.value).updateModelByAdmin();
      reset();
      emit('refresh');
    }
  };
</script>
