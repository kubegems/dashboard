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
  <v-dialog v-model="store.state.Confirm.value" max-width="500" persistent scrollable>
    <v-card class="pa-0" flat>
      <v-sheet class="px-4 py-2 error--text text-h6">
        {{ store.state.Confirm.title }}
      </v-sheet>
      <v-divider />
      <v-sheet
        v-if="
          store.state.Confirm.content &&
          (store.state.Confirm.content.type === 'delete' || store.state.Confirm.content.type === 'batch_delete')
        "
        class="px-4 py-4 confirm-size"
      >
        <v-alert
          border="left"
          class="rounded py-3"
          :color="(store.state.Confirm.content && store.state.Confirm.content.level) || 'warning'"
          colored-border
          elevation="1"
        >
          <template v-if="store.state.Confirm.content && store.state.Confirm.content.type === 'batch_delete'">
            <div class="text-subtitle-1 kubegems__text">
              {{ i18n.t('tip.batch_delete_c', [store.state.Confirm.content.tip || i18n.t('operate.delete')]) }}
            </div>
            <div
              v-for="(content, index) in store.state.Confirm.content ? store.state.Confirm.content.text.split(',') : []"
              :key="index"
              class="text-subtitle-1 kubegems__text kubegems__break-all"
            >
              {{ content }}
              <template v-if="Object.prototype.hasOwnProperty.call(store.state.Confirm.content.status, content)">
                <v-icon v-if="store.state.Confirm.content.status[content]" color="success" right small
                  >mdi-check</v-icon
                >
                <v-icon v-else color="error" right small>mdi-close</v-icon>
              </template>
            </div>
          </template>
          <template v-if="store.state.Confirm.content && store.state.Confirm.content.type === 'delete'">
            <div
              v-for="(content, index) in store.state.Confirm.content ? store.state.Confirm.content.text.split(',') : []"
              :key="index"
              class="text-subtitle-1 kubegems__text kubegems__break-all float-left"
              v-html="content"
            />
            <v-btn class="float-left" color="primary" icon small @click="copyMessage">
              <v-icon small> mdi-content-copy</v-icon>
            </v-btn>
            <input id="copyed" type="hidden" :value="store.state.Confirm.content.name" />
            <div class="kubegems__clear-float" />
          </template>
        </v-alert>
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-text-field
            v-if="store.state.Confirm.content.type === 'delete'"
            v-model="data"
            class="my-0"
            :label="i18n.t('confirm.tip')"
            required
            :rules="dataRule"
            @keydown.enter="confirm"
          />
          <v-text-field
            v-else-if="store.state.Confirm.content.type === 'batch_delete'"
            v-model="data"
            class="my-0"
            :label="`${
              store.state.Confirm.content.one
                ? `${i18n.t('confirm.tip')}`
                : i18n.t('tip.batch_confirm_c', [store.state.Confirm.content.tip || i18n.t('tip.batch_delete')])
            }`"
            required
            :rules="batchDataRule"
            @keydown.enter="confirm"
          />
        </v-form>
      </v-sheet>
      <v-sheet v-else-if="store.state.Confirm.content" class="px-4 py-4 confirm-size">
        <v-flex class="text-subtitle-1 kubegems__text kubegems__break-all" v-html="store.state.Confirm.content.text" />
      </v-sheet>
      <div class="pb-3 pr-4">
        <v-btn class="float-right" color="primary" :loading="store.state.Circular" small text @click="confirm">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
        <v-btn class="float-right" color="error" small text @click="close">
          {{ i18n.t('operate.cancel') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { ComputedRef, computed, reactive, ref } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    valid: false,
  });

  const dataRule = [required, (v) => !!(v === store.state.Confirm.content.name) || i18n.t('ruler.not_match')];
  const batchDataRule: ComputedRef<any[]> = computed(() => {
    if (store.state.Confirm.content.one) {
      return [required, (v) => !!(v === store.state.Confirm.content.one) || i18n.t('ruler.not_match')];
    } else {
      return [
        required,
        (v) =>
          !!(v === i18n.t('tip.batch_rule_c', [store.state.Confirm.content.tip || i18n.t('tip.batch_delete')])) ||
          i18n.t('ruler.not_match'),
      ];
    }
  });

  const data = ref<string>('');
  const form = ref<any>(null);
  const close = async (): Promise<void> => {
    await store.state.Confirm.doClose(store.state.Confirm.param);
    store.state.Confirm.value = false;
    data.value = '';
    if (form.value) {
      form.value.resetValidation();
    }
  };

  const confirm = async (): Promise<void> => {
    if (
      (['delete', 'batch_delete'].indexOf(store.state.Confirm.content.type) > -1 && form.value.validate(true)) ||
      ['delete', 'batch_delete'].indexOf(store.state.Confirm.content.type) === -1
    ) {
      await store.state.Confirm.doFunc(store.state.Confirm.param);
      if (
        !store.state.Confirm.content.status ||
        Object.values(store.state.Confirm.content.status).indexOf(false) === -1
      ) {
        store.state.Confirm.value = false;
      }
      data.value = '';
      if (form.value) {
        form.value.resetValidation();
      }
    }
  };

  const copyMessage = async (): Promise<void> => {
    let text = (document.getElementById('copyed') as HTMLInputElement).value;
    await navigator.clipboard?.writeText(text);
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.copyed'),
      color: 'success',
    });
  };
</script>

<style lang="scss" scoped>
  .confirm-size {
    max-height: 400px;
    overflow-y: auto;
  }
</style>
