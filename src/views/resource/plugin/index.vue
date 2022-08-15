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
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <v-flex v-for="(plugins, key) in pluginGroup" :key="key">
      <v-flex class="kubegems__text text-subtitle-1 mt-3 font-weight-medium">
        {{ key }}
      </v-flex>
      <v-row class="mt-3">
        <v-col v-for="(plugin, index) in plugins" :key="index" class="pt-0" cols="3">
          <v-hover #default="{ hover }">
            <v-card class="mx-auto plugins__pos" :elevation="hover ? 5 : 0" flat height="180px">
              <v-list-item three-line>
                <v-list-item-avatar size="80" tile>
                  <BaseLogo :icon-name="plugin.name" :width="60" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="text-h6 mb-1 plugins__title">
                    <a @click="pluginPodList(plugin)">
                      {{ plugin.name }}
                    </a>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text--lighten-4">
                    {{ $t('tip.desc') }} : {{ plugin.description }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="!plugin.skip && plugin.enabled" class="text-body-2 text--lighten-4">
                    {{ $t('tip.status') }} :
                    <template v-if="plugin.enabled && !plugin.healthy">
                      <v-progress-circular color="warning" indeterminate size="16" :width="3" />
                    </template>
                    <v-icon v-else-if="plugin.healthy" color="success" small> mdi-check-circle </v-icon>
                    <v-icon v-else color="error" small> mdi-close-circle </v-icon>
                    <div class="kubegems__clear-float" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-card-actions class="plugins__action-pos">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle class="text-body-2 text--lighten-4">
                      <v-flex :id="`${plugin.name}-${index}`" />
                      {{ $t('tip.version') }} : {{ plugin.version }}
                      <v-menu
                        v-if="innerPlugins[plugin.name] && innerPlugins[plugin.name] !== plugin.version"
                        :attach="`#${plugin.name}-${index}`"
                        :close-delay="200"
                        max-width="250px"
                        nudge-bottom="-5px"
                        offset-y
                        open-on-hover
                        origin="bottom center"
                        right
                        top
                        transition="scale-transition"
                      >
                        <template #activator="{ on }">
                          <v-icon color="warning" right small v-on="on"> mdi-arrow-up-bold-circle </v-icon>
                        </template>
                        <v-card>
                          <v-list class="pa-0" dense>
                            <v-flex class="text-body-2 text-center primary white--text py-2">
                              <v-icon color="white" left small> mdi-alpha-v-circle </v-icon>
                              <span>{{ $t('tip.version') }}</span>
                            </v-flex>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item class="float-left pa-0" two-line>
                                  <v-list-item-content class="py-0">
                                    <v-list-item-title> {{ $t('tip.laset_version') }} </v-list-item-title>
                                    <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                                      {{ innerPlugins[plugin.name] }}
                                    </v-list-item-content>
                                  </v-list-item-content>
                                </v-list-item>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </v-menu>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-flex class="float-right">
                  <v-btn
                    v-if="plugin.enabled"
                    :color="getStatus(plugin).color"
                    :disabled="plugin.enabled && plugin.required"
                    small
                    :text="!plugin.required || (plugin.enabled && !plugin.healthy)"
                    @click="disablePlugin(plugin)"
                  >
                    {{ getStatus(plugin).text }}
                  </v-btn>
                  <v-btn v-else-if="!plugin.skip" color="primary" small text @click="enablePlugin(plugin)">
                    {{ $t('operate.install') }}
                  </v-btn>
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-card-actions>

              <v-flex v-if="plugin.required" class="plugins__watermark-bg" />
              <v-flex v-if="plugin.required" class="plugins__watermark font-weight-medium">
                {{ $t('tip.inner') }}
              </v-flex>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex class="mb-2" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from './i18n';
  import { getClusterPluginsList, getPlatformVersion, postDisablePlugin, postEnablePlugin } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Plugin',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      tab: 0,
      pluginDict: {},
      interval: null,
      apiVersion: null,
      uiVersion: null,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'Locale']),
      ...mapGetters(['Cluster']),
      pluginGroup() {
        if (this.tabItems[this.tab].value === 'Core') {
          return this.pluginDict.core || {};
        } else if (this.tabItems[this.tab].value === 'Kubernetes') {
          return this.pluginDict.kubernetes || {};
        }
        return {};
      },
      innerPlugins() {
        return {
          kubegems: this.apiVersion,
          'kubegems-local': this.apiVersion,
          'kubegems-installer': this.apiVersion,
        };
      },
      tabItems() {
        return [
          { text: this.$t('tab.core'), value: 'Core' },
          { text: this.$t('tab.kubernetes'), value: 'Kubernetes' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_cluster'),
              color: 'warning',
            });
            return;
          }
          this.watchPluginList();
        });
      }
    },
    destroyed() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
    methods: {
      watchPluginList() {
        this.pluginList();
        if (!this.interval) {
          this.interval = setInterval(() => {
            this.pluginList(true);
          }, 1000 * 60);
        }
      },
      async pluginList(process = false) {
        const data = await getClusterPluginsList(this.Cluster().ClusterName, {
          noprocessing: process,
        });
        this.pluginDict = data;
        this.platformVersion();
      },
      pluginPodList(plugin) {
        if (!plugin.enabled) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.enable_plugin'),
            color: 'warning',
          });
          return;
        }
        this.$store.commit('SET_NAMESPACE_FILTER', {
          Namespace: plugin.namespace,
          Mounted: false,
        });
        this.$router.push({
          name: 'pod-list',
          params: this.$route.params,
          query: { namespace: plugin.namespace },
        });
      },
      enablePlugin(plugin) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.install_c', [this.$root.$t('resource.plugin')]),
          content: {
            text: `${this.$t('operate.install_c', [this.$root.$t('resource.plugin')])} ${plugin.name}`,
            type: 'confirm',
          },
          param: { plugin },
          doFunc: async (param) => {
            await postEnablePlugin(this.Cluster().ClusterName, param.plugin.name, {
              type: this.tabItems[this.tab].value.toLocaleLowerCase(),
            });
            this.pluginList(true);
          },
        });
      },
      disablePlugin(plugin) {
        if (plugin.enabled && !plugin.healthy) {
          return;
        }
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.uninstall_c', [this.$root.$t('resource.plugin')]),
          content: {
            text: `${this.$t('operate.uninstall_c', [this.$root.$t('resource.plugin')])} ${plugin.name}`,
            type: 'confirm',
          },
          param: { plugin },
          doFunc: async (param) => {
            await postDisablePlugin(this.Cluster().ClusterName, param.plugin.name, {
              type: this.tabItems[this.tab].value.toLocaleLowerCase(),
            });
            this.pluginList(true);
          },
        });
      },
      getStatus(plugin) {
        if (plugin.enabled && !plugin.healthy) {
          return { text: this.$t('status.deploying'), color: 'warning' };
        } else if (plugin.enabled && plugin.required) {
          return { text: this.$t('status.installed'), color: '' };
        } else if (plugin.enabled) {
          return { text: this.$t('operate.uninstall'), color: 'error' };
        } else {
          return { text: this.$t('operate.install'), color: 'primary' };
        }
      },
      async platformVersion() {
        const data = await getPlatformVersion({ noprocessing: true });
        this.apiVersion = data?.GitVersion;
        this.uiVersion = process.env.VUE_APP_RELEASE;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .plugins {
    &__title {
      word-break: break-word;
      white-space: break-spaces;
      font-weight: bold;
      min-height: 38px;
      max-height: 57px;
    }

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 110px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 14px;
      right: -1px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__action-pos {
      position: absolute;
      bottom: 0;
      width: 100%;
    }
  }
</style>
