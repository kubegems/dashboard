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
        <v-col v-if="vendor === 'gitlab'" cols="6">
          <v-text-field
            v-model="gitlabDomain"
            class="my-0"
            label="GitLab Domain"
            required
            :rules="objRules.gitlabDomain"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.redirectURL"
            class="my-0"
            label="Redirect URL"
            required
            :rules="objRules.redirectURL"
          />
        </v-col>
        <template v-if="vendor !== 'github' && vendor !== 'gitlab'">
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.authURL"
              class="my-0"
              label="Auth URL"
              required
              :rules="objRules.authURL"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.userInfoURL"
              class="my-0"
              label="UserInfo URL"
              required
              :rules="objRules.userInfoURL"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.tokenURL"
              class="my-0"
              label="Token URL"
              required
              :rules="objRules.tokenURL"
            />
          </v-col>
        </template>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appID"
            class="my-0"
            label="Application ID"
            required
            :rules="objRules.appID"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appSecret"
            :append-icon="state.show ? 'mdi-eye' : 'mdi-eye-off'"
            class="my-0"
            label="Secret"
            required
            :rules="objRules.appSecret"
            :type="state.show ? 'text' : 'password'"
            @click:append="state.show = !state.show"
          />
        </v-col>
        <v-col cols="6">
          <v-combobox
            v-model="scope.scopeItmes"
            class="my-0"
            hide-no-data
            :items="[]"
            label="Scope"
            multiple
            :search-input.sync="scope.scopeText"
            @change="scopeChanged"
            @keydown.enter="createScope"
          >
            <template #selection="{ item }">
              <v-chip
                class="ma-1"
                close
                close-icon="mdi-close-circle"
                color="primary"
                small
                @click:close="removeScope(item)"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/libs/utils/rules';
  import { onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { OAuth } from '@/types/oauth';

  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      edit?: boolean;
      item?: OAuth;
      vendor?: string;
    }>(),
    {
      edit: true,
      item: undefined,
      vendor: '',
    },
  );

  const state = reactive({
    valid: false,
    show: false,
  });

  let obj = reactive({
    config: {
      appID: '',
      appSecret: '',
      redirectURL: '',
      scopes: [],
      authURL: '',
      userInfoURL: '',
      tokenURL: '',
    },
    tokenType: 'Bearer',
  });
  const objRules = {
    appID: [required],
    appSecret: [required],
    redirectURL: [required],
    tokenType: [required],
    authURL: [required],
    userInfoURL: [required],
    tokenURL: [required],
    gitlabDomain: [
      (v) =>
        !!new RegExp('^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}$', 'g').test(v) ||
        i18nLocal.t('form.format_rule'),
    ],
  };

  const getScopeList = async (): Promise<void> => {
    const data = await new OAuth().getScope({ vendor: props.vendor });
    obj.config = Object.assign(obj.config, data);
    scope.scopeItmes = obj.config.scopes?.map((scope, index) => {
      return { text: scope, value: index };
    });
  };

  let gitlabDomain = 'gitlab.com';
  const replaceDomain = (): void => {
    const reg = new RegExp('((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}', 'g');
    obj.config.authURL = obj.config.authURL.replace(reg, gitlabDomain);
    obj.config.userInfoURL = obj.config.userInfoURL.replace(reg, gitlabDomain);
    obj.config.tokenURL = obj.config.tokenURL.replace(reg, gitlabDomain);
  };

  const scope = reactive({
    scopeItmes: [],
    scopeText: '',
  });
  const createScope = (): void => {
    if (!scope.scopeText) return;
    const index = scope.scopeItmes.length;
    scope.scopeItmes.push({
      text: scope.scopeText,
      value: index,
    });
    scope.scopeText = '';
    obj.config.scopes = scope.scopeItmes.map((scope) => {
      return scope.text;
    });
  };

  const removeScope = (item): void => {
    const scopes = scope.scopeItmes.filter((scope) => {
      return scope.value !== item.value;
    });
    scope.scopeItmes = scopes;
    obj.config.scopes = scope.scopeItmes.map((scope) => {
      return scope.text;
    });
  };

  const scopeChanged = (): void => {
    const scopes = scope.scopeItmes.filter((scope) => {
      return scope !== '' && typeof scope === 'object';
    });
    scope.scopeItmes = scopes;
    obj.config.scopes =
      scopes.map((scope) => {
        return scope.text;
      }) || [];
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      obj = Object.assign(obj, newValue);
      scope.scopeItmes =
        obj.config.scopes?.map((scope, index) => {
          return { text: scope, value: index };
        }) || [];
      const reg = new RegExp('((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}', 'g');
      const matchDomain = obj.config.authURL.match(reg);
      if (matchDomain && matchDomain.length > 0) {
        gitlabDomain = matchDomain[0];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  onMounted(() => {
    if (!props.edit) {
      obj.config.redirectURL = `https://${window.location.host}/oauth/callback`;
      if (props.vendor === 'gitlab' || props.vendor === 'github') {
        getScopeList();
      }
    }
  });

  const form = ref(null);
  const reset = (): void => {
    form.value.reset();
  };

  const getData = (): OAuth => {
    if (props.vendor === 'gitlab') {
      replaceDomain();
    }
    return obj as OAuth;
  };

  const validate = (): void => {
    return form.value.validate(true);
  };

  defineExpose({
    getData,
    validate,
    reset,
  });
</script>
