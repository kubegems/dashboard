<template>
  <div
    :class="`page clear-zoom-${Scale.toString().replaceAll('.', '-')} ${SelfOut || vertical ? '' : 'page__ani'}`"
    :style="{ height: `${height}px !important`, left: `${SelfOut ? '-40vw' : 0}`, width: `${vertical ? '100vw' : ''}` }"
  >
    <div v-show="!SelfOut && !vertical" class="skeleton" :style="{ height: `${height}px !important` }">
      <div class="skeleton__title">
        <img class="skeleton__img" />
        <div class="skeleton__loading">
          <div class="skeleton__loading__left__box">
            <div class="skeleton__loading__left skeleton__loading__color skeleton__loading__left__ani_start" />
          </div>
          <div class="skeleton__loading__right__box">
            <div class="skeleton__loading__right skeleton__loading__color skeleton__loading__right__ani_start" />
          </div>
        </div>
      </div>
    </div>

    <div
      class="login__second d-flex primary"
      :style="{ height: `${height}px !important`, display: `${vertical ? 'none !important' : ''}` }"
    >
      <div class="info align-center justify-start">
        <div
          :class="{ login__second__logo: true, login__second__logo__ani: !SelfOut }"
          :style="{
            top: `${SelfOut ? '40%' : ''}`,
            left: `${SelfOut ? '43%' : ''}`,
            transform: `${SelfOut ? 'none' : ''}`,
          }"
        >
          <v-img
            :class="{ login__second__logo__img__ani: !SelfOut }"
            contain
            src="/logo.svg"
            :width="`${SelfOut ? '250px' : '400px'}`"
          />
        </div>
        <!-- <v-flex class="float-left ml-2 login__font"> 容器云平台 </v-flex> -->

        <div
          :class="{ 'mt-4': true, 'white--text': true, login__second__desc: true, login__second__desc__ani: !SelfOut }"
          :style="{ opacity: `${SelfOut ? 1 : 0}` }"
        >
          KubeGems 是一款开源的企业级多租户容器云平台。围绕云原生社区， KubeGems 提供了多 Kubernetes
          集群接入能力，并具备丰富的组件管理和资源成本分析功能，
          能够帮助企业快速的构建和打造一个本地化、功能强大且低成本的云管理平台。
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
                用户登录
                <v-btn v-if="ldap" class="float-right mt-1" color="primary" small text @click="toDefaultLogin">
                  返回
                </v-btn>
                <div class="kubegems__clear-float" />
              </h2>
              <v-form ref="loginForm" v-model="valid" action="/" lazy-validation>
                <v-text-field
                  v-model="username"
                  class="mt-4"
                  label="用户名"
                  outlined
                  required
                  :rules="usernameRules"
                  @keyup.enter="login(source)"
                />
                <v-text-field
                  v-model="password"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :counter="20"
                  label="密码"
                  outlined
                  required
                  :rules="passwordRules"
                  :type="show ? 'text' : 'password'"
                  @click:append="show = !show"
                  @keyup.enter="login(source)"
                />

                <v-btn
                  block
                  class="mr-4"
                  color="info"
                  :disabled="!valid"
                  :loading="Circular"
                  submit
                  @click="login(source)"
                >
                  {{ ldap ? $VENDOR[vendor] : '' }} 登录
                </v-btn>
              </v-form>
              <div v-if="enableOauthItems && enableOauthItems.length > 0 && !ldap" class="mt-5">
                <div class="login__divide">其他登录方式</div>
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
      <h6 class="px-12 text-body-2 mt-4 login__copyright font-weight-medium kubegems__text">
        © 2021 — KubeGems by Kubegems.io
      </h6>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getLoginUserAuth, getLoginUserInfo, getOauthAddr, getSystemAuthSource, postLogin } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';
  import { validateJWT } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Login',
    mixins: [BasePermission, BaseSelect],
    data: () => ({
      valid: true,
      password: '',
      show: false,
      passwordRules: [required, (v) => (v && v.length <= 20) || '多于20位'],
      username: '',
      usernameRules: [required],
      oauthItems: [],
      ldap: false,
      source: 'account',
      vendor: '',
    }),
    computed: {
      ...mapState(['JWT', 'Circular', 'Admin', 'AdminViewport', 'Scale', 'SelfOut']),
      ...mapGetters(['Environment', 'Project', 'Tenant', 'Cluster']),
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
    },
    mounted() {
      this.authSource();
      if (validateJWT(this.$route.query.token)) {
        this.$store.commit('SET_JWT', this.$route.query.token);
      }
      this.init();
    },
    methods: {
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
          this.$store.commit('SET_JWT', data.token);
          this.$store.commit('SET_VERSION', process.env.VUE_APP_RELEASE);
          await this.loadData();
          this.$store.commit('SET_SNACKBAR', {
            text: '登录成功',
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
            text: `已登录`,
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
      animation-timing-function: cubic-bezier(0.5);
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
      left: 43%;
      transform: none;
    }
  }

  @keyframes img-small {
    0% {
      width: 400px;
    }
    100% {
      width: 250px;
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
          animation-timing-function: cubic-bezier(0.5);
          animation-delay: 3.1s;
          animation-fill-mode: forwards;
        }

        &__img {
          &__ani {
            animation-name: img-small;
            animation-duration: 0.5s;
            animation-timing-function: cubic-bezier(0.5);
            animation-delay: 3.1s;
            animation-fill-mode: forwards;
          }
        }
      }

      &__desc {
        width: 55%;
        line-height: 1.5;
        font-size: 1rem;
        position: absolute;
        left: 43%;
        top: 48%;
        opacity: 0;

        &__ani {
          animation-name: desc-show;
          animation-duration: 0.5s;
          animation-timing-function: cubic-bezier(0.5);
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
</style>
