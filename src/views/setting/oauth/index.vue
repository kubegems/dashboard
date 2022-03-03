<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-row class="mt-0">
      <v-col
        v-for="(auth, index) in oauthItems"
        :key="index"
        cols="3"
      >
        <v-hover
          #default="{ hover }"
        >
          <v-card
            class="mx-auto oauth-pos"
            height="100%"
            :elevation="hover ? 5 : 0"
          >
            <v-list-item three-line>
              <v-list-item-avatar
                class="primary--text"
                tile
                size="80"
              >
                <Logo
                  class="mr-6 mt-1"
                  :icon-name="auth.logo"
                  :width="60"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>
                    {{ auth.name }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 简介： </span>
                  {{ auth.desc }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                small
                color="primary"
              >
                配置
              </v-btn>
              <v-btn
                text
                small
                color="error"
              >
                停止
              </v-btn>
            </v-card-actions>

            <v-flex
              v-if="auth.enable"
              class="oauth-watermark-bg"
            />
            <v-flex
              v-if="auth.enable"
              class="oauth-watermark font-weight-medium"
            >
              已启用
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
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
      { name: 'OpenLdap', logo: 'openldap', desc: '您的组织能够使用Ldap协议登录', enable: false},
      { name: 'Oauth', logo: 'oauth', desc: '您的组织能够使用Oauth协议登录', enable: false },
      { name: 'Gitlab', logo: 'gitlab', desc: '您的组织能够使用 Gitlab 登录', enable: false },
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

<style scoped>
.oauth-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oauth-watermark-bg {
  position: absolute;
  width: 120px;
  height: 90px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.oauth-watermark {
  position: absolute;
  top: 13px;
  right: 4px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}
</style>
