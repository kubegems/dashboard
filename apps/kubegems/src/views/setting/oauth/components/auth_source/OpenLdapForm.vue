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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.ldapaddr"
            class="my-0"
            :label="i18nLocal.t('form.ladp_address')"
            required
            :rules="objRules.ldapaddr"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="obj.config.basedn" class="my-0" label="BaseDN" required :rules="objRules.basedn" />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.binduser"
            class="my-0"
            label="Username"
            required
            :rules="objRules.binduser"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.password"
            :append-icon="state.show ? 'mdi-eye' : 'mdi-eye-off'"
            class="my-0"
            label="Password"
            required
            :rules="objRules.password"
            :type="state.show ? 'text' : 'password'"
            @click:append="state.show = !state.show"
          />
        </v-col>
        <v-col cols="6">
          <v-switch v-model="obj.config.enableTLS" class="mt-4" hide-details :label="i18nLocal.t('tip.tls')" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/libs/utils/rules';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { OAuth } from '@/types/oauth';

  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
    show: false,
  });

  const props = withDefaults(
    defineProps<{
      item?: OAuth;
    }>(),
    {
      item: undefined,
    },
  );

  let obj = reactive({
    config: {
      enableTLS: true,
      basedn: '',
      binduser: '',
      password: '',
      ldapaddr: '',
      filter: '',
    },
    tokenType: 'Bearer',
  });
  const objRules = {
    basedn: [required],
    binduser: [required],
    password: [required],
    ldapaddr: [
      required,
      (v) =>
        !!new RegExp(
          '^(ldap://)?(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]):([0-9]|[1-9]\\d|[1-9]\\d{2}|[1-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])$',
        ).test(v) || i18nLocal.t('form.format_rule'),
    ],
  };

  const form = ref(null);
  const reset = (): void => {
    form.value.reset();
  };

  const getData = (): OAuth => {
    return obj as OAuth;
  };

  const validate = (): boolean => {
    return form.value.validate(true);
  };

  defineExpose({
    reset,
    getData,
    validate,
  });

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      obj = Object.assign(obj, newValue);
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>
