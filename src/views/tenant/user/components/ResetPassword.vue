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
  <BaseDialog v-model="dialog" icon="mdi-account-key" :title="$t('tip.passwd_title')" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('resource.password')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.password"
              class="my-0"
              :label="$t('form.new_passwd')"
              required
              :rules="objRules.passwordRules"
            >
              <template #append>
                <v-btn class="mt-n1" color="primary" small text @click.stop="randomPassword">
                  <v-icon left small> mdi-eye </v-icon>
                  {{ $t('tip.random_passwd') }}
                </v-btn>
              </template>
            </v-text-field>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="resetUserPassword">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { postResetUserPassword } from '@/api';
  import { password } from '@/utils/rules';

  export default {
    name: 'ResetPassword',
    i18n: {
      messages: messages,
    },
    data: () => ({
      dialog: false,
      valid: false,
      userId: 0,
      obj: {
        password: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          passwordRules: [password],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(userId) {
        this.userId = userId;
      },
      randomPassword() {
        let s = '';
        const t = 'abcdefhijkmnprstwxyz';
        for (let i = 0; i < 4; i++) s += t.charAt(Math.floor(Math.random() * t.length));
        const n = '1234567890';
        for (let i = 0; i < 4; i++) s += n.charAt(Math.floor(Math.random() * n.length));
        const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) s += u.charAt(Math.floor(Math.random() * u.length));
        const f = '!@#$%';
        for (let i = 0; i < 2; i++) s += f.charAt(Math.floor(Math.random() * f.length));
        this.obj.password = s;
      },
      async resetUserPassword() {
        if (this.$refs.form.validate(true)) {
          await postResetUserPassword(this.userId, this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.userId = 0;
      },
    },
  };
</script>
