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
  <div
    :class="`page clear-zoom-${Scale.toString().replaceAll('.', '-')} ${SelfOut || vertical ? '' : 'page__ani'}`"
    :style="{ height: `${height}px !important`, left: `${SelfOut ? '-40vw' : 0}`, width: `${vertical ? '100vw' : ''}` }"
  >
    <div
      v-show="!vertical"
      :class="{ skeleton__title: true, skeleton__title__ani: !SelfOut, skeleton__title__small: SelfOut || vertical }"
    >
      <img :class="{ skeleton__img: true, skeleton__img__ani: !SelfOut, skeleton__img__small: SelfOut || vertical }" />
      <div
        :class="{ skeleton__loading: true, skeleton__loading__ani: !SelfOut }"
        :style="{ opacity: SelfOut ? '0 !important' : '' }"
      >
        <div class="skeleton__loading__left__box">
          <div class="skeleton__loading__left skeleton__loading__color skeleton__loading__left__ani_start" />
        </div>
        <div class="skeleton__loading__right__box">
          <div class="skeleton__loading__right skeleton__loading__color skeleton__loading__right__ani_start" />
        </div>
      </div>
    </div>

    <div v-show="!SelfOut && !vertical" class="skeleton" :style="{ height: `${height}px !important` }" />

    <div
      class="login__second d-flex primary"
      :style="{ height: `${height}px !important`, display: `${vertical ? 'none !important' : ''}` }"
    >
      <div class="info align-center justify-start text-center">
        <div
          :class="{
            'mt-6': true,
            'white--text': true,
            login__second__desc: true,
            login__second__desc__ani: !SelfOut,
            'ml-4': true,
          }"
          :style="{ opacity: `${SelfOut ? 1 : 0}` }"
        >
          <strong>
            {{ config.layout.SLOGAN_CN }}
            <div class="login__second__desc__en">{{ config.layout.SLOGAN_EN }}</div>
          </strong>
        </div>
      </div>
    </div>

    <div
      class="login__third d-flex align-center"
      :style="{ height: `${height}px !important`, width: `${vertical ? '100vw' : ''}` }"
    >
      <v-container>
        <div class="pa-7 pa-sm-12">
          <v-row>
            <v-col class="login" cols="12" lg="9" xl="6">
              <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2">
                {{ $t('tip.login') }}
                <v-btn v-if="ldap" class="float-right mt-1" color="primary" small text @click="toDefaultLogin">
                  {{ $root.$t('operate.return') }}
                </v-btn>
                <div class="kubegems__clear-float" />
              </h2>
              <v-form ref="loginForm" v-model="valid" action="/" lazy-validation>
                <v-text-field
                  v-model="username"
                  class="mt-4"
                  :label="$t('username')"
                  outlined
                  required
                  :rules="usernameRules"
                  @keyup.enter="login(source)"
                />
                <v-text-field
                  v-model="password"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :counter="32"
                  :label="$t('password')"
                  outlined
                  required
                  :rules="passwordRules"
                  :type="show ? 'text' : 'password'"
                  @click:append="show = !show"
                  @keyup.enter="login(source)"
                />

                <v-menu
                  v-model="localeMenu"
                  attach="#login_locale"
                  bottom
                  left
                  nudge-bottom="5px"
                  offset-y
                  origin="top center"
                  transition="scale-transition"
                >
                  <template #activator="{ on }">
                    <div id="login_locale" />
                    <v-btn class="primary--text font-weight-medium mb-3" color="white" dark depressed small v-on="on">
                      <img class="locale__icon mr-2" :src="`/icon/i18n/${Locale}.svg`" />
                      {{ localeShow }}
                      <v-icon v-if="localeMenu" right> mdi-chevron-up </v-icon>
                      <v-icon v-else right> mdi-chevron-down </v-icon>
                    </v-btn>
                  </template>
                  <v-data-iterator hide-default-footer :items="[{ text: $t('tip.i18n'), values: locales }]">
                    <template #no-data>
                      <v-card>
                        <v-card-text>{{ $root.$t('data.no_data') }} </v-card-text>
                      </v-card>
                    </template>
                    <template #default="props">
                      <v-card v-for="item in props.items" :key="item.text" flat min-width="100px">
                        <v-list dense>
                          <v-flex class="text-subtitle-2 text-center ma-2">
                            <span>{{ $t('tip.i18n') }}</span>
                          </v-flex>
                          <v-divider class="mx-2" />
                          <v-list-item
                            v-for="(ln, index) in item.values"
                            :key="index"
                            class="text-caption text-start font-weight-medium mx-2"
                            link
                            :style="{ color: ln.locale === locale ? `var(--primary-color) !important` : `` }"
                            @click="setLocale(ln)"
                          >
                            <v-list-item-content>
                              <div>
                                <div class="float-left mr-2">
                                  <img class="locale__icon" :src="`/icon/i18n/${ln.locale}.svg`" />
                                </div>
                                <div class="float-left locale">{{ ln.title }}</div>
                                <div class="kubegems__clear-float" />
                              </div>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-menu>

                <v-btn
                  block
                  class="mr-4"
                  color="info"
                  :disabled="!valid"
                  :loading="Circular"
                  submit
                  @click="login(source)"
                >
                  {{ ldap ? VENDOR[vendor] : '' }} {{ $t('login') }}
                </v-btn>
              </v-form>
              <div v-if="enableOauthItems && enableOauthItems.length > 0 && !ldap" class="mt-5">
                <div class="login__divide"> {{ $t('tip.other') }}</div>
                <div class="mt-4 text-center">
                  <v-avatar
                    v-for="(item, index) in enableOauthItems"
                    :key="index"
                    class="mr-3 kubegems__pointer"
                    height="40"
                    left
                    min-width="40"
                    width="40"
                    @click="oauth(item)"
                  >
                    <BaseLogo
                      class="primary--text logo__logo"
                      :icon-name="item.vendor.toLocaleLowerCase()"
                      :ml="0"
                      :width="40"
                    />
                  </v-avatar>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
      <h6
        v-if="config.layout.PLATFORM.toLocaleLowerCase() === 'kubegems'"
        class="px-12 text-body-2 mt-4 login__copyright font-weight-medium kubegems__text"
      >
        © 2023 — {{ config.layout.PLATFORM }} by Kubegems.io
      </h6>
    </div>
  </div>
