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
  <div class="login__third d-flex align-center" :style="{ height: `100% !important` }">
    <v-container>
      <div class="pa-7 pa-sm-12">
        <v-row>
          <v-col class="login" cols="3" lg="3" xl="3"></v-col>
          <v-col class="login" cols="12" lg="6" xl="6">
            <div class="login__content primary--text">KubeGems Service Mesh</div>
            <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2 text-center">
              {{ i18n.t('login') }}
            </h2>
            <v-form ref="loginForm" v-model="state.valid" action="/" lazy-validation>
              <v-text-field
                v-model="obj.username"
                class="mt-4"
                :label="i18n.t('username')"
                outlined
                required
                :rules="objRules.username"
                @keyup.enter="login"
              />
              <v-text-field
                v-model="obj.password"
                :append-icon="state.show ? 'mdi-eye' : 'mdi-eye-off'"
                :counter="32"
                :label="i18n.t('passwd')"
                outlined
                required
                :rules="objRules.password"
                :type="state.show ? 'text' : 'password'"
                @click:append="state.show = !state.show"
                @keyup.enter="login"
              />

              <v-btn
                block
                class="mr-4"
                color="info"
                :disabled="!state.valid"
                :loading="store.state.Circular"
                submit
                @click="login"
              >
                {{ i18n.t('login') }}
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
  import { Auth } from '@kubegems/api/typed/auth';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { validateJWT } from '@kubegems/libs/utils/helpers';
  import { onMounted, reactive, ref } from 'vue';

  import router from '../../router';

  const store = useStore();
  const i18n = useGlobalI18n();

  const obj = ref({
    username: '',
    password: '',
    source: 'account',
  });
  const objRules = {
    username: [required],
    password: [required],
  };

  const state = reactive({
    show: false,
    valid: false,
  });

  const loginForm = ref(null);
  const login = async (): Promise<void> => {
    if (loginForm.value.validate(true)) {
      const data = await new Auth().login(obj.value);
      if (data.token) store.commit('SET_JWT', data.token);
      await loadLoginData();
      store.commit('SET_SNACKBAR', {
        text: i18n.t('status.success'),
        color: 'success',
      });
    }
  };

  const loadLoginData = async (): Promise<void> => {
    const data = await new Auth().getLoginUser();
    store.commit('SET_USER', data);
    store.commit('SET_ADMIN', data.SystemRole.RoleCode === 'sysadmin');
    router.push({ name: 'virtualspace-list' });
  };

  const init = async (): Promise<void> => {
    if (store.state.JWT != null && validateJWT(store.state.JWT)) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('status.logined'),
        color: 'success',
      });
      await loadLoginData();
    }
  };

  onMounted(() => {
    init();
  });
</script>

<style lang="scss" scoped>
  .login {
    &__content {
      text-align: center;
      font-size: 36px;
      font-family: 'kubegems-sample';
    }
  }
</style>
