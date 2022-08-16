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
  <BasePanel v-model="panel" icon="fab fa-git" :title="$t('tip.change_content')" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3 text-subtitle-1">
        {{ commit ? commit.hash : '' }}
      </span>
    </template>
    <template #content>
      <v-card>
        <v-card v-for="value in diff" :key="value.name" flat>
          <v-card-text class="ma-0 pa-0">
            {{ value.name }}
          </v-card-text>
          <CodeDiff is-show-no-change :new-string="value.to" :old-string="value.from" />
        </v-card>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { CodeDiff } from 'v-code-diff';
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import { getAppResourceFileDiff } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppResourceFileDiff',
    i18n: {
      messages: messages,
    },
    components: {
      CodeDiff,
    },
    mixins: [BaseResource],
    data: () => ({
      panel: false,
      diff: [
        {
          from: '',
          to: '',
        },
      ],
      app: null,
      commit: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(app, item) {
        this.app = deepCopy(app);
        this.commit = deepCopy(item);
        this.appResourceFileDiff();
      },
      async appResourceFileDiff() {
        const data = await getAppResourceFileDiff(
          this.app.TenantID,
          this.app.ProjectID,
          this.ThisAppEnvironmentID,
          this.app.name,
          {
            hash: this.commit.hash,
          },
        );
        this.diff = data;
      },
      dispose() {
        this.diff = [
          {
            from: '',
            to: '',
          },
        ];
      },
    },
  };
</script>

<style lang="scss">
  .theme--light.v-application code {
    background-color: rgba(0, 0, 0, 0) !important;
    color: currentColor;
    font-size: 13px;
    line-height: 13px !important;
    font-family: Monaco, Menlo, Consolas, Courier New, monospace, PingFang SC;
  }

  .hljs {
    height: 22px !important;
  }

  .d2h-code-line {
    font-size: 13px !important;
  }

  .d2h-diff-tbody {
    overflow: auto !important;
  }
</style>
