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
  <div>
    <v-row>
      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="$t('setting.tip.personal_info')" />
            <v-form ref="infoForm" v-model="validInfo" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> {{ $t('table.email') }} </v-flex>
                  <v-text-field v-model="objInfo.Email" class="pt-0" dense flat :rules="objInfoRules.emailRules" solo />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> {{ $t('table.mobile') }} </v-flex>
                  <v-text-field v-model="objInfo.Phone" class="pt-0" dense flat :rules="objInfoRules.phoneRules" solo />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="updateUser">
                {{ $root.$t('operate.update_c', [$t('setting.tip.personal_info')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-3" flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="$t('setting.tip.i18n')" />
            <v-form ref="infoForm" v-model="validInfo" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-autocomplete
                    v-model="language"
                    dense
                    flat
                    hide-details
                    item-text="title"
                    item-value="locale"
                    :items="languages"
                    :menu-props="{
                      bottom: true,
                      left: true,
                      origin: `top center`,
                    }"
                    :rules="i18nRules.languageRules"
                    solo
                  />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="updateLanguage">
                {{ $root.$t('operate.update_c', [$t('setting.tip.i18n')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card flat>
          <v-card-text class="pa-2">
            <BaseSubTitle :divider="false" :title="$root.$t('passwd')" />
            <v-form ref="pwdForm" v-model="validPwd" class="px-4" lazy-validation @submit.prevent>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text">
                    {{ $t('setting.tip.old', [$root.$t('passwd')]) }}
                  </v-flex>
                  <v-text-field
                    v-model="objPwd.origin"
                    :append-icon="showOrigin ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.originRules"
                    solo
                    :type="showOrigin ? 'text' : 'password'"
                    @click:append="showOrigin = !showOrigin"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text">
                    {{ $t('setting.tip.new', [$root.$t('passwd')]) }}
                  </v-flex>
                  <v-text-field
                    v-model="objPwd.new1"
                    :append-icon="showNew1 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new1Rules"
                    solo
                    :type="showNew1 ? 'text' : 'password'"
                    @click:append="showNew1 = !showNew1"
                  />
                </v-col>
                <v-col cols="12">
                  <v-flex class="text-subtitle-2 kubegems__text"> {{ $t('setting.tip.confirm_passwd') }} </v-flex>
                  <v-text-field
                    v-model="objPwd.new2"
                    :append-icon="showNew2 ? 'mdi-eye' : 'mdi-eye-off'"
                    class="my-0"
                    dense
                    flat
                    :rules="objPwdRules.new2Rules"
                    solo
                    :type="showNew2 ? 'text' : 'password'"
                    @click:append="showNew2 = !showNew2"
                  />
                </v-col>
              </v-row>
              <v-btn class="my-4" color="primary" small @click="resetPassword">
                {{ $root.$t('operate.update_c', [$root.$t('passwd')]) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getLoginUserInfo, postResetPassword, putUpdateUser } from '@/api';
  import locales from '@/i18n/locales';
  import { email, password, phone, required } from '@/utils/rules';

  export default {
    name: 'OwnerSetting',
    i18n: {
      messages: messages,
    },
    inject: ['reload'],
    data() {
      return {
        validInfo: false,
        validPwd: false,
        user: null,
        objInfo: {
          Email: '',
          Phone: '',
        },
        objPwd: {
          origin: '',
          new1: '',
          new2: '',
        },
        showOrigin: false,
        showNew1: false,
        showNew2: false,

        language: '',
      };
    },
    computed: {
      ...mapState(['User', 'Locale']),
      objInfoRules() {
        return {
          emailRules: [email],
          phoneRules: [phone],
        };
      },
      objPwdRules() {
        return {
          originRules: [required],
          new1Rules: [required, password],
          new2Rules: [required, password],
        };
      },
      i18nRules() {
        return {
          languageRules: [required],
        };
      },
      languages() {
        return locales;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.loginUserInfo();
        this.language = this.Locale;
      });
    },
    methods: {
      async loginUserInfo() {
        const data = await getLoginUserInfo({ noprocessing: true });
        this.user = data;
        this.objInfo = Object.assign(this.objInfo, this.user);
      },
      async updateUser() {
        if (this.$refs.infoForm.validate(true)) {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.update_c', [this.$t('setting.tip.personal_info')]),
            content: {
              text: this.$root.$t('operate.update_c', [this.$t('setting.tip.personal_info')]),
              type: 'confirm',
            },
            param: {},
            doFunc: async () => {
              await putUpdateUser(this.User.ID, Object.assign(this.user, this.objInfo));
              const data = await getLoginUserInfo();
              this.$store.commit('SET_USER', data);
            },
          });
        }
      },
      async resetPassword() {
        if (this.$refs.pwdForm.validate(true)) {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.update_c', [this.$root.$t('passwd')]),
            content: {
              text: this.$root.$t('operate.update_c', [this.$root.$t('passwd')]),
              type: 'confirm',
            },
            param: {},
            doFunc: async () => {
              await postResetPassword(this.objPwd);
              this.$refs.pwdForm.reset();
            },
          });
        }
      },
      updateLanguage() {
        if (this.Locale === this.language) return;
        this.$_i18n.locale = this.language;
        this.$moment.locale(this.language === 'zh-Hans' ? 'zh-cn' : this.language);
        if (window) {
          window.document.title = `${this.$t(this.$route.meta.title)} - ${this.$PLATFORM}`;
        }
        this.$store.commit('SET_LOCALE', this.language);
        this.reload();
      },
    },
  };
</script>
