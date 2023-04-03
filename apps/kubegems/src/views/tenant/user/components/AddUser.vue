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
    icon="mdi-account"
    :title="i18n.t('operate.create_c', [i18n.t('resource.account')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.account')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.Username"
              class="my-0"
              :label="i18nLocal.t('form.username')"
              required
              :rules="objRule.username"
            />
            <v-text-field
              v-model="obj.Password"
              class="my-0"
              :label="i18nLocal.t('form.passwd')"
              required
              :rules="objRule.password"
            >
              <template #append>
                <v-btn class="mt-n1" color="primary" small text @click.stop="randomPassword">
                  <v-icon left small> mdi-eye </v-icon>
                  {{ i18nLocal.t('tip.random_passwd') }}
                </v-btn>
              </template>
            </v-text-field>
            <v-text-field
              v-model="obj.Email"
              class="my-0"
              :label="i18nLocal.t('form.email')"
              required
              :rules="objRule.email"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="addUser">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { User } from '@kubegems/api/typed/user';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { email, password, required } from '@kubegems/extension/ruler';
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

  const open = (): void => {
    state.dialog = true;
  };

  const obj = reactive({
    Username: '',
    Password: '',
    Email: '',
  });
  const objRule = {
    username: [required],
    password: [password],
    email: [email],
  };

  const randomPassword = (): void => {
    let s = '';
    const t = 'abcdefhijkmnprstwxyz';
    for (let i = 0; i < 4; i++) s += t.charAt(Math.floor(Math.random() * t.length));
    const n = '1234567890';
    for (let i = 0; i < 4; i++) s += n.charAt(Math.floor(Math.random() * n.length));
    const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) s += u.charAt(Math.floor(Math.random() * u.length));
    const f = '!@#$%';
    for (let i = 0; i < 2; i++) s += f.charAt(Math.floor(Math.random() * f.length));
    obj.Password = s;
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const addUser = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new User(obj).addUser();
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
  };

  defineExpose({
    open,
  });
</script>
