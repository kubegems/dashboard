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
    <ACEEditor
      v-model="kubeyaml"
      class="rounded-0"
      lang="yaml"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
      theme="chrome"
      @init="$aceinit"
      @keydown.stop
    />
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'DeployLiveYaml',
    props: {
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      kubeyaml: '',
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
            this.kubeyaml = this.$yamldump(this.resource.liveState);
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
