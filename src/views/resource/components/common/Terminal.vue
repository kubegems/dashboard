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
  <BaseFullScreenDialog v-model="dialog" icon="mdi-console" :title="$t('tip.terminal')" @dispose="dispose">
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1">
        {{ item ? item.name : '' }}
        <v-btn v-if="terminalType !== 'kubectl'" color="white" depressed icon @click="openOnBlankTab">
          <v-icon color="white" small> mdi-open-in-new </v-icon>
        </v-btn>
      </v-flex>
    </template>
    <template #action>
      <v-sheet v-if="terminalType !== 'kubectl'" class="text-subtitle-2 primary white--text">
        <v-btn class="mx-2" color="white" icon text @click="restartContainer">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        {{ $root.$t('resource.container') }}
        <v-menu
          v-model="containerMenu"
          bottom
          left
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn class="white--text mt-n1" color="primary" dark depressed v-on="on">
              {{ container }}
              <v-icon v-if="containerMenu" right> mdi-chevron-up </v-icon>
              <v-icon v-else right> mdi-chevron-down </v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: $root.$t('resource.container'), values: containers }]">
            <template #no-data>
              <v-card>
                <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat min-width="120">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ $root.$t('resource.container') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(con, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center mx-2"
                    link
                    :style="{ color: con.text === container ? `#1e88e5 !important` : `` }"
                    @click="setContainer(con)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">{{ con.text }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
    </template>
    <template #content>
      <div id="terminal" :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`" />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import 'xterm/css/xterm.css';
  import { Terminal } from 'xterm';
  import { FitAddon } from 'xterm-addon-fit';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  const bindTerminalResize = (term, websocket) => {
    const onTermResize = () => {
      var msg = JSON.stringify({
        type: 'resize',
        rows: term.rows,
        cols: term.cols,
      });
      websocket.send(msg);
    };
    term.onResize(onTermResize);
  };

  const bindTerminal = (term, websocket, bidirectional) => {
    term.socket = websocket;

    // 回显
    const webSocketMessage = function (ev) {
      term.write(ev.data);
    };
    // 心跳
    const heartBeatTimer = setInterval(function () {
      var msg = { type: 'heartbeat', input: '' };
      if (websocket && websocket.readyState === 1) {
        websocket.send(JSON.stringify(msg));
      }
    }, 20 * 1000);

    // 发数据
    const terminalData = function (data) {
      if (websocket && websocket.readyState === 1) {
        websocket.send(JSON.stringify({ type: 'input', input: data }));
      }
    };

    // 回显
    websocket.onmessage = webSocketMessage;
    if (bidirectional) {
      term.onData(terminalData);
    }
    // 关闭的时候处理
    websocket.addEventListener('close', function () {
      websocket.removeEventListener('message', webSocketMessage);
      delete term.socket;
      clearInterval(heartBeatTimer);
    });
  };

  export default {
    name: 'Terminal',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data() {
      return {
        dialog: false,
        containers: [],
        container: '',
        item: null,
        termArgs: {
          wsurl: '',
          cols: 300,
        },
        term: null,
        websock: null,
        terminalType: 'shell',
        containerMenu: false,
      };
    },
    computed: {
      ...mapState(['JWT', 'Scale', 'AdminViewport']),
      rows() {
        return parseInt((window.innerHeight - 64 * this.Scale - 10) / (18.5 * this.getRate()) - 2);
      },
      height() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
    },
    destroyed() {
      if (bindTerminal.heartBeatTimer) clearInterval(bindTerminal.heartBeatTimer);
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(container, item, type) {
        this.terminalType = type;
        this.item = deepCopy(item);
        if (this.terminalType !== 'kubectl') {
          this.container = container;
        }
        this.initWebSocket();
      },
      setContainer(con) {
        if (this.container !== con.value) {
          this.container = con.value;
          this.dispose();
          this.initWebSocket();
        }
      },
      restartContainer() {
        this.dispose();
        this.initWebSocket();
      },
      dispose() {
        if (this.websock && this.websock.readyState === 1) {
          this.websock.send(JSON.stringify({ type: 'close' }));
        }
        this.websock = null;
        this.doClose();
        if (window.opener) window.close();
      },
      initWebSocket() {
        if (this.item && this.terminalType !== 'kubectl') {
          this.containers = [];
          this.item.containers.forEach((i) => {
            this.containers.push({
              text: i.name,
              value: i.name,
            });
          });
          if (this.container === '') this.container = this.containers[0].value;
        }
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        let url = '';
        switch (this.terminalType) {
          case 'shell':
            url = `${protocol}://${host}/api/v1/proxy/cluster/${this.ThisCluster}/custom/core/v1/namespaces/${this.item.namespace}/pods/${this.item.name}/actions/shell?stream=true&token=${this.JWT}&container=${this.container}`;
            break;
          case 'debug':
            url = `${protocol}://${host}/api/v1/proxy/cluster/${this.ThisCluster}/custom/core/v1/namespaces/${this.item.namespace}/pods/${this.item.name}/actions/debug?stream=true&container=${this.container}&token=${this.JWT}`;
            break;
          case 'kubectl':
            url = `${protocol}://${host}/api/v1/proxy/cluster/${this.item.ClusterName}/custom/system/v1/kubectl?stream=true&token=${this.JWT}`;
            break;
          default:
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.unknown_terminal'),
              color: 'warning',
            });
            return;
        }
        this.termArgs.wsurl = url;

        this.websock = new WebSocket(this.termArgs.wsurl);
        this.websock.binaryType = 'arraybuffer';

        this.websock.onopen = () => {
          this.initTermArgs();
        };

        this.websock.onclose = () => {
          this.term.setOption('cursorBlink', false);
          this.doClose();
        };
      },
      initTermArgs() {
        const term = new Terminal({
          lineHeight: 1.1,
          cursorBlink: true,
          cursorStyle: 'underline',
          fontSize: 13,
          fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
          theme: {
            background: '#f6f6f6',
            foreground: '#4D4D4C',
            cursor: '#4D4D4C',
            selection: 'rgba(222, 184, 135, 0.5)',
            black: '#000000',
            red: '#D32F2F',
            green: '#43A047',
            yellow: '#F57F17',
            blue: '#1E88E5',
            magenta: '#303F9F',
            cyan: '#00BCD4',
            white: '#FFFFFF',
            brightBlack: '#000000',
            brightRed: '#D81B60',
            brightGreen: '#9CCC65',
            brightYellow: '#FBC02D',
            brightBlue: '#29B6F6',
            brightMagenta: '#26A69A',
            brightCyan: '#3949AB',
            brightWhite: '#FFFFFF',
          },
          rows: this.rows,
          cols: this.termArgs.cols,
          scrollback: 1000,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(document.getElementById('terminal'));
        fitAddon.fit();
        term.focus();
        this.term = term;

        bindTerminal(this.term, this.websock, true);
        bindTerminalResize(this.term, this.websock);
        const xtermScreen = document.querySelector('.xterm-screen');
        xtermScreen.style.height = `${this.height}px`;

        var msg = JSON.stringify({
          type: 'resize',
          rows: this.rows,
          cols: this.termArgs.cols,
        });
        this.websock.send(msg);
      },
      onWindowResize() {
        this.term.fit();
      },
      doLink(ev, url) {
        if (ev.type === 'click') {
          window.open(url);
        }
      },
      doClose() {
        this.term.write(this.$t('tip.container_lost'));
        window.removeEventListener('resize', this.onWindowResize);
        if (this.term) {
          this.term.dispose();
        }
      },
      getRate() {
        const rate = window.outerWidth / window.innerWidth;
        if (rate === 1) return 1;
        if (rate >= 0.9) return 1.08;
        if (rate >= 0.8) return 1.047;
        if (rate >= 0.75) return 1.045;
        return 1;
      },
      openOnBlankTab() {
        const routeData = this.$router.resolve({
          name: this.AdminViewport ? 'admin-terminal-viewer' : 'terminal-viewer',
          params: Object.assign(this.$route.params, { name: this.item.name }),
          query: {
            type: 'shell',
            namespace: this.item.namespace,
            cluster: this.ThisCluster,
            container: this.container,
          },
        });
        this.dispose();
        this.dialog = false;
        window.open(routeData.href, '_blank');
      },
    },
  };
</script>
