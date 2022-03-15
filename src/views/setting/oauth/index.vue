<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-row class="mt-0">
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="12"
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
                <BaseLogo
                  class="mr-6 mt-1"
                  :icon-name="item.vendor.toLowerCase()"
                  :width="60"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>
                    {{ dn[item.vendor] }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 简介： </span>
                  {{ item.desc }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions
              v-if="!item.forbid"
              class="btn-position"
            >
              <v-spacer />
              <v-btn
                depressed
                text
                color="primary"
                @click="configAuthSource(item)"
              >
                配置
              </v-btn>
              <v-btn
                v-if="Object.prototype.hasOwnProperty.call(item, 'enabled')"
                depressed
                text
                :color="item.enabled ? `error` : `primary`"
                @click="operateAuthSource(item)"
              >
                {{ item.enabled ? '停止' : '启用' }}
              </v-btn>
            </v-card-actions>

            <v-flex
              v-if="item.enabled"
              class="oauth-watermark-bg"
            />
            <v-flex
              v-if="item.enabled"
              class="oauth-watermark font-weight-medium"
            >
              已启用
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <ConfigAuthSource
      ref="configAuthSource"
      @refresh="oauthSourceConfigList"
    />
  </v-container>
</template>

<script>
import { getAuthSourceConfigList, putAuthSourceConfig } from '@/api'
import ConfigAuthSource from './components/ConfigAuthSource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'OAuthSetting',
  components: {
    ConfigAuthSource,
  },
  data: () => ({
    breadcrumb: {
      title: '认证',
      tip: '基于 oauth2.0/ldap 的第三方认证集成, 用户可进行多种方式登录',
      icon: 'mdi-star',
    },
    dn: {
      kubegems: 'Kubegems',
      oauth: 'Oauth',
      ldap: 'Ldap',
      gitlab: 'GitLab',
      github: 'GitHub',
    },
    items: [{
      name: 'Kubegems (default)',
      kind: 'kubegems',
      desc: 'Kubegems 内置的数据库认证',
      enabled: true,
      forbid: true,
      vendor: 'kubegems',
    }, {
      name: 'Oauth',
      kind: 'OAUTH',
      desc: '使您的组织能够使用 Oauth 协议登录',
      vendor: 'oauth',
    }, {
      name: 'OpenLdap',
      kind: 'LDAP',
      desc: '使您的组织能够使用 Ldap 协议登录',
      vendor: 'ldap',
    }, {
      name: 'GitLab',
      kind: 'OAUTH',
      desc: '使您的组织能够使用 GitLab 账号登录',
      vendor: 'gitlab',
    }, {
      name: 'GitHub',
      kind: 'OAUTH',
      desc: '使您的组织能够使用 GitHub 账号登录',
      vendor: 'github',
    }],
  }),
  mounted() {
    this.$nextTick(() => {
      this.oauthSourceConfigList()
    })
  },
  methods: {
    async oauthSourceConfigList() {
      const data = await getAuthSourceConfigList({size: 1000})
      data.List.forEach(item => {
        const index = this.items.findIndex(i => { return i.vendor === item.vendor })
        let data = this.items[index]
        data = Object.assign(data, item)
        this.$set(this.items, index, data)
      })
    },
    configAuthSource(item) {
      if (item.id > 0) {
        this.$refs.configAuthSource.init(item, true)
      } else {
        this.$refs.configAuthSource.init(item, false)
      }
      this.$refs.configAuthSource.open()
    },
    async operateAuthSource(item) {
      this.$store.commit('SET_CONFIRM', {
        title: item.enabled ? `停止${item.kind}登录` : `启用${item.kind}登录`,
        content: {
          text: item.enabled ? `停止${item.kind}登录` : `启用${item.kind}登录`,
          type: 'confirm',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          const data = deepCopy(param.item)
          await putAuthSourceConfig(param.item.id, Object.assign(data, { enabled: !param.item.enabled }))
          this.oauthSourceConfigList()
        },
      })
    },
  },
}
</script>

<style scoped>
.full-height {
  height: 100%;
}

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

.btn-position {
  position: absolute;
  right: 10px;
  bottom: 0;
}
</style>
