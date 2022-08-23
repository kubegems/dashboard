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
  <v-dialog v-model="dialog" height="100%" :max-width="700" persistent scrollable>
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img class="ma-2" contain :src="logo" width="200" />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-2 ma-4 font-weight-medium">
          {{ $root.$t('metadata.description') }}
        </h6>

        <v-flex v-for="(value, key) in version" :key="key" class="mx-4">
          <h6 class="text-body-2 grey--text text--darken-1 font-weight-regular"> {{ cnDict[key] }} : {{ value }} </h6>
        </v-flex>
      </v-card-text>
      <v-divider class="mt-4" />
      <v-card-title class="text-body-2 kubegems__text px-4">
        <div class="title__pointer" @click.stop="toProject">
          <v-btn class="float-left" icon small>
            <v-icon>mdi-github</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ $t('tip.project_address') }} </div>
        </div>

        <div class="ml-2 title__pointer" @click.stop="toIssue">
          <v-btn class="float-left" color="red lighten-1" icon small>
            <v-icon>mdi-bug</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ $t('tip.issue') }} </div>
        </div>

        <v-spacer />

        <div class="ml-2 title__pointer" @click.stop="toStar">
          <v-btn class="float-left" color="orange" icon small>
            <v-icon>mdi-star</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ $t('tip.star') }} </div>
        </div>
      </v-card-title>
      <div class="pa-2">
        <v-btn class="float-right" color="error" small text @click="dialog = false">
          {{ $root.$t('operate.close') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import messages from '../i18n';
  import { getPlatformVersion } from '@/api';

  export default {
    name: 'About',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        version: {},
        apiVersion: null,
        logo: this.$LOGO_BLUE,
      };
    },
    computed: {
      dashboardVersion() {
        return {
          version: process.env.VUE_APP_RELEASE,
          date: process.env.VUE_APP_DATE ? this.$moment(process.env.VUE_APP_DATE).format('lll') : '',
        };
      },
      cnDict() {
        return {
          version: this.$t('about.dashboard_version'),
          date: this.$t('about.dashboard_release_time'),
          GitVersion: this.$t('about.api_version'),
          GitCommit: 'Commit',
          BuildDate: this.$t('about.api_release_time'),
          GoVersion: this.$t('about.go_version'),
          Compiler: this.$t('about.compile'),
          Platform: this.$t('about.compile_platform'),
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
      toProject() {
        window.open('https://github.com/kubegems/kubegems');
      },
      toIssue() {
        window.open('https://github.com/kubegems/kubegems/issues');
      },
      toStar() {
        window.open('https://github.com/kubegems/kubegems');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item--dense,
  .v-list--dense .v-list-item {
    min-height: 30px;
  }

  .title {
    &__div {
      line-height: 28px;
    }

    &__pointer {
      cursor: pointer;
    }
  }
</style>
