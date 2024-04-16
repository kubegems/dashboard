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
  <BaseFullScreenDialog
    v-model="state.dialog"
    icon="mdi-console"
    :logo="config ? config.layout.LOGO_WHITE : ''"
    :title="i18nLocal.t('tip.terminal')"
    @dispose="dispose"
  >
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1 terminal__title">
        {{ termObj ? termObj.name : '' }}
        <template v-if="terminalType !== 'kubectl'">
          <v-btn color="white" depressed icon @click="openOnBlankTab">
            <v-icon color="white" small> mdi-open-in-new </v-icon>
          </v-btn>
        </template>
      </v-flex>
    </template>
    <template #action>
      <v-sheet v-if="terminalType !== 'kubectl'" class="text-subtitle-2 primary white--text float-left">
        <v-btn color="white" icon text @click="openFileViewer">
          <v-icon>mdi-sd</v-icon>
        </v-btn>
        <v-btn class="mx-2" color="white" icon text @click="refreshContainer">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        {{ i18n.t('resource.container') }}
        <v-menu
          v-model="state.containerMenu"
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
              <v-icon v-if="state.containerMenu" right> mdi-chevron-up </v-icon>
              <v-icon v-else right> mdi-chevron-down </v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: i18n.t('resource.container'), values: containers }]">
            <template #no-data>
              <v-card>
                <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat min-width="120">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ i18n.t('resource.container') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(con, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center mx-2"
                    link
                    :style="{ color: con.text === container ? `var(--primary-color) !important` : `` }"
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
      <div
        id="terminal"
        :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
        :style="{
          width: '100%',
          height: `calc(100vh - ${64 * store.state.Scale}px - 1px)`,
          backgroundColor: 'rgb(246, 246, 246)',
        }"
      />
      <FileViewer ref="fileViewer" />
    </template>
  </BaseFullScreenDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import 'xterm/css/xterm.css';
  import { computed, onUnmounted, reactive, ref } from 'vue';
  import { Terminal } from 'xterm';
  import { FitAddon } from 'xterm-addon-fit';

  import { useI18n } from '../i18n';
  import FileViewer from './FileViewer.vue';

  withDefaults(
    defineProps<{
      config?: { [key: string]: any };
    }>(),
    {
      config: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();
  const routeParams = useParams();

  const state = reactive({
    dialog: false,
    containerMenu: false,
  });

  const containers = ref([]);
  const container = ref('');
  const termObj = ref(void 0);
  const termArgs = ref({
    wsurl: '',
  });
  const termIns = ref(void 0);
  const fitAddonIns = ref(void 0);
  const websock = ref(void 0);
  const terminalType = ref('shell');
  const isEdge = ref(false);
  const isPAI = ref(false);

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
      if (ev.data instanceof ArrayBuffer) {
        try {
          const d = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(ev.data)));
          term.write(d);
        } catch (e) {
          console.log('binary frame error:', e);
        }
      } else {
        term.write(ev.data);
      }
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
    if (websocket) websocket.onmessage = webSocketMessage;

    if (bidirectional) {
      term.onData(terminalData);
    }

    // 关闭的时候处理
    if (websocket)
      websocket.addEventListener('close', function () {
        websocket.removeEventListener('message', webSocketMessage);
        delete term.socket;
        clearInterval(heartBeatTimer);
      });
  };

  const open = (from = 'kubegems'): void => {
    state.dialog = true;
    if (terminalType.value !== 'kubectl') {
      router.replace({
        query: {
          ...query.value,
          t_cluster: from === 'kubegems' ? useCluster() : store.getters.Region().ClusterName,
          t_namespace: termObj.value.namespace,
          t_pod: termObj.value.name,
          t_container: container.value,
        },
      });
    }
  };

  const init = (_container: string, item: any, type: string, _isEdge = false, _isPAI = false): void => {
    isEdge.value = _isEdge;
    isPAI.value = _isPAI;
    terminalType.value = type;
    termObj.value = deepCopy(item);

    if (terminalType.value !== 'kubectl') {
      container.value = _container;
    }
    initWebSocket();
  };

  defineExpose({
    open,
    init,
  });

  const setContainer = (con: any): void => {
    if (container.value !== con.value) {
      container.value = con.value;
      dispose();
      initWebSocket();
    }
  };

  const refreshContainer = (): void => {
    dispose(false);
    initWebSocket();
  };

  const dispose = async (clearQuery = true): Promise<void> => {
    if (websock.value && websock.value.readyState === 1) {
      websock.value.send(JSON.stringify({ type: 'close' }));
    }
    websock.value = void 0;
    doClose();
    if (window.opener) window.close();
    if (terminalType.value !== 'kubectl' && clearQuery) {
      await router.replace({
        params: routeParams.value,
        query: { ...query.value, t_cluster: null, t_namespace: null, t_pod: null },
      });
    }
  };

  const initWebSocket = (): void => {
    if (termObj.value && terminalType.value !== 'kubectl') {
      containers.value = [];
      termObj.value?.containers?.forEach((i) => {
        containers.value.push({
          text: i.name,
          value: i.name,
        });
      });
      if (container.value === '') container.value = containers.value[0].value;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    let url = '';
    switch (terminalType.value) {
      case 'shell':
        if (isEdge.value) {
          url = `${protocol}://${host}/api/v1/edge-clusters/${store.state.Edge}/proxy/custom/core/v1/namespaces/${termObj.value.namespace}/pods/${termObj.value.name}/actions/shell?stream=true&token=${store.state.JWT}&container=${container.value}`;
        } else {
          url = `${protocol}://${host}/api/v1/proxy/cluster/${
            isPAI.value ? store.getters.Region().ClusterName : useCluster()
          }/custom/core/v1/namespaces/${termObj.value.namespace}/pods/${
            termObj.value.name
          }/actions/shell?stream=true&token=${store.state.JWT}&container=${container.value}`;
        }
        break;
      case 'debug':
        if (isEdge.value) {
          url = `${protocol}://${host}/api/v1/edge-clusters/${store.state.Edge}/proxy/custom/core/v1/namespaces/${termObj.value.namespace}/pods/${termObj.value.name}/actions/debug?stream=true&container=${container.value}&token=${store.state.JWT}`;
        } else {
          url = `${protocol}://${host}/api/v1/proxy/cluster/${
            isPAI.value ? store.getters.Region().ClusterName : useCluster()
          }/custom/core/v1/namespaces/${termObj.value.namespace}/pods/${
            termObj.value.name
          }/actions/debug?stream=true&container=${container.value}&token=${store.state.JWT}`;
        }
        break;
      case 'kubectl':
        if (isEdge.value) {
          url = `${protocol}://${host}/api/v1/edge-clusters/${termObj.value.metadata.name}/proxy/custom/system/v1/kubectl?stream=true&token=${store.state.JWT}`;
        } else {
          url = `${protocol}://${host}/api/v1/proxy/cluster/${termObj.value.ClusterName}/custom/system/v1/kubectl?stream=true&token=${store.state.JWT}`;
        }
        break;
      default:
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.unknown_terminal'),
          color: 'warning',
        });
        return;
    }
    termArgs.value.wsurl = url;

    websock.value = new WebSocket(termArgs.value.wsurl);
    websock.value.binaryType = 'arraybuffer';

    websock.value.onopen = () => {
      initTermArgs();
    };

    websock.value.onerror = (e) => {
      console.log('ws error', e);
      doClose();
    };

    websock.value.onclose = (e) => {
      console.log('ws close', e);
      // this.term.setOption('cursorBlink', false);
      doClose();
    };
  };

  const initTermArgs = () => {
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
        selectionBackground: 'rgba(222, 184, 135, 0.5)',
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
      scrollback: 1000,
    });
    window.addEventListener('resize', windowResize);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById('terminal'));
    fitAddon.fit();
    term.focus();
    termIns.value = term;
    fitAddonIns.value = fitAddon;

    bindTerminal(termIns.value, websock.value, true);
    bindTerminalResize(termIns.value, websock.value);

    var msg = JSON.stringify({
      type: 'resize',
      rows: term.rows,
      cols: term.cols,
    });
    if (websock.value && websock.value.readyState === 1) {
      websock.value.send(msg);
    }
  };

  const windowResize = (): void => {
    fitAddonIns.value?.fit();
  };

  const doClose = (): void => {
    window.removeEventListener('resize', windowResize);
    if (termIns.value) {
      termIns.value.write(i18nLocal.t('tip.container_lost'));
      termIns.value.dispose();
    }
  };

  const openOnBlankTab = (): void => {
    const routeData = router.resolve({
      name: store.state.AdminViewport ? 'admin-terminal-viewer' : 'terminal-viewer',
      params: Object.assign(routeParams.value, { name: termObj.value.name }),
      query: {
        type: 'shell',
        namespace: termObj.value.namespace,
        cluster: isPAI.value ? store.getters.Region().ClusterName : useCluster(),
        container: container.value,
        isEdge: isEdge.value ? '1' : '0',
        isPAI: isPAI.value ? '1' : '0',
      },
    });
    dispose();
    state.dialog = false;
    window.open(routeData.href, '_blank');
  };

  const fileViewer = ref(null);
  const openFileViewer = () => {
    fileViewer.value.open();
  };

  onUnmounted(() => {
    if ((bindTerminal as any).heartBeatTimer) clearInterval((bindTerminal as any).heartBeatTimer);
  });
</script>

<style lang="scss" scoped>
  .terminal {
    &__title {
      max-width: 1300px;
      overflow: hidden;
    }
  }
</style>
