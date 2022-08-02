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
      ref="log"
      v-model="log"
      class="rounded-0"
      lang="yaml"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: false })"
      theme="chrome"
      @init="$aceinit"
      @keydown.stop
    />
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployLog',
    mixins: [BaseResource],
    props: {
      container: {
        type: String,
        default: () => '',
      },
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      log: '',
      logWebsocket: null,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1 - 45 * this.Scale;
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.initWebSocket();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      this.dispose();
    },
    methods: {
      initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${this.ThisCluster}/custom/core/v1/namespaces/${this.resource.namespace}/pods/${this.resource.name}/actions/logs?stream=true&container=${this.container}&token=${this.JWT}&tail=100&follow=true`;
        this.logWebsocket = new WebSocket(wsuri);
        this.logWebsocket.binaryType = 'arraybuffer';
        this.logWebsocket.onmessage = this.onWebsocketMessage;
        this.logWebsocket.onerror = this.onWebsocketError;
        if (this.$refs.log && this.$refs.log.editor) {
          this.$refs.log.editor.setOptions({ wrap: true });
          this.$refs.log.editor.session.on('change', () => {
            this.$refs.log.editor.renderer.scrollToLine(Number.POSITIVE_INFINITY);
          });
        }
      },
      onWebsocketError(e) {
        this.$store.commit('SET_SNACKBAR', {
          text: `${JSON.stringify(e)}`,
          color: 'warning',
        });
      },
      onWebsocketMessage(e) {
        this.log += e.data;
      },
      dispose() {
        if (this.logWebsocket && this.logWebsocket.readyState === 1) {
          this.logWebsocket.close();
        }
        this.logWebsocket = null;
        this.log = '';
      },
      refresh() {
        this.dispose();
        this.initWebSocket();
      },
    },
  };
</script>
