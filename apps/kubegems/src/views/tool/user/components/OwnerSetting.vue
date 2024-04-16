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
  <div>
    <v-row>
      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="i18nLocal.t('setting.tip.personal_info')" />
            <v-form ref="infoForm" v-model="infoState.valid" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> {{ i18nLocal.t('table.email') }} </v-flex>
                  <v-text-field v-model="objInfo.Email" class="pt-0" dense flat :rules="objInfoRules.emailRules" solo />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> {{ i18nLocal.t('table.mobile') }} </v-flex>
                  <v-text-field v-model="objInfo.Phone" class="pt-0" dense flat :rules="objInfoRules.phoneRules" solo />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="updateUser">
                {{ i18n.t('operate.update_c', [i18nLocal.t('setting.tip.personal_info')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-3" flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="i18nLocal.t('setting.tip.i18n')" />
            <v-form ref="infoForm" v-model="localeState.valid" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-autocomplete
                    v-model="language"
                    dense
                    flat
                    hide-details
                    item-text="title"
                    item-value="locale"
                    :items="locales"
                    :menu-props="{
                      bottom: true,
                      left: true,
                      origin: `top center`,
                    }"
                    :rules="i18nRules.languageRules"
                    solo
                  />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="updateLanguage">
                {{ i18n.t('operate.update_c', [i18nLocal.t('setting.tip.i18n')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="i18n.t('passwd')" />
            <v-form ref="pwdForm" v-model="pwdState.valid" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text">
                    {{ i18nLocal.t('setting.tip.old', [i18n.t('passwd')]) }}
                  </v-flex>
                  <v-text-field
                    v-model="objPwd.origin"
                    :append-icon="pwdState.showOrigin ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.originRules"
                    solo
                    :type="pwdState.showOrigin ? 'text' : 'password'"
                    @click:append="pwdState.showOrigin = !pwdState.showOrigin"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text">
                    {{ i18nLocal.t('setting.tip.new', [i18n.t('passwd')]) }}
                  </v-flex>
                  <v-text-field
                    v-model="objPwd.new1"
                    :append-icon="pwdState.showNew1 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new1Rules"
                    solo
                    :type="pwdState.showNew1 ? 'text' : 'password'"
                    @click:append="pwdState.showNew1 = !pwdState.showNew1"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text">
                    {{ i18nLocal.t('setting.tip.confirm_passwd') }}
                  </v-flex>
                  <v-text-field
                    v-model="objPwd.new2"
                    :append-icon="pwdState.showNew2 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new2Rules"
                    solo
                    :type="pwdState.showNew2 ? 'text' : 'password'"
                    @click:append="pwdState.showNew2 = !pwdState.showNew2"
                  />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="resetPassword">
                {{ i18n.t('operate.update_c', [i18n.t('passwd')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { Auth } from '@kubegems/api/typed/auth';
  import { User } from '@kubegems/api/typed/user';
  import iii, { useGlobalI18n } from '@kubegems/extension/i18n';
  import locales from '@kubegems/extension/i18n/locales';
  import { useRoute } from '@kubegems/extension/proxy';
  import { email, password, phone, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import moment from 'moment';
  import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();
  const route = useRoute();

  const infoState = reactive({
    valid: false,
  });

  let objInfo = reactive({
    Email: '',
    Phone: '',
  });
  const objInfoRules = {
    emailRules: [email],
    phoneRules: [phone],
  };
  const user = ref(null);
  const infoForm = ref(null);
  const updateUser = async (): Promise<void> => {
    if (infoForm.value.validate(true)) {
      store.commit('SET_CONFIRM', {
        title: i18n.t('operate.update_c', [i18nLocal.t('setting.tip.personal_info')]),
        content: {
          text: i18n.t('operate.update_c', [i18nLocal.t('setting.tip.personal_info')]),
          type: 'confirm',
        },
        param: {},
        doFunc: async () => {
          await new User(Object.assign(user.value, objInfo)).updateUser();
          const data = await new Auth().getLoginUser();
          store.commit('SET_USER', data);
        },
      });
    }
  };
  watch(
    () => store.state.User,
    async (newValue) => {
      if (newValue) {
        user.value = newValue;
        objInfo = Object.assign(objInfo, user.value);
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const localeState = reactive({
    valid: false,
  });
  const language = ref('');
  const i18nRules = {
    languageRules: [required],
  };
  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload');
  const updateLanguage = () => {
    if (store.state.Locale === language.value) return;
    iii.locale = language.value;
    moment.locale(language.value === 'zh-Hans' ? 'zh-cn' : language.value);
    if (window) {
      window.document.title = `${i18nLocal.t(route.meta.title)} - ${config.layout.PLATFORM}`;
    }
    store.commit('SET_LOCALE', language.value);
    reload();
  };

  const pwdState = reactive({
    valid: false,
    showOrigin: false,
    showNew1: false,
    showNew2: false,
  });
  const objPwd = reactive({
    origin: '',
    new1: '',
    new2: '',
  });
  const objPwdRules = {
    originRules: [required],
    new1Rules: [required, password],
    new2Rules: [required, password],
  };
  const pwdForm = ref(null);
  const resetPassword = async (): Promise<void> => {
    if (pwdForm.value.validate(true)) {
      store.commit('SET_CONFIRM', {
        title: i18n.t('operate.update_c', [i18n.t('passwd')]),
        content: {
          text: i18n.t('operate.update_c', [i18n.t('passwd')]),
          type: 'confirm',
        },
        param: {},
        doFunc: async () => {
          await new Auth().resetPasswd(objPwd);
          pwdForm.value.reset();
        },
      });
    }
  };

  onMounted(() => {
    nextTick(() => {
      language.value = store.state.Locale;
    });
  });
</script>
