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
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span class="ml-2">{{ $root.$t('form.definition', [$root.$t('resource.registry')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.address"
                class="my-0"
                :label="$t('form.address')"
                required
                :rules="dockerconfigRules.addressRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="dockerconfig.email" class="my-0" :label="$t('form.email')" required />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.username"
                class="my-0"
                :label="$t('form.username')"
                required
                :rules="dockerconfigRules.usernameRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="dockerconfig.password"
                class="my-0"
                :label="$t('form.passwd')"
                required
                :rules="dockerconfigRules.passwordRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { Base64 } from 'js-base64';

  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'SecretDockerconfigForm',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        dataCopy: {},
        dockerconfig: {
          username: '',
          password: '',
          email: '',
          address: '',
        },
        dockerconfigRules: {
          usernameRule: [required],
          passwordRule: [required],
          addressRule: [required],
        },
      };
    },
    watch: {
      data() {
        this.dataCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.labels) {
        this.dataCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.dockerconfig = {
          username: data.username,
          password: data.password,
          email: data.email,
          address: data.address,
        };
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const config = {
            auths: {},
          };
          config.auths[this.dockerconfig.address] = {
            username: this.dockerconfig.username,
            password: this.dockerconfig.password,
            email: this.dockerconfig.email,
            auth: Base64.encode(`${this.dockerconfig.username}:${this.dockerconfig.password}`),
          };
          this.dataCopy['.dockerconfigjson'] = Base64.encode(JSON.stringify(config));
          this.$emit('addData', this.dataCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeOverlay');
      },
    },
  };
</script>
