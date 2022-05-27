<template>
  <v-row :style="`height: ${height}px !important`">
    <v-col
      lg="7"
      class="info d-none d-md-flex align-center justify-start"
    >
      <div :style="{ paddingLeft: '100px' }">
        <h2 class="text-h4 white--text font-weight-medium">
          <v-flex class="float-left">
            <v-img
              src="/logo.svg"
              width="250"
              contain
            />
          </v-flex>
          <v-flex
            class="float-left ml-2 font"
          >
            容器云平台
          </v-flex>
          <div class="kubegems__clear-float" />
        </h2>
        <div
          class="mt-4 white--text"
          :style="{ width: '700px', lineHeight: '1.5', fontSize: '1.1rem' }"
        >
          KubeGems 是一款开源的企业级多租户容器云平台。围绕云原生社区，
          KubeGems 提供了多 Kubernetes 集群接入能力，并具备丰富的组件管理和资源成本分析功能，
          能够帮助企业快速的构建和打造一个本地化、功能强大且低成本的云管理平台。
        </div>
      </div>
    </v-col>
    <v-col
      cols="12"
      lg="5"
      class="d-flex align-center"
      style="position: relative;"
    >
      <v-container>
        <div class="pa-7 pa-sm-12">
          <v-row>
            <v-col
              cols="12"
              lg="9"
              xl="6"
              class="login"
            >
              <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2">
                用户登录
                <v-btn
                  v-if="ldap"
                  class="float-right mt-1"
                  color="primary"
                  text
                  small
                  @click="toDefaultLogin"
                >
                  返回
                </v-btn>
                <div class="kubegems__clear-float" />
              </h2>
              <v-form
                ref="loginForm"
                v-model="valid"
                lazy-validation
                action="/"
              >
                <v-text-field
                  v-model="username"
                  :rules="usernameRules"
                  label="用户名"
                  class="mt-4"
                  required
                  outlined
                  @keyup.enter="login(source)"
                />
                <v-text-field
                  v-model="password"
                  :counter="20"
                  :rules="passwordRules"
                  label="密码"
                  required
                  outlined
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show ? 'text' : 'password'"
                  @click:append="show = !show"
                  @keyup.enter="login(source)"
                />

                <v-btn
                  :disabled="!valid"
                  color="info"
                  block
                  class="mr-4"
                  submit
                  :loading="Circular"
                  @click="login(source)"
                >
                  {{ ldap ? $VENDOR[vendor] : '' }} 登录
                </v-btn>
              </v-form>
              <div
                v-if="enableOauthItems && enableOauthItems.length > 0 && !ldap"
                class="mt-5"
              >
                <div class="divide">其他登录方式</div>
                <div class="mt-4 text-center">
                  <v-avatar
                    v-for="(item, index) in enableOauthItems"
                    :key="index"
                    left
                    width="40"
                    min-width="40"
                    height="40"
                    class="mr-3 kubegems__pointer"
                    @click="oauth(item)"
                  >
                    <BaseLogo
                      class="primary--text logo-margin"
                      :icon-name="item.vendor.toLowerCase()"
                      :width="40"
                      :ml="0"
                    />
                  </v-avatar>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
        <h6 class="px-12 text-body-2 mt-4 copyright font-weight-medium kubegems__detail">
          © 2021 — KubeGems by Kubegems.io
        </h6>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postLogin, getLoginUserInfo, getLoginUserAuth, getOauthAddr, getSystemAuthSource } from '@/api'
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'
import { validateJWT } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'Login',
  mixins: [BaseSelect, BasePermission],
  data: () => ({
    valid: true,
    password: '',
    show: false,
    passwordRules: [
      required,
      (v) => (v && v.length <= 20) || '多于20位',
    ],
    username: '',
    usernameRules: [required],
    oauthItems: [],
    ldap: false,
    source: 'account',
    vendor: '',
  }),
  computed: {
    ...mapState(['JWT', 'Circular', 'Admin', 'AdminViewport', 'Scale']),
    ...mapGetters(['Environment', 'Project', 'Tenant', 'Cluster']),
    height() {
      return window.innerHeight / this.Scale + 12
    },
    enableOauthItems() {
      return this.oauthItems.filter(item => { return item.enabled })
    },
  },
  mounted() {
    this.authSource()
    if (validateJWT(this.$route.query.token)) {
      this.$store.commit('SET_JWT', this.$route.query.token)
    }
    this.init()
  },
  methods: {
    async authSource() {
      const data = await getSystemAuthSource()
      this.oauthItems = data
    },
    async login() {
      if (this.$refs.loginForm.validate(true)) {
        this.$store.commit('CLEARALL')
        const data = await postLogin({
          username: this.username,
          password: this.password,
          source: this.source,
        })
        this.$store.commit('SET_JWT', data.token)
        await this.loadData()
        this.$store.commit('SET_SNACKBAR', {
          text: '登录成功',
          color: 'success',
        })
        this.redirect()
      }
    },
    async loginUserAuth() {
      const data = await getLoginUserAuth()
      this.$store.commit('SET_USER_AUTH', data)
    },
    async loadData() {
      const data = await getLoginUserInfo()
      this.$store.commit('SET_USER', data)
      this.$store.commit('SET_ADMIN', data.SystemRole.RoleCode === 'sysadmin')
      await this.loginUserAuth()
    },
    async redirect() {
      if (
        this.$route.params.cluster
      ) {
        await this.$store.dispatch('UPDATE_CLUSTER_DATA')
        this.$store.commit('SET_ADMIN_VIEWPORT', true)
        if (this.Admin && this.Cluster().ID > 0) {
          if (this.$route.query.redirect !== undefined) {
            this.$router.push({ path: this.$route.query.redirect })
          } else {
            this.$router.push({ name: 'cluster-center' })
          }
        } else {
          this.$router.push({ name: 'whitepage' })
        }
      } else {
        await this.$store.dispatch('UPDATE_TENANT_DATA')
        if (this.Tenant().ID > 0) {
          if (this.$route.query.redirect !== undefined) {
            this.$router.push({ path: this.$route.query.redirect })
          } else {
            this.$router.push({
              name: 'resource-dashboard',
              params: {
                tenant: this.Tenant().TenantName,
              },
            })
          }
        } else {
          this.$router.push({ name: 'whitepage' })
        }
      }
    },
    async init() {
      if (this.JWT != null && validateJWT(this.JWT)) {
        this.$store.commit('SET_SNACKBAR', {
          text: `已登录`,
          color: 'success',
        })
        await this.loadData()
        this.redirect()
      }
    },
    toDefaultLogin() {
      this.ldap = false
      this.source = 'account'
    },
    async oauth(auth) {
      if (auth.kind === 'OAUTH') {
        const data = await getOauthAddr({ source: auth.name })
        window.location.href = data
      } else if (auth.kind === 'LDAP') {
        this.ldap = true
        this.source = auth.name
        this.vendor = auth.vendor
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.copyright {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
}

.logo-margin {
  margin-left: 0 !important;
  margin-top: 5px !important;
}

.divide {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: grey;
}

.divide::before,
.divide::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #cccccc;
}

.divide::before {
  margin-right: 0.25rem;
}

.divide::after {
  margin-left: 0.25rem;
}

.login {
  margin: auto;
}

.font {
  line-height: 66px;
  font-weight: bold;
  font-family: Yuanti SC, YouYuan, Microsoft Yahei !important;
}
</style>