</template>

<script>
  import {
    getLoginUserAuth,
    getLoginUserInfo,
    getOauthAddr,
    getSystemAuthSource,
    postLogin,
  } from '@kubegems/api/direct';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import locales from '@kubegems/extension/i18n/locales';
  import { required } from '@kubegems/extension/ruler';
  import { VENDOR } from '@kubegems/libs/constants/platform';
  import { validateJWT } from '@kubegems/libs/utils/helpers';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseSelect from '@kubegems/mixins/select';
  import { mapGetters, mapState } from 'vuex';

  import config from '../../config.json';
  import messages from './i18n';

  export default {
    name: 'Login',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseSelect],
    data() {
      this.locales = locales;
      this.VENDOR = VENDOR;
      this.config = config;

      return {
        valid: true,
        password: '',
        show: false,
        username: '',
        usernameRules: [required],
        oauthItems: [],
        ldap: false,
        source: 'account',
        vendor: '',
        localeMenu: false,
        locale: '',
      };
    },
    computed: {
      ...mapState([
        'JWT',
        'Circular',
        'Admin',
        'AdminViewport',
        'Scale',
        'SelfOut',
        'Locale',
        'PluginsInterval',
        'GlobalPluginsInterval',
      ]),
      ...mapGetters(['Environment', 'Project', 'Tenant', 'Cluster']),
      passwordRules() {
        return [required, (v) => (v && v.length <= 32) || this.$t('form.passwordRule')];
      },
      height() {
        return window.innerHeight;
      },
      enableOauthItems() {
        return this.oauthItems.filter((item) => {
          return item.enabled;
        });
      },
      vertical() {
        return window.innerHeight > window.innerWidth;
      },
      localeShow() {
        const l = this.locales.find((l) => {
          return l.locale === this.locale;
        });
        if (l) {
          return `${l.title}`;
        }
        return ``;
      },
    },
    mounted() {
      this.clearAllTimeTickers();
      this.authSource();
      if (validateJWT(this.$route.query.token)) {
        this.$store.commit('SET_JWT', this.$route.query.token);
      }
      this.locale = this.Locale;
      this.init();
    },
    methods: {
      clearAllTimeTickers() {
        clearInterval(this.PluginsInterval);
        clearInterval(this.GlobalPluginsInterval);
        for (let i = 0; i <= 100000; i++) {
          clearInterval(i);
          clearTimeout(i);
        }
      },
      async authSource() {
        const data = await getSystemAuthSource({ noprocessing: true });
        this.oauthItems = data;
      },
      async login() {
        if (this.$refs.loginForm.validate(true)) {
          this.$store.commit('CLEARALL');
          const data = await postLogin({
            username: this.username,
            password: this.password,
            source: this.source,
          });
          if (data.token) this.$store.commit('SET_JWT', data.token);
          this.$store.commit('SET_VERSION', import.meta.env.VUE_APP_RELEASE);
          await this.loadData();
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('status.success'),
            color: 'success',
          });
          this.redirect();
        }
      },
      async loginUserAuth() {
        const data = await getLoginUserAuth();
        this.$store.commit('SET_USER_AUTH', data);
      },
      async loadData() {
        const data = await getLoginUserInfo();
        this.$store.commit('SET_USER', data);
        this.$store.commit('SET_ADMIN', data.SystemRole.RoleCode === 'sysadmin');
        await this.loginUserAuth();
      },
      async redirect() {
        if (this.$route.params.cluster) {
          this.$store.commit('SET_ADMIN_VIEWPORT', true);
          if (this.$route.query.redirect !== undefined) {
            this.$router.push({ path: this.$route.query.redirect });
          } else {
            this.$router.push({ name: 'cluster-center' });
          }
        } else {
          await this.$store.dispatch('UPDATE_TENANT_DATA');
          if (this.$route.query.redirect !== undefined) {
            this.$router.push({ path: this.$route.query.redirect });
          } else {
            this.$router.push({
              name: 'resource-dashboard',
              params: {
                tenant: this.Tenant().TenantName,
              },
            });
          }
        }
      },
      async init() {
        if (this.JWT != null && validateJWT(this.JWT)) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('status.logined'),
            color: 'success',
          });
          await this.loadData();
          this.redirect();
        }
      },
      toDefaultLogin() {
        this.ldap = false;
        this.source = 'account';
      },
      async oauth(auth) {
        if (auth.kind === 'OAUTH') {
          const data = await getOauthAddr({ source: auth.name });
          window.location.href = data;
        } else if (auth.kind === 'LDAP') {
          this.ldap = true;
          this.source = auth.name;
          this.vendor = auth.vendor;
        }
      },
      setLocale(locale) {
        this.locale = locale.locale;
        if (this.Locale === this.locale) return;
        useGlobalI18n().locale = this.locale;
        this.$moment.locale(this.locale === 'zh-Hans' ? 'zh-cn' : this.locale);
        if (window) {
          window.document.title = `${this.$t(this.$route.meta.title)} - ${config.layout.PLATFORM}`;
        }
        this.$store.commit('SET_LOCALE', this.locale);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    width: 240vw;
    position: absolute;
    left: 0;
    overflow: hidden;

    &__ani {
      animation-name: slide-out;
      animation-duration: 1.5s;
      animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
      animation-delay: 2s;
      animation-fill-mode: forwards;
    }
  }

  @keyframes slide-out {
    0% {
      left: 0;
    }
    45% {
      left: -100vw;
    }
    75% {
      left: -100vw;
    }
    100% {
      left: -140vw;
    }
  }

  @keyframes position-small {
    0% {
      top: 50%;
      left: 50%;
    }
    100% {
      top: 40%;
      left: 49%;
      transform: none;
    }
  }

  @keyframes img-small {
    0% {
      width: 400px;
    }
    100% {
      width: 18vw;
    }
  }

  @keyframes desc-show {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .skeleton {
    &__title {
      left: 50vw;
      z-index: 10;

      &__ani {
        animation-name: title-slide;
        animation-duration: 1.5s;
        animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
        animation-delay: 2s;
        animation-fill-mode: forwards;
      }

      &__small {
        top: 43%;
        transform: none;
        left: 60vw;
      }
    }

    &__loading {
      &__ani {
        animation-name: box-show;
        animation-duration: 1.5s;
        animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
        animation-delay: 2s;
        animation-fill-mode: forwards;
      }
    }
  }

  @keyframes title-slide {
    0% {
      left: 50vw;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    45% {
      left: 150vw;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    75% {
      left: 150vw;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    100% {
      left: 160vw;
      top: 43%;
      transform: none;
    }
  }

  @keyframes box-show {
    0% {
      opacity: 1;
    }
    45% {
      opacity: 0;
    }
    75% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .login {
    margin: auto;

    &__second {
      float: left;
      width: 100vw;
      position: relative;

      &__logo {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        &__ani {
          animation-name: position-small;
          animation-duration: 0.5s;
          animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
          animation-delay: 3.1s;
          animation-fill-mode: forwards;
        }

        &__img {
          &__ani {
            animation-name: img-small;
            animation-duration: 0.5s;
            animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
            animation-delay: 3.1s;
            animation-fill-mode: forwards;
          }
        }
      }

      &__desc {
        width: 45%;
        line-height: 1.5;
        font-size: 24px;
        position: absolute;
        left: 48%;
        top: 50%;
        opacity: 0;

        &__en {
          font-size: 19px;
          margin-left: -5px;
        }

        &__ani {
          animation-name: desc-show;
          animation-duration: 0.5s;
          animation-timing-function: cubic-bezier(0.75, 0, 0.16, 1);
          animation-delay: 3.1s;
          animation-fill-mode: forwards;
        }
      }
    }

    &__third {
      float: left;
      width: 40vw;
      position: relative;
    }

    &__logo {
      margin-left: 0 !important;
      margin-top: 5px !important;
    }

    &__font {
      line-height: 66px;
      font-weight: bold;
      font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important;
    }

    &__copyright {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      text-align: center;
    }

    &__divide {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: grey;

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #cccccc;
      }

      &::before {
        margin-right: 0.25rem;
      }

      &::after {
        margin-left: 0.25rem;
      }
    }
  }

  .locale {
    line-height: 20px;

    &__icon {
      margin-top: 2px;
    }
  }
</style>
