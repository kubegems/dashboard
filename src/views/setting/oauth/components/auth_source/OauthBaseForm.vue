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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-card-text class="pa-2">
      <v-row>
        <v-col v-if="vendor === 'gitlab'" cols="6">
          <v-text-field
            v-model="gitlabDomain"
            class="my-0"
            label="GitLab Domain"
            required
            :rules="objRules.gitlabDomainRule"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.redirectURL"
            class="my-0"
            label="Redirect URL"
            required
            :rules="objRules.redirectURLRule"
          />
        </v-col>
        <template v-if="vendor !== 'github' && vendor !== 'gitlab'">
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.authURL"
              class="my-0"
              label="Auth URL"
              required
              :rules="objRules.authURLRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.userInfoURL"
              class="my-0"
              label="UserInfo URL"
              required
              :rules="objRules.userInfoURLRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.tokenURL"
              class="my-0"
              label="Token URL"
              required
              :rules="objRules.tokenURLRule"
            />
          </v-col>
        </template>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appID"
            class="my-0"
            label="Application ID"
            required
            :rules="objRules.appIDRule"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.appSecret"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            class="my-0"
            label="Secret"
            required
            :rules="objRules.appSecretRule"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
          />
        </v-col>
        <v-col cols="6">
          <v-combobox
            v-model="scopes"
            class="my-0"
            hide-no-data
            :items="[]"
            label="Scope"
            multiple
            :search-input.sync="scopeText"
            @change="onScopeChange"
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

<script>
  import messages from '../../i18n';
  import { getOAuthScopeList } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'OauthBaseForm',
    i18n: {
      messages: messages,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      vendor: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      valid: false,
      show: false,
      scopes: [],
      scopeText: '',
      gitlabDomain: 'gitlab.com',
      obj: {
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
      },
    }),
    computed: {
      objRules() {
        return {
          appIDRule: [required],
          appSecretRule: [required],
          redirectURLRule: [required],
          tokenTypeRule: [required],
          authURLRule: [required],
          userInfoURLRule: [required],
          tokenURLRule: [required],
          gitlabDomainRule: [
            (v) =>
              !!new RegExp('^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}$', 'g').test(v) ||
              this.$t('form.format_rule'),
          ],
        };
      },
    },
    watch: {
      item() {
        this.obj = deepCopy(this.item);
        this.scopes =
          this.obj.config.scopes?.map((scope, index) => {
            return { text: scope, value: index };
          }) || [];
        const reg = new RegExp('((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}', 'g');
        const matchDomain = this.obj.config.authURL.match(reg);
        if (matchDomain && matchDomain.length > 0) {
          this.gitlabDomain = matchDomain[0];
        }
      },
    },
    mounted() {
      if (!this.edit) {
        this.obj.config.redirectURL = `https://${window.location.host}/oauth/callback`;
        if (this.vendor === 'gitlab' || this.vendor === 'github') {
          this.scopeList();
        }
      }
    },
    methods: {
      onScopeChange() {
        const scopes = this.scopes.filter((scope) => {
          return scope !== '' && typeof scope === 'object';
        });
        this.scopes = scopes;
        this.obj.config.scopes =
          scopes.map((scope) => {
            return scope.text;
          }) || [];
      },
      async scopeList() {
        const data = await getOAuthScopeList({ vendor: this.vendor });
        this.obj.config = Object.assign(this.obj.config, data);
        this.scopes = this.obj.config.scopes?.map((scope, index) => {
          return { text: scope, value: index };
        });
      },
      replaceDomain() {
        const reg = new RegExp('((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}', 'g');
        this.obj.config.authURL = this.obj.config.authURL.replace(reg, this.gitlabDomain);
        this.obj.config.userInfoURL = this.obj.config.userInfoURL.replace(reg, this.gitlabDomain);
        this.obj.config.tokenURL = this.obj.config.tokenURL.replace(reg, this.gitlabDomain);
      },
      createScope() {
        if (!this.scopeText) return;
        const index = this.scopes.length;
        this.scopes.push({
          text: this.scopeText,
          value: index,
        });
        this.scopeText = '';
        this.obj.config.scopes = this.scopes.map((scope) => {
          return scope.text;
        });
      },
      removeScope(item) {
        const scopes = this.scopes.filter((scope) => {
          return scope.value !== item.value;
        });
        this.scopes = scopes;
        this.obj.config.scopes = this.scopes.map((scope) => {
          return scope.text;
        });
      },
      reset() {
        this.$refs.form.reset();
      },
      getData() {
        if (this.vendor === 'gitlab') {
          this.replaceDomain();
        }
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
