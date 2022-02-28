<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2 kubegems__detail text-subtitle-1">认证设置</v-card-title>
      <v-form
        class="pa-4"
        lazy-validation
      >
        <v-sheet
          v-for="( auth, index ) in oauthItems"
          :key="index"
          class="grey lighten-4 rounded my-2"
        >
          <v-list-item two-line>
            <v-list-item-content class="py-1">
              <v-list-item-subtitle class="text-body-2 py-0">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <Logo
                    class="mr-6 mt-1"
                    :icon-name="auth.logo"
                    :width="50"
                  />
                  <v-list-item-content class="py-0">
                    <v-list-item-title class="text-subtitle-2 py-1">
                      {{ auth.name }}
                      <v-chip
                        v-if="auth.enable"
                        class="ml-1"
                        small
                        color="success"
                      >
                        已启用
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 py-1">
                      {{ auth.desc }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-subtitle>
              <div class="kubegems__clear-float" />
            </v-list-item-content>
            <v-btn
              class="mx-1"
              depressed
              right
              small
              color="primary"
            >
              配置
            </v-btn>
            <v-btn
              v-if="auth.enable"
              class="mx-1"
              depressed
              right
              small
              color="error"
            >
              停止
            </v-btn>
          </v-list-item>
        </v-sheet>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import Logo from '@/views/resource/components/common/Logo'
import { getSystemConfigData } from '@/api'

export default {
  name: 'OAuthSetting',
  components: {
    Logo,
  },
  data: () => ({
    breadcrumb: {
      title: '认证',
      tip: '基于 oauth2.0 的第三方认证集成, 用户可进行多种方式登录',
      icon: 'mdi-star',
    },
    oauthItems: [
      { name: 'Kubegems (Default)', logo: 'kubegems', desc: 'Kubegems 内置的数据库认证', enable: true },
      { name: 'OpenLdap', logo: 'openldap', desc: '使您的组织能够使用 Ldap 协议登录', enable: false},
      { name: 'Oauth', logo: 'oauth', desc: '使您的组织能够使用 Oauth 协议登录', enable: false },
      { name: 'Gitlab', logo: 'gitlab', desc: '使您的组织能够使用 Gitlab 登录', enable: false },
    ],
  }),
  mounted() {
    this.$nextTick(() => {
      this.oauthConfig()
    })
  },
  methods: {
    async oauthConfig() {
      await getSystemConfigData('Oauth')
    },
  },
}
</script>
