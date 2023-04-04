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
    icon="mdi-broadcast"
    :title="
      obj.id > 0
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.broadcast')])
        : i18n.t('operate.create_c', [i18nLocal.t('resource.broadcast')])
    "
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('resource.broadcast')])" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="obj.message"
                auto-grow
                class="my-0"
                :label="i18nLocal.t('table.message')"
                :readonly="obj.id > 0"
                required
                :rules="objRules.message"
              />
            </v-col>
            <v-col cols="12">
              <BaseDatetimePicker v-model="date" :default-value="360" in-form :offset-y="0" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { Broadcast } from '@kubegems/api/typed/broadcast';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const date = ref([]);
  const obj = ref<Broadcast>(
    new Broadcast({
      id: 0,
      message: '',
      startAt: new Date(),
      endAt: new Date(),
      type: 'notice',
    }),
  );

  const objRules = {
    message: [required],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    obj.value = new Broadcast({
      id: 0,
      message: '',
      startAt: new Date(),
      endAt: new Date(),
      type: 'notice',
    });
  };

  const init = async (item: Broadcast): Promise<void> => {
    const data = await new Broadcast({ id: item.id }).getBroadcast();
    obj.value = data;
    date.value = [data.startAt, data.endAt];
  };

  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      if (date.value?.length === 0) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.select_datetime'),
          color: 'warning',
        });
        return;
      }
      obj.value.startAt = new Date(date.value[0]);
      obj.value.endAt = new Date(date.value[1]);
      if (obj.value.id > 0) {
        await new Broadcast(obj.value).updateBroadcast();
      } else {
        await new Broadcast(obj.value).addBroadcast();
      }
      reset();
      emit('refresh');
    }
  };

  defineExpose({
    open,
    init,
  });
</script>
