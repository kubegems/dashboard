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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" :loading="pluginUpdateLoading" small text @click="checkPluginUpdate">
            <v-icon left small> mdi-arrow-up-bold </v-icon>
            {{ $t('operate.check_upgrade') }}
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
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
                      <template v-if="getStatus(plugin).value === 'install' || plugin.upgradeableVersion">
                        <div class="float-left plugins__install"> {{ $t('tip.version') }} : </div>
                        <div class="float-left">
                          <VersionSelect
                            v-model="plugin.installedVersion"
                            :installed-version="plugin.installedVersion"
                            :versions="plugin.availableVersions"
                            @change="onVersionChanged(plugin.installedVersion, plugin.name)"
                          />
                        </div>
                      </template>
                      <template v-else>
                        <div class="float-left plugins__install">
                          {{ $t('tip.version') }} : {{ plugin.installedVersion }}
                        </div>
                      </template>
                      <template v-if="plugin.upgradeableVersion">
                        <UpgradeTip :index="index" :plugin="plugin" />
                      </template>
                      <template v-if="plugin.message">
                        <UpgradeMessage :index="index" :plugin="plugin" />
                      </template>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-flex class="float-right">
                  <v-btn v-if="plugin.upgradeableVersion" color="primary" small text @click="upgradePlugin(plugin)">
                    {{ $t('operate.upgrade') }}
                  </v-btn>
                  <v-btn v-if="plugin.enabled" color="primary" small text @click="upgradePlugin(plugin)">
                    {{ $t('operate.update') }}
                  </v-btn>
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
                  <v-btn v-else-if="!plugin.skip" color="primary" small text @click="upgradePlugin(plugin)">
                    {{ $t('operate.install') }}
                  </v-btn>
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-card-actions>

              <v-flex v-if="plugin.required" class="plugins__watermark-bg" />
              <v-flex
                v-if="plugin.required"
                :class="`${Locale === 'en' ? 'plugins__watermark-en' : 'plugins__watermark'} font-weight-medium`"
              >
                {{ $t('tip.inner') }}
              </v-flex>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-flex>
    <v-flex class="mb-2" />

    <CheckPluginVersion ref="checkPluginVersion" />
    <InstallPluginSchema ref="installPluginSchema" @refresh="pluginList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import CheckPluginVersion from './components/CheckPluginVersion';
  import InstallPluginSchema from './components/InstallPluginSchema';
  import UpgradeMessage from './components/UpgradeMessage';
  import UpgradeTip from './components/UpgradeTip';
  import VersionSelect from './components/VersionSelect';
  import messages from './i18n';
  import { deleteDisablePlugin, getClusterPluginsDetail, getClusterPluginsList, postCheckPluginUpdate } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Plugin',
    i18n: {
      messages: messages,
    },
    components: {
      CheckPluginVersion,
      InstallPluginSchema,
      UpgradeMessage,
      UpgradeTip,
      VersionSelect,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      tab: 0,
      pluginDict: {},
      interval: null,
      pluginUpdateLoading: false,
      plugin: {},
      tabItems: [],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'Locale']),
      ...mapGetters(['Cluster']),
      pluginGroup() {
        if (this.tabItems.length === 0) return {};
        if (this.tabItems[this.tab].value === 'Core') {
          return this.pluginDict.core || {};
        } else if (this.tabItems[this.tab].value === 'Kubernetes') {
          return this.pluginDict.kubernetes || {};
        } else {
          return this.pluginDict[this.tabItems[this.tab].value] || {};
        }
      },
    },
    mounted() {
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
        Object.keys(this.pluginDict).forEach((key) => {
          if (
            !this.tabItems.find((tab) => {
              return tab.value === key;
            })
          )
            if (key === 'core') {
              this.tabItems.push({ text: this.$t('tab.core'), value: 'core' });
            } else if (key === 'kubernetes') {
              this.tabItems.push({ text: this.$t('tab.kubernetes'), value: 'kubernetes' });
            } else {
              this.tabItems.push({ text: key, value: key });
            }
        });
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
      async upgradePlugin(plugin) {
        if (!this.plugin[plugin.name]) {
          await this.onVersionChanged(plugin.installedVersion, plugin.name);
        }
        if (plugin.values && JSON.stringify(plugin.values) !== '{}') {
          this.plugin[plugin.name].values = plugin.values;
        }
        this.$refs.installPluginSchema.init(this.plugin[plugin.name]);
        this.$refs.installPluginSchema.open();
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
            await deleteDisablePlugin(this.Cluster().ClusterName, param.plugin.name);
            this.pluginList(true);
          },
        });
      },
      getStatus(plugin) {
        if (plugin.enabled && !plugin.healthy) {
          return { text: this.$t('status.deploying'), color: 'warning', value: 'deploying' };
        } else if (plugin.enabled && plugin.required) {
          return { text: this.$t('status.installed'), color: '', value: 'installed' };
        } else if (plugin.enabled) {
          return { text: this.$t('operate.uninstall'), color: 'error', value: 'uninstall' };
        } else {
          return { text: this.$t('operate.install'), color: 'primary', value: 'install' };
        }
      },
      async checkPluginUpdate() {
        this.pluginUpdateLoading = true;
        const data = await postCheckPluginUpdate(this.Cluster().ClusterName);
        this.pluginUpdateLoading = false;
        this.$refs.checkPluginVersion.init(data);
        this.$refs.checkPluginVersion.open();
        this.pluginList();
      },
      async onVersionChanged(version, name) {
        const data = await getClusterPluginsDetail(this.Cluster().ClusterName, name, {
          version: version,
          noprocessing: true,
        });
        this.plugin[name] = data;
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

    &__watermark-en {
      position: absolute;
      top: 15px;
      right: -3px;
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

    &__install {
      line-height: 28px;
    }
  }
</style>
