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
    icon="mdi-list-box"
    :logo="config ? config.layout.LOGO_WHITE : ''"
    :title="i18nLocal.t('tip.log')"
    @dispose="dispose"
  >
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1">
        {{ item ? item.name : '' }}
        <v-btn color="white" depressed icon @click="openOnBlankTab">
          <v-icon color="white" small> mdi-open-in-new </v-icon>
        </v-btn>
      </v-flex>
    </template>
    <template #action>
      <v-sheet class="text-subtitle-2 primary white--text float-left mr-2">
        {{ i18nLocal.t('tip.count') }}
        <v-menu
          v-model="state.countMenu"
          bottom
          left
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn class="white--text mt-n1" color="primary" dark depressed v-on="on">
              {{ count }}
              <v-icon v-if="state.countMenu" right> mdi-chevron-up </v-icon>
              <v-icon v-else right> mdi-chevron-down </v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: i18nLocal.t('tip.count'), values: counts }]">
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat>
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ i18nLocal.t('tip.count') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(cou, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center"
                    link
                    :style="{ color: cou.text === count ? `var(--primary-color) !important` : `` }"
                    @click="updateCount(cou)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">
                        {{ cou.text }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                  <v-text-field
                    id="logCount"
                    v-model="countText"
                    class="ma-1"
                    dense
                    flat
                    hide-details
                    :placeholder="i18nLocal.t('tip.count_placehold')"
                    solo
                    :style="{ width: `120px` }"
                    @click.stop
                    @focus.stop
                    @keyup.enter="setCustomCount"
                  />
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <v-flex class="text-subtitle-2 float-left primary white--text mt-1">
        {{ i18nLocal.t('tip.stream') }}
        <v-switch
          v-model="stream"
          class="pl-2 white--text float-right"
          color="white"
          dense
          hide-details
          @change="onStreamSwitchChange"
        />
      </v-flex>
      <v-flex class="text-subtitle-2 float-left primary white--text mt-1">
        {{ i18nLocal.t('tip.breakline') }}
        <v-switch
          v-model="linenotbreak"
          class="pl-2 white--text float-right"
          color="white"
          dense
          hide-details
          @change="linebreakSwitchChanged"
        />
      </v-flex>
      <v-sheet class="text-subtitle-2 primary white--text float-left">
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
              <v-card v-for="item in props.items" :key="item.text" flat>
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ i18n.t('resource.container') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(con, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center"
                    link
                    :style="{
                      color:
                        con.text === container || con.text === `${container} (init)`
                          ? `var(--primary-color) !important`
                          : ``,
                    }"
                    @click="setContainer(con)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">
                        {{ con.text }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <div class="kubegems__clear-float" />
    </template>
    <template #content>
      <BaseACEEditor
        ref="log"
        v-model="logContent"
        :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')} rounded-0`"
        :height="`${height}px`"
        lang="yaml"
        :options="options"
        theme="chrome"
        @keydown.stop
      />
    </template>
  </BaseFullScreenDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useParams, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy, sleep } from '@kubegems/libs/utils/helpers';
  import { computed, reactive, ref } from 'vue';

  import { useI18n } from './i18n';

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
  const routeParams = useParams();

  const state = reactive({
    dialog: false,
    countMenu: false,
    containerMenu: false,
  });

  const container = ref('');
  const containers = ref([]);
  const isEdge = ref(false);
  const item = ref(void 0);
  const isPAI = ref(false);

  const counts = [
    { text: 100, value: 100 },
    { text: 500, value: 500 },
  ];

  const options = ref({
    tabSize: 2,
    fontSize: 12,
    printMarginColumn: 100,
    showPrintMargin: false,
    readOnly: true,
    wrap: false,
  });

  const height = computed(() => {
    return window.innerHeight - 64 * store.state.Scale - 1;
  });

  const open = (): void => {
    state.dialog = true;
  };

  const init = (_container: string, _item, _isEdge = false, _isPAI = false): void => {
    isEdge.value = _isEdge;
    isPAI.value = _isPAI;
    item.value = deepCopy(_item);
    container.value = _container;
    selectData();
    initWebSocket();
  };

  defineExpose({
    open,
    init,
  });

  const selectData = (): void => {
    if (item.value) {
      containers.value = [];
      item.value?.containers?.forEach((i) => {
        containers.value.push({
          text: i.showName || i.name,
          value: i.name,
        });
      });
      if (container.value === '') container.value = containers.value[0].value;
    }
  };

  const logWebsocket = ref(void 0);
  const onStreamSwitchChange = (): void => {
    if (logWebsocket.value) {
      logWebsocket.value.close();
      logWebsocket.value = null;
    }
    initWebSocket(false);
  };

  const log = ref(null);
  const linenotbreak = ref(false);
  const linebreakSwitchChanged = (): void => {
    if (log.value?.$refs?.log && log.value?.$refs?.log.editor) {
      log.value?.$refs?.log.editor.setOptions({ wrap: linenotbreak.value });
    }
  };

  const setContainer = (con): void => {
    if (container.value !== con.value) {
      container.value = con.value;
      if (logWebsocket.value) {
        logWebsocket.value.close();
        logWebsocket.value = null;
      }
      initWebSocket();
    }
  };

  const countText = ref(void 0);
  const setCustomCount = () => {
    if (countText.value) {
      if (!new RegExp('^\\d+$').test(countText.value)) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.input_number'),
          color: 'warning',
        });
        return;
      }
      updateCount({ value: parseInt(countText.value) });
    }
    state.countMenu = false;
  };

  const count = ref(200);
  const updateCount = (cou) => {
    if (count.value !== cou.value) {
      count.value = cou.value;
      if (logWebsocket.value) {
        logWebsocket.value.close();
        logWebsocket.value = null;
      }
      initWebSocket();
    }
  };

  const logContent = ref('');
  const stream = ref(false);
  const initWebSocket = async (clear = true): Promise<void> => {
    await sleep(100);
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    let wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${
      isPAI.value ? store.getters.Region().ClusterName : useCluster()
    }/custom/core/v1/namespaces/${item.value.namespace}/pods/${item.value.name}/actions/logs?stream=true&container=${
      container.value
    }&token=${store.state.JWT}&tail=${clear ? count.value : 0}&follow=${stream.value}`;
    if (isEdge.value) {
      wsuri = `${protocol}://${host}/api/v1/edge-clusters/${store.state.Edge}/proxy/custom/core/v1/namespaces/${
        item.value.namespace
      }/pods/${item.value.name}/actions/logs?stream=true&container=${container.value}&token=${store.state.JWT}&tail=${
        clear ? count.value : 0
      }&follow=${stream.value}`;
    }
    logWebsocket.value = new WebSocket(wsuri);
    logWebsocket.value.binaryType = 'arraybuffer';
    logWebsocket.value.onopen = () => {
      if (clear) {
        logContent.value = '';
      }
    };
    logWebsocket.value.onmessage = onWebsocketMessage;
    logWebsocket.value.onerror = onWebsocketError;
    logWebsocket.value.onclose = (e) => {
      console.log('log close', e);
      if (e.code === 1006 && stream.value) {
        logWebsocket.value = null;
        initWebSocket();
      }
      // this.dispose()
      // this.dialog = false
    };
    if (log.value?.$refs?.log && log.value?.$refs?.log.editor) {
      log.value?.$refs?.log.editor.session.on('change', () => {
        log.value?.$refs?.log.editor.renderer.scrollToLine(Number.POSITIVE_INFINITY);
      });
    }
  };

  const onWebsocketError = (e): void => {
    if (e?.target?.readyState === 3) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.connect_closed'),
        color: 'warning',
      });
      return;
    }
    store.commit('SET_SNACKBAR', {
      text: `${JSON.stringify(e)}`,
      color: 'warning',
    });
  };

  const onWebsocketMessage = (e): void => {
    if (log.value?.$refs?.log?.editor?.session.getLength() > 10000) {
      logContent.value = '';
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.count_limit'),
        color: 'warning',
      });
    }
    if (e.data instanceof ArrayBuffer) {
      try {
        const d = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(e.data)));
        logContent.value += d;
      } catch (e) {
        console.log('binary frame error:', e);
      }
    } else {
      logContent.value += e.data;
    }
  };

  const dispose = (): void => {
    if (logWebsocket.value && logWebsocket.value.readyState === 1) {
      logWebsocket.value.close();
    }
    logWebsocket.value = null;
    logContent.value = '';
    stream.value = false;
    linenotbreak.value = false;
    if (window.opener) window.close();
  };

  const openOnBlankTab = (): void => {
    const routeData = router.resolve({
      name: store.state.AdminViewport ? 'admin-container-log-viewer' : 'container-log-viewer',
      params: Object.assign(routeParams.value, { name: item.value.name }),
      query: {
        namespace: item.value.namespace,
        cluster: useCluster(),
        container: container.value,
      },
    });
    dispose();
    state.dialog = false;
    window.open(routeData.href, '_blank');
  };
</script>

<style lang="scss" scoped>
  .v-input--selection-controls {
    margin-top: 0 !important;
  }
</style>

<style lang="scss">
  #logCount {
    text-align: center;
  }
</style>
