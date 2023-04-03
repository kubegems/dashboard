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
    <v-flex :class="state.expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="state.expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>{{ i18nLocal.t('tip.auth') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="authType"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="authTypeItems"
                  :label="i18nLocal.t('tip.auth_type')"
                  :no-data-text="i18n.t('data.no_data')"
                  :rules="objRules.authType"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item.text }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>

              <div class="kubegems__clear-float" />
            </v-sheet>

            <template v-if="authType === 'passwd'">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width" />
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.auth.username"
                    class="my-0"
                    :label="i18n.t('usernmae')"
                    required
                    :rules="objRules.username"
                  />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.auth.password"
                    class="my-0"
                    :label="i18n.t('passwd')"
                    required
                    :rules="objRules.password"
                    type="password"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>
            <template v-else-if="authType === 'token'">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width" />
                <v-flex class="float-left ml-2 kubegems__long-width">
                  <v-textarea
                    v-model="obj.auth.token"
                    auto-grow
                    class="my-0"
                    label="Token"
                    required
                    :rules="objRules.token"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ i18n.t('operate.cancel') }} </v-btn>
          <v-btn color="primary" :loading="store.state.Circular" small text @click="checkModelRegistry">
            {{ i18nLocal.t('operate.check') }}
          </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ i18n.t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <AuthItem
      v-if="obj.auth.username || obj.auth.token"
      :registry="obj"
      @removeData="removeData"
      @updateData="updateData"
    />

    <v-flex v-else class="grey lighten-4 rounded my-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ i18n.t('operate.add_c', [i18nLocal.t('tip.auth_setting')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../../i18n';
  import AuthItem from './AuthItem.vue';
  import { AIModelRegistry } from '@/types/ai_model';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      registry?: AIModelRegistry;
    }>(),
    {
      registry: undefined,
    },
  );

  const state = reactive({
    valid: false,
    expand: false,
  });

  const authType = ref('token');
  const authTypeItems = [
    { text: i18nLocal.t('tip.passwd_auth'), value: 'passwd' },
    { text: i18nLocal.t('tip.token_auth'), value: 'token' },
  ];

  const obj = ref<AIModelRegistry>(new AIModelRegistry());
  const objRules = {
    authType: [required],
    username: [required],
    password: [required],
    token: [required],
  };

  const getAuthType = (): string => {
    if (props.registry?.auth?.username && props.registry?.auth?.token) {
      return 'passwd';
    }
    if (props.registry?.auth?.username) {
      return 'passwd';
    }
    if (props.registry?.auth?.token) {
      return 'token';
    }
    return '';
  };

  watch(
    () => props.registry,
    async (newValue) => {
      if (!newValue) return;
      obj.value = deepCopy(props.registry);
      authType.value = getAuthType();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const expandCard = (): void => {
    state.expand = true;
    form.value.resetValidation();
    obj.value = deepCopy(props.registry);
    authType.value = getAuthType();
  };

  const form = ref(null);
  const checkModelRegistry = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new AIModelRegistry(obj.value).check();
    }
  };

  const closeCard = (): void => {
    state.expand = false;
    form.value.resetValidation();
    obj.value = deepCopy(props.registry);
    authType.value = getAuthType();
  };

  const emit = defineEmits(['updateComponentData']);
  const addData = (): void => {
    if (form.value.validate(true)) {
      emit('updateComponentData', obj.value);
      closeCard();
    }
  };

  const removeData = (): void => {
    obj.value.auth = {
      username: '',
      token: '',
      password: '',
    };
    emit('updateComponentData', obj.value);
  };

  const updateData = (): void => {
    expandCard();
  };
</script>
