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
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.ldapaddr"
            class="my-0"
            :label="$t('form.ladp_address')"
            required
            :rules="objRules.ldapaddrRule"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="obj.config.basedn" class="my-0" label="BaseDN" required :rules="objRules.basednRule" />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.binduser"
            class="my-0"
            label="Username"
            required
            :rules="objRules.binduserRule"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.password"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            class="my-0"
            label="Password"
            required
            :rules="objRules.passwordRule"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
          />
        </v-col>
        <!-- <v-col cols="6">
          <v-text-field
            v-model="obj.config.filter"
            class="my-0"
            required
            label="Filter"
          />
        </v-col> -->
        <v-col cols="6">
          <v-switch v-model="obj.config.enableTLS" class="mt-4" hide-details :label="$t('tip.tls')" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'OpenLdapBaseForm',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      show: false,
      obj: {
        config: {
          enableTLS: true,
          basedn: '',
          binduser: '',
          password: '',
          ldapaddr: '',
          filter: '',
        },
        tokenType: 'Bearer',
      },
    }),
    computed: {
      objRules() {
        return {
          basednRule: [required],
          binduserRule: [required],
          passwordRule: [required],
          ldapaddrRule: [
            required,
            (v) =>
              !!new RegExp(
                '^(ldap://)?(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]):([0-9]|[1-9]\\d|[1-9]\\d{2}|[1-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])$',
              ).test(v) || this.$t('form.format_rule'),
          ],
        };
      },
    },
    watch: {
      item() {
        this.obj = deepCopy(this.item);
      },
    },
    methods: {
      reset() {
        this.$refs.form.reset();
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
