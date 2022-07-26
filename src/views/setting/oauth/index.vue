<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto oauth-pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" size="80" tile>
                <BaseLogo class="mr-6 mt-1" :icon-name="item.vendor.toLocaleLowerCase()" :width="60" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>
                    {{ $VENDOR[item.vendor] }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 简介： </span>
                  {{ item.desc }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions v-if="!item.forbid" class="btn-position">
              <v-spacer />
              <v-btn color="primary" depressed text @click="configAuthSource(item)"> 配置 </v-btn>
              <v-btn
                v-if="Object.prototype.hasOwnProperty.call(item, 'enabled')"
                :color="item.enabled ? `error` : `primary`"
                depressed
                text
                @click="operateAuthSource(item)"
              >
                {{ item.enabled ? '停止' : '启用' }}
              </v-btn>
            </v-card-actions>

            <v-flex v-if="item.enabled" class="oauth-watermark-bg" />
            <v-flex v-if="item.enabled" class="oauth-watermark font-weight-medium"> 已启用 </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <ConfigAuthSource ref="configAuthSource" @refresh="oauthSourceConfigList" />
  </v-container>
</template>

<script>
  import ConfigAuthSource from './components/ConfigAuthSource';
  import { getAuthSourceConfigList, putAuthSourceConfig } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'OAuthSetting',
    components: {
      ConfigAuthSource,
    },
    data: () => ({
      items: [
        {
          name: 'Kubegems (default)',
          kind: 'kubegems',
          desc: 'Kubegems 内置的数据库认证',
          enabled: true,
          forbid: true,
          vendor: 'kubegems',
        },
        {
          name: 'Oauth',
          kind: 'OAUTH',
          desc: '使您的组织能够使用 Oauth 协议登录',
          vendor: 'oauth',
        },
        {
          name: 'OpenLdap',
          kind: 'LDAP',
          desc: '使您的组织能够使用 Ldap 协议登录',
          vendor: 'ldap',
        },
        {
          name: 'GitLab',
          kind: 'OAUTH',
          desc: '使您的组织能够使用 GitLab 账号登录',
          vendor: 'gitlab',
        },
        {
          name: 'GitHub',
          kind: 'OAUTH',
          desc: '使您的组织能够使用 GitHub 账号登录',
          vendor: 'github',
        },
      ],
    }),
    mounted() {
      this.$nextTick(() => {
        this.oauthSourceConfigList();
      });
    },
    methods: {
      async oauthSourceConfigList() {
        const data = await getAuthSourceConfigList({ size: 1000 });
        data.List.forEach((item) => {
          const index = this.items.findIndex((i) => {
            return i.vendor === item.vendor;
          });
          let data = this.items[index];
          data = Object.assign(data, item);
          this.$set(this.items, index, data);
        });
      },
      configAuthSource(item) {
        if (item.id > 0) {
          this.$refs.configAuthSource.init(item, true);
        } else {
          this.$refs.configAuthSource.init(item, false);
        }
        this.$refs.configAuthSource.open();
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
            const data = deepCopy(param.item);
            await putAuthSourceConfig(param.item.id, Object.assign(data, { enabled: !param.item.enabled }));
            this.oauthSourceConfigList();
          },
        });
      },
    },
  };
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

  .btn-position {
    position: absolute;
    right: 10px;
    bottom: 0;
  }
</style>
