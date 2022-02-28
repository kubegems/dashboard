<template>
  <v-row :style="`height: ${height}px !important`">
    <v-col
      lg="7"
      class="info d-none d-md-flex align-center justify-center"
    >
      <div>
        <h2 class="text-h4 white--text font-weight-medium">
          <v-flex class="float-left">
            <v-img
              src="/logo.svg"
              width="220"
              contain
            />
          </v-flex>
          <v-flex
            class="float-left ml-2"
            style="
              line-height: 58px;
              font-weight: bold;
              font-family: Yuanti SC, YouYuan, Microsoft Yahei !important;
"
          >
            容器云平台
          </v-flex>
          <div class="kubegems__clear-float" />
        </h2>
        <h6 class="text-subtitle-1 mt-4 white--text font-weight-regular">
          在Kubernetes
          之上构建的面向云原生应用的操作平台，支持多云与多集群管理，提供全栈的IT
          自动化运维能力，简化DevOps 工作流。
        </h6>
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
            >
              <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2">
                用户登录
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
                  @keyup.enter="login"
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
                  @keyup.enter="login"
                />

                <v-btn
                  :disabled="!valid"
                  color="info"
                  block
                  class="mr-4"
                  submit
                  :loading="Circular"
                  @click="login"
                >
                  登录
                </v-btn>
              </v-form>
              <div class="mt-6">
                <v-chip
                  pill
                  @click="oauth"
                >
                  <v-avatar left>
                    <v-btn
                      color="grey lighten-4"
                      class="white--text"
                    >
                      <Icon
                        icon="logos:gitlab"
                        class="primary--text"
                        width="25px"
                        height="25px"
                      />
                    </v-btn>
                  </v-avatar>
                  sign in with gitlab
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </div>
        <h6 class="px-12 text-subtitle-1 mt-4 copyright">
          © 2021 — KubeGems by
          <a
            class="primary--text"
            href="https://cloudminds.com"
            target="_blank"
          >
            cloudminds.com
          </a>
        </h6>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postLogin, getLoginUserInfo, getLoginUserAuth, getOauthAddr } from '@/api'
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
  }),
  computed: {
    ...mapState(['JWT', 'Circular', 'Admin', 'AdminViewport', 'Scale']),
    ...mapGetters(['Environment', 'Project', 'Tenant', 'Cluster']),
    height() {
      return window.innerHeight / this.Scale + 12
    },
  },
  mounted() {
    if (validateJWT(this.$route.query.token)) {
      this.$store.commit('SET_JWT', this.$route.query.token)
    }
    this.init()
  },
  methods: {
    async login() {
      if (this.$refs.loginForm.validate(true)) {
        this.$store.commit('CLEARALL')
        const data = await postLogin({
          username: this.username,
          password: this.password,
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
        this.$route.params.cluster ||
        ['cluster-center', 'cluster-detail'].indexOf(this.$route.name) > -1
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
    async oauth() {
      const data = await getOauthAddr()
      window.location.href = data
    },
  },
}
</script>

<style lang="scss" scoped>
.copyright {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
