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
    :title="
      obj.ID > 0
        ? i18n.t('operate.update_c', [i18n.t('resource.tenant')])
        : i18n.t('operate.create_c', [i18n.t('resource.tenant')])
    "
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.tenant')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.TenantName"
              class="my-0"
              :label="i18nLocal.t('form.name')"
              :readonly="obj.ID > 0"
              required
              :rules="objRule.tenantName"
            />
            <v-textarea
              v-model="obj.Remark"
              auto-grow
              class="my-0"
              :label="i18nLocal.t('form.remark')"
              required
              :rules="objRule.remark"
            />
          </v-sheet>
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
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Tenant } from '@/types/tenant';
  import { required } from '@/utils/rules';

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

  const init = (item: Tenant): void => {
    obj = Object.assign(obj, item);
  };

  let obj = reactive({
    ID: 0,
    TenantName: '',
    Remark: '',
  });
  const objRule = {
    tenantName: [required],
    remark: [required],
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (obj.ID > 0) {
      await new Tenant(obj).updateTenant();
    } else {
      await new Tenant(obj).addTenant();
    }
    reset();
    emit('refresh');
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    obj.ID = 0;
  };

  defineExpose({
    open,
    init,
  });
</script>
