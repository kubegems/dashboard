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
  <BaseDialog v-model="dialog" icon="mdi-star" :title="$t('tip.config_title')" :width="1000" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [obj.vendor])" />
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="obj.name"
                class="my-0"
                :label="$t('form.name')"
                readonly
                required
                :rules="objRules.nameRule"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <component :is="formComponent" :ref="formComponent" :edit="edit" :item="item" :vendor="obj.vendor" />
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateAuthSource">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import OauthBaseForm from './auth_source/OauthBaseForm';
  import OpenLdapBaseForm from './auth_source/OpenLdapBaseForm';
  import { postAuthSourceConfig, putAuthSourceConfig } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ConfigAuthSource',
    i18n: {
      messages: messages,
    },
    components: {
      OauthBaseForm,
      OpenLdapBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      item: null,
      edit: false,
      formComponent: 'OauthBaseForm',
      formComponents: {
        oauth: 'OauthBaseForm',
        ldap: 'OpenLdapBaseForm',
        gitlab: 'OauthBaseForm',
        github: 'OauthBaseForm',
      },
      obj: {
        name: '',
        kind: 'OAUTH',
        vendor: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          vendorRule: [required],
          nameRule: [required],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item, edit) {
        this.edit = edit;
        this.obj = deepCopy(item);
        this.formComponent = this.formComponents[this.obj.vendor];
        if (this.edit) {
          this.$nextTick(() => {
            this.item = deepCopy(item);
          });
        }
      },
      async updateAuthSource() {
        if (this.$refs.form.validate(true) && this.$refs[this.formComponent].validate()) {
          if (this.formComponent === 'OauthBaseForm' || this.formComponent === 'OpenLdapBaseForm') {
            const data = Object.assign(this.obj, this.$refs[this.formComponent].getData());
            if (this.edit) {
              await putAuthSourceConfig(this.obj.id, data);
            } else {
              await postAuthSourceConfig(data);
            }
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = '';
      },
    },
  };
</script>
