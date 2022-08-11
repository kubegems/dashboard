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
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto oauth__pos" :elevation="hover ? 5 : 0" flat height="100%">
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
                  {{ $t(`tip.${item.name.toLowerCase()}`) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions v-if="!item.forbid" class="oauth__position">
              <v-spacer />
              <v-btn color="primary" depressed text @click="configAuthSource(item)"> {{ $t('operate.config') }} </v-btn>
              <v-btn
                v-if="Object.prototype.hasOwnProperty.call(item, 'enabled')"
                :color="item.enabled ? `error` : `primary`"
                depressed
                text
                @click="operateAuthSource(item)"
              >
                {{ item.enabled ? $t('disable') : $t('enable') }}
              </v-btn>
            </v-card-actions>

            <v-flex v-if="item.enabled" class="oauth__watermark-bg" />
            <v-flex v-if="item.enabled" class="oauth__watermark font-weight-medium">
              {{ $t('status.enabled') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <ConfigAuthSource ref="configAuthSource" @refresh="oauthSourceConfigList" />
  </v-container>
</template>

<script>
  import ConfigAuthSource from './components/ConfigAuthSource';
  import messages from './i18n';
  import { getAuthSourceConfigList, putAuthSourceConfig } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'OAuthSetting',
    i18n: {
      messages: messages,
    },
    components: {
      ConfigAuthSource,
    },
    data: () => ({
      items: [
        {
          name: 'Kubegems',
          kind: 'kubegems',
          enabled: true,
          forbid: true,
          vendor: 'kubegems',
        },
        {
          name: 'Oauth',
          kind: 'OAUTH',
          vendor: 'oauth',
        },
        {
          name: 'OpenLdap',
          kind: 'LDAP',
          vendor: 'ldap',
        },
        {
          name: 'GitLab',
          kind: 'OAUTH',
          vendor: 'gitlab',
        },
        {
          name: 'GitHub',
          kind: 'OAUTH',
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
          title: item.enabled ? this.$t('operate.disable_c', [item.kind]) : this.$t('operate.enable_c', [item.kind]),
          content: {
            text: item.enabled ? this.$t('operate.disable_c', [item.kind]) : this.$t('operate.enable_c', [item.kind]),
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

<style lang="scss" scoped>
  .oauth {
    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 120px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 13px;
      right: 4px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__position {
      position: absolute;
      right: 10px;
      bottom: 0;
    }
  }
</style>
