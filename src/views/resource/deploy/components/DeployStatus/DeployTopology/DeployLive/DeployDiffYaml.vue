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
  <v-flex
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :style="{ height: `${height}px !important`, overflow: 'auto' }"
  >
    <CodeDiff is-show-no-change :new-string="predictedLiveState" :old-string="normalizedLiveState" />
  </v-flex>
</template>

<script>
  import { CodeDiff } from 'v-code-diff';
  import { mapState } from 'vuex';

  export default {
    name: 'DeployDiffYaml',
    components: {
      CodeDiff,
    },
    props: {
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      normalizedLiveState: '',
      predictedLiveState: '',
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1 - 45 * this.Scale;
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.normalizedLiveState = this.$yamldump(this.resource.normalizedLiveState);
            this.predictedLiveState = this.$yamldump(this.resource.predictedLiveState);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      dispose() {},
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
