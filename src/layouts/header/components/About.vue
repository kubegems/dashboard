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
  <v-dialog v-model="dialog" height="100%" :max-width="500" persistent scrollable>
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img class="ma-2" contain src="/logo-about.svg" width="200" />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-2 ma-4 font-weight-medium">
          KubeGems 是一款开源的企业级多租户容器云平台。围绕云原生社区， KubeGems 提供了多 Kubernetes
          集群接入能力，并具备丰富的组件管理和资源成本分析功能，
          能够帮助企业快速的构建和打造一个本地化、功能强大且低成本的云管理平台。
        </h6>

        <v-flex v-for="(value, key) in version" :key="key" class="mx-4">
          <h6 class="text-body-2 grey--text text--darken-1 font-weight-regular"> {{ cnDict[key] }} : {{ value }} </h6>
        </v-flex>
      </v-card-text>
      <div class="pa-2">
        <v-btn class="float-right" color="error" small text @click="dialog = false"> 关闭 </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { getPlatformVersion } from '@/api';

  export default {
    name: 'About',
    data() {
      return {
        dialog: false,
        version: {},
        cnDict: {
          version: 'Dashboard版本',
          date: 'Dashboard版本日期',
          GitVersion: 'Api版本',
          GitCommit: 'Commit',
          BuildDate: 'Api版本日期',
          GoVersion: 'Go版本',
          Compiler: '编译',
          Platform: '编译平台',
        },
        apiVersion: null,
      };
    },
    computed: {
      dashboardVersion() {
        return {
          version: process.env.VUE_APP_RELEASE,
          date: process.env.VUE_APP_DATE ? this.$moment(process.env.VUE_APP_DATE).format('lll') : '',
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        await this.platformVersion();
        this.version = Object.assign(this.apiVersion, this.dashboardVersion);
        if (this.apiVersion.BuildDate) {
          this.apiVersion.BuildDate = this.$moment(this.apiVersion.BuildDate).format('lll');
        }
      },
      async platformVersion() {
        const data = await getPlatformVersion({ noprocessing: true });
        this.apiVersion = data;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item--dense,
  .v-list--dense .v-list-item {
    min-height: 30px;
  }
</style>
