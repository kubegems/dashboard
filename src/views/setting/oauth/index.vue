<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-row class="mt-0">
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="3"
      >
        <v-card
          v-if="item.add"
          class="kubegems__full-height"
          min-height="156"
        >
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item
              three-line
              class="kubegems__full-height"
            >
              <v-list-item-content>
                <v-btn
                  text
                  block
                  color="primary"
                  class="text-h6"
                  @click="addAuthSource"
                >
                  <v-icon left>mdi-plus</v-icon>
                  添加认证
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
        <v-hover
          v-else
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
                  :icon-name="item.kind.toLowerCase()"
                  :width="60"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>
                    {{ item.name }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 简介： </span>
                  {{ desc[item.kind.toLowerCase()] ? desc[item.kind.toLowerCase()] : '' }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions v-if="!item.forbid">
              <v-spacer />
              <v-btn
                text
                small
                color="primary"
                @click="updateAuthSource(item)"
              >
                更新
              </v-btn>
              <v-btn
                text
                small
                color="error"
                @click="removeAuthSource(item)"
              >
                删除
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

    <AddAuthSource
      ref="addAuthSource"
      @refresh="oauthSourceConfigList"
    />
    <UpdateAuthSource
      ref="updateAuthSource"
      @refresh="oauthSourceConfigList"
    />
  </v-container>
</template>

<script>
import { getAuthSourceConfigList, deleteAuthSourceConfig } from '@/api'
import AddAuthSource from './components/AddAuthSource'
import UpdateAuthSource from './components/UpdateAuthSource'

export default {
  name: 'OAuthSetting',
  components: {
    AddAuthSource,
    UpdateAuthSource,
  },
  data: () => ({
    breadcrumb: {
      title: '认证',
      tip: '基于 oauth2.0/ldap 的第三方认证集成, 用户可进行多种方式登录',
      icon: 'mdi-star',
    },
    items: [],
    desc: {
      kubegems: 'Kubegems 内置的数据库认证',
      ldap: '您的组织能够使用Ldap协议登录',
      oauth: '您的组织能够使用Oauth协议登录',
      gitlab: '您的组织能够使用 Gitlab 登录',
    },
  }),
  mounted() {
    this.$nextTick(() => {
      this.oauthSourceConfigList()
    })
  },
  methods: {
    async oauthSourceConfigList() {
      const data = await getAuthSourceConfigList({size: 1000})
      this.items = data.List
      this.items.splice(0, 0, {
        name: "kubegems (default)",
        enabled: true,
        kind: "kubegems",
        forbid: true,
      })
      this.items.push({ add: true })
    },
    addAuthSource() {
      this.$refs.addAuthSource.open()
    },
    updateAuthSource(item) {
      this.$refs.updateAuthSource.init(item)
      this.$refs.updateAuthSource.open()
    },
    removeAuthSource(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除第三方登录`,
        content: {
          text: `删除第三方登录 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteAuthSourceConfig(param.item.id)
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
</style>
