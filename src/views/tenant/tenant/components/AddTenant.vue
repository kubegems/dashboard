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
    v-model="dialog"
    icon="mdi-account-multiple-plus"
    :title="$root.$t('operate.create_c', [$root.$t('resource.tenant')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.tenant')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.TenantName"
              class="my-0"
              :label="$t('form.name')"
              required
              :rules="objRules.tenantNameRules"
            />
            <v-textarea
              v-model="obj.Remark"
              auto-grow
              class="my-0"
              :label="$t('form.remark')"
              required
              :rules="objRules.remarkRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTenant">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { postAddTenant } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sLabel, required } from '@/utils/rules';

  export default {
    name: 'AddTenant',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        TenantName: '',
        Remark: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          tenantNameRules: [required, (v) => !!(v && v.length <= 20) || this.$t('form.name_rule'), k8sLabel],
          remarkRules: [required],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTenant() {
        if (this.$refs.form.validate(true)) {
          await postAddTenant(this.obj);
          this.reset();
          this.$emit('refresh');
          this.$store.dispatch('UPDATE_TENANT_DATA');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
