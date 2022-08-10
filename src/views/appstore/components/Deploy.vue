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
  <BaseFullScreenDialog v-model="dialog" kubegems-logo :title="$root.$t('header.app_store')" @dispose="dispose">
    <template #content>
      <v-flex :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <AppInfo
              :app-name="currentApp.name"
              :class="`zoom-${Scale.toString().replaceAll('.', '-')}`"
              :current-app="currentApp"
              :readonly="true"
              :select-repo="selectRepo"
              :select-version="selectVersion"
              :show-version="false"
              :versions="versions"
            />
          </v-col>
          <v-flex class="py-2">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <DeployWizard
              ref="deployWizard"
              class="deploy-wizard-overflow-y"
              :current-app="currentApp"
              :files="files"
              :select-repo="selectRepo"
              :style="{ height: `${wizardHeight}px;` }"
              :versions="versions"
              v-on="$listeners"
            />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import AppInfo from './AppInfo';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'Deploy',
    // 异步导入防止递归循环导入
    components: {
      AppInfo,
      DeployWizard: () => import('./DeployWizard'),
    },
    mixins: [BaseSelect],
    props: {
      currentApp: {
        type: Object,
        default: () => {},
      },
      files: {
        type: Object,
        default: () => {},
      },
      selectRepo: {
        type: String,
        default: () => '',
      },
      selectVersion: {
        type: String,
        default: () => '',
      },
      versions: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      dialog: false,
    }),
    computed: {
      ...mapState(['Scale']),
      wizardHeight() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        this.$refs.deployWizard.setData({
          selectVersion: this.selectVersion,
          app: this.currentApp.name,
        });
        await this.$refs.deployWizard.parseFiles();
      },
      dispose() {
        this.$refs.deployWizard.reset();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .deploy-wizard-overflow-y {
    overflow-y: auto;
  }
</style>
