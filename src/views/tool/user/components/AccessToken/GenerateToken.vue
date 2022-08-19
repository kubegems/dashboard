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
    :title="$t('operate.generate_c', [$t('setting.tip.auth')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tab.auth')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model.number="obj.expire"
              class="my-0"
              :label="$t('setting.tip.exprie')"
              required
              :rules="objRules.expireRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="generateToken">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { postGenerateToken } from '@/api';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'GenerateToken',
    i18n: {
      messages: messages,
    },
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        expire: 600,
        grant_type: 'client_credentials',
        scope: 'validate',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          expireRules: [required, positiveInteger],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async generateToken() {
        if (this.$refs.form.validate(true)) {
          await postGenerateToken(this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
