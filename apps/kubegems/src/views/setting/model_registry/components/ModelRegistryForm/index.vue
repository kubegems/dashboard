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
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18n.t('header.model_store')])
        : i18n.t('operate.add_c', [i18n.t('header.model_store')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="components[state.step]"
        ref="form"
        :edit="state.edit"
        :item="registry"
        :step="state.step"
        :title="i18n.t('header.model_store')"
        @changeStep="changeStep"
      />
    </template>
    <template #action>
      <v-btn
        v-if="state.step === state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="store.state.Circular"
        text
        @click="confirm"
      >
        {{ i18n.t('operate.confirm') }}
      </v-btn>
      <v-btn
        v-if="state.step >= 0 && state.step < state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        {{ i18n.t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="state.step > 0 && state.step <= state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        {{ i18n.t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import ManageUser from './ManageUser.vue';
  import ModelBaseInfo from './ModelBaseInfo/index.vue';
  import { AIModelRegistry } from '@/types/ai_model';
  import { User } from '@/types/user';

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    step: 0,
    totalStep: 1,
    edit: false,
  });

  let components = ref([ModelBaseInfo, ManageUser]);

  const registry = ref<AIModelRegistry>(
    new AIModelRegistry({ auth: { username: '', token: '', password: '' }, kind: 'huggingface' }),
  );

  const open = (): void => {
    state.dialog = true;
  };

  const init = async (item: AIModelRegistry): Promise<void> => {
    const data = await new AIModelRegistry({ name: item.name }).getRegistryByAdmin();
    registry.value = deepCopy(data);
  };
  defineExpose({
    init,
    open,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      const data = form.value.getData();
      registry.value = Object.assign(registry.value, data);
      if (state.edit) {
        await new AIModelRegistry(registry.value).updateRegistryByAdmin();
      } else {
        await new AIModelRegistry(registry.value).addRegistryByAdmin();
        if (data.users) {
          data.users.forEach(async (username: string) => {
            await new AIModelRegistry(registry.value).addUser(new User({ Username: username }));
          });
        }
      }
      reset();
      emit('refresh');
    }
  };

  const changeStep = (totalStep: number): void => {
    state.totalStep = totalStep;
  };

  const lastStep = (): void => {
    state.step -= 1;
  };

  const nextStep = (): void => {
    if (form.value.validate()) {
      state.step += 1;
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    state.edit = false;
    state.step = 0;
    registry.value = new AIModelRegistry({ auth: { username: '', token: '', password: '' }, kind: 'huggingface' });
  };
</script>
