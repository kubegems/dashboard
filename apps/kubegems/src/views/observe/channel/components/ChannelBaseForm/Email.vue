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
  <v-form ref="form" v-model="valid" class="mt-2" lazy-validation @submit.prevent>
    <v-row>
      <v-col cols="6">
        <v-text-field v-model="host" class="my-0" :label="$t('tip.smtp')" required :rules="objRules.hostRule" />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model="port" class="my-0" :label="$t('tip.port')" required :rules="objRules.portRule">
          <template #append>
            <v-switch
              v-model="obj.channelConfig.requireTLS"
              dense
              hide-details
              required
              :style="{ display: `flex`, justifyContent: `center` }"
              @change="onRequireTLSChange"
            >
              <template #label>
                <span :style="{ marginBottom: `8px` }">TLS</span>
              </template>
            </v-switch>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="obj.channelConfig.from"
          class="my-0"
          :label="$t('tip.send')"
          required
          :rules="objRules.fromRule"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="obj.channelConfig.authPassword"
          :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          class="my-0 ml-2"
          :label="$t('tip.send_passwd')"
          required
          :rules="objRules.authPasswordRule"
          :type="show ? 'text' : 'password'"
          @click:append="show = !show"
        />
      </v-col>
      <v-col cols="12">
        <v-autocomplete
          v-model="emailTo"
          class="my-0"
          color="primary"
          hide-selected
          :items="emailToItems"
          :label="$t('tip.recv')"
          multiple
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.toRule"
          :search-input.sync="emailText"
          @focus="useEmailList"
          @keydown.13="createEmail"
        >
          <template #selection="{ item }">
            <v-chip
              class="mx-1"
              close
              close-icon="mdi-close-circle"
              color="primary"
              small
              @click:close="removeEmail(item)"
            >
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { mapGetters } from 'vuex';

  import messages from '../../i18n';
  import { getTenantUserList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { convertResponse2List } from '@/types/base';

  export default {
    name: 'EmailForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },

    data() {
      return {
        valid: false,
        show: false,
        obj: {},
        port: 25,
        host: '',
        objRules: {
          portRule: [required],
          toRule: [required],
          fromRule: [required],
          hostRule: [required],
          authPasswordRule: [required],
        },
        emailToItems: [],
        emailTo: [],
        emailText: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.host = this.obj.channelConfig.smtpServer.split(':')[0];
            this.port = this.obj.channelConfig.smtpServer.split(':')[1];
            const emails = this.obj.channelConfig.to.split(',').filter((t) => {
              return Boolean(t);
            });
            this.emailTo = emails;
            this.emailToItems = this.emailToItems.concat(
              emails.map((e) => {
                return { text: e, value: e };
              }),
            );
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        this.obj.channelConfig.smtpServer = `${this.host}:${this.port}`;
        this.emailListToString();
        return this.obj;
      },
      async useEmailList() {
        const data = await getTenantUserList(this.Tenant().ID, {
          size: 500,
        });
        this.emailToItems = this.emailToItems
          .concat(
            convertResponse2List(data)
              .filter((user) => {
                return user.Email && user.Email && user.Email.length > 0;
              })
              .map((user) => {
                if (
                  !this.emailToItems.some((e) => {
                    return e && e.text === user.Email;
                  })
                ) {
                  return { text: user.Email, value: user.Email };
                }
              }),
          )
          .filter((e) => {
            return Boolean(e);
          });
      },
      createEmail() {
        if (!this.emailText.trim()) return;
        if (!new RegExp('^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$').test(this.emailText)) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('ruler.email'),
            color: 'warning',
          });
          return;
        }
        if (
          !this.emailToItems.some((to) => {
            return to.value === this.emailText.trim();
          })
        ) {
          this.emailToItems.push({
            text: this.emailText.trim(),
            value: this.emailText.trim(),
          });
          this.emailTo.push(this.emailText.trim());
        }
        this.emailText = '';
      },
      removeEmail(item) {
        const index = this.emailTo.findIndex((email) => {
          return email === item.text;
        });
        if (index > -1) {
          this.emailTo.splice(index, 1);
        }
      },
      emailListToString() {
        if (this.emailTo.length > 0) {
          this.obj.channelConfig.to = this.emailTo.join(',');
        } else {
          this.obj.channelConfig.to = '';
        }
      },
      onRequireTLSChange() {
        this.port = this.obj.channelConfig.requireTLS ? 465 : 25;
      },
      reset() {
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
