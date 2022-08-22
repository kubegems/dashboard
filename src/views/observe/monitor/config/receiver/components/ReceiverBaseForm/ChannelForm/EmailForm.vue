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
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation>
    <v-card class="my-2 pa-2" flat>
      <v-card-text class="pa-0">
        <v-sheet class="pt-2 px-0">
          <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
            <span>{{ $t('tip.email_config') }}</span>
          </v-flex>
          <v-flex class="float-left ml-0 kubegems__form-width">
            <v-text-field
              v-model="smtpServerInput"
              class="my-0"
              :label="$t('tip.smtp')"
              required
              :rules="emailConfigRules.smtpServerRule"
            />
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-text-field v-model="port" class="my-0" label="端口" required :rules="emailConfigRules.portRule">
              <template #append>
                <v-switch
                  v-model="emailConfig.requireTLS"
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
          </v-flex>
          <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
          <v-flex class="float-left ml-0 kubegems__form-width">
            <v-text-field
              v-model="emailConfig.from"
              class="my-0"
              :label="$t('tip.send')"
              required
              :rules="emailConfigRules.fromRule"
            />
          </v-flex>
          <v-flex class="float-left kubegems__form-width">
            <v-text-field
              v-model="emailConfig.authPassword"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              class="my-0 ml-2"
              :label="$t('tip.send_passwd')"
              required
              :rules="emailConfigRules.authPasswordRule"
              :type="show ? 'text' : 'password'"
              @click:append="show = !show"
            />
          </v-flex>
          <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-sheet class="px-0">
          <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width" />
          <v-flex class="float-left kubegems__long-width">
            <v-autocomplete
              v-model="emailToSelected"
              class="my-0"
              color="primary"
              hide-selected
              :items="emailToSelect"
              :label="$t('tip.recv')"
              multiple
              :no-data-text="$root.$t('data.no_data')"
              :rules="emailConfigRules.toRule"
              :search-input.sync="emailText"
              @change="onEmailChange"
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
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
        <v-btn color="primary" small text @click="sendTestEmail"> {{ $t('operate.send_test') }} </v-btn>
        <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import { getEnvironmentUserList, postSendTestEmail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'EmailForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      configIndex: {
        type: Number,
        default: () => null,
      },
      data: {
        type: Object,
        default: () => {},
      },
      namespace: {
        type: String,
        default: () => '',
      },
      obj: {
        type: Object,
        default: () => null,
      },
    },

    data() {
      return {
        valid: false,
        expand: true,
        emailConfigsCopy: {},
        show: false,
        emailConfig: {
          from: '',
          to: '',
          smtpServer: '',
          requireTLS: false,
          authPassword: '',
        },
        port: 25,
        smtpServerInput: null,
        emailConfigRules: {
          portRule: [required],
          toRule: [required],
          fromRule: [required],
          smtpServerRule: [required],
          authPasswordRule: [required],
        },
        emailToSelect: [],
        emailToSelected: [],
        emailText: '',
      };
    },
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      smtpServer() {
        return `${this.smtpServerInput}:${this.port}`;
      },
    },
    watch: {
      data() {
        this.emailConfigsCopy = deepCopy(this.data.emailConfigs);
      },
      smtpServer() {
        this.emailConfig.smtpServer = this.smtpServer;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.useEmailList();
      });
    },
    methods: {
      // 更新时调用, 针对自动补全组件v-autocomplete需要提前获取items数据
      async init() {
        this.emailConfig = deepCopy(this.obj.emailConfigs[this.configIndex]);
        const emails = this.emailConfig.to.split(',');
        this.emailToSelected = emails;
        await this.useEmailList();
        this.emailToSelect = this.emailToSelect.concat(emails);
        this.smtpServerInput = this.emailConfig.smtpServer.split(':')[0];
        this.port = this.emailConfig.smtpServer.split(':')[1];
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.emailListToString();
          this.$emit('addData', deepCopy(this.emailConfig));
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeCard');
      },
      async useEmailList() {
        const data = await getEnvironmentUserList(this.$route.query.envid, {
          size: 500,
        });
        this.emailToSelect = data.List.filter((user) => {
          return user.Email && user.Email && user.Email.length > 0;
        }).map((user) => {
          return { text: user.Email, value: user.Email };
        });
      },
      onEmailChange() {
        const emailToSelected = this.emailToSelected.filter((email) => {
          return email !== '';
        });
        this.emailToSelected = emailToSelected;
      },
      createEmail() {
        if (!this.emailText) return;
        if (!new RegExp('^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$').test(this.emailText)) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('ruler.email'),
            color: 'warning',
          });
          return;
        }
        this.emailToSelect.push({
          text: this.emailText,
          value: this.emailText,
        });
        this.emailToSelected.push(this.emailText);
        this.emailText = '';
      },
      removeEmail(item) {
        const emailToSelected = this.emailToSelected.filter((email) => {
          return email !== item;
        });
        this.emailToSelected = emailToSelected;
      },
      emailListToString() {
        if (this.emailToSelected.length > 0) {
          this.emailConfig.to = this.emailToSelected.join(',');
        } else {
          this.emailConfig.to = '';
        }
      },
      async sendTestEmail() {
        if (this.$refs.form.validate(true)) {
          var namespace = this.namespace;
          if (namespace === '') {
            namespace = '_all';
          }
          this.emailListToString();
          await postSendTestEmail(this.$route.query.cluster, namespace, '_', {
            authPassword: this.emailConfig.authPassword,
            from: this.emailConfig.from,
            requireTLS: this.emailConfig.requireTLS,
            smtpServer: this.emailConfig.smtpServer,
            to: this.emailConfig.to,
          });
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.test_success'),
            color: 'success',
          });
        }
      },
      onRequireTLSChange() {
        this.port = this.emailConfig.requireTLS ? 465 : 25;
      },
    },
  };
</script>
