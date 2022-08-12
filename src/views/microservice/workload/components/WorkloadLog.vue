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
  <v-card flat>
    <v-card-text class="px-0 py-3">
      <v-flex class="ma-1 mx-3 pb-2 pt-1">
        <v-sheet class="text-body-2 primary--text float-right mt-n1">
          <span class="kubegems__text"> {{ $root.$t('resource.container') }} </span>
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
              <v-btn class="primary--text mt-n1" color="white" dark depressed v-on="on">
                {{ container }}
                <v-icon v-if="containerMenu" right> mdi-chevron-up </v-icon>
                <v-icon v-else right> mdi-chevron-down </v-icon>
              </v-btn>
            </template>
            <v-data-iterator
              hide-default-footer
              :items="[{ text: $root.$t('resource.container'), values: containers }]"
            >
              <template #no-data>
                <v-card>
                  <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat>
                  <v-list dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>{{ $root.$t('resource.container') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(con, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center"
                      link
                      :style="{ color: con.text === container ? `#1e88e5 !important` : `` }"
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
        <v-sheet class="text-body-2 primary--text float-right mt-n1">
          <span class="kubegems__text"> {{ $root.$t('resource.pod') }} </span>
          <v-menu
            v-model="podMenu"
            bottom
            left
            nudge-bottom="5px"
            offset-y
            origin="top center"
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-btn class="primary--text mt-n1" color="white" dark depressed v-on="on">
                {{ pod.metadata.name }}
                <v-icon v-if="podMenu" right> mdi-chevron-up </v-icon>
                <v-icon v-else right> mdi-chevron-down </v-icon>
              </v-btn>
            </template>
            <v-data-iterator hide-default-footer :items="[{ text: $root.$t('resource.pod'), values: pods }]">
              <template #no-data>
                <v-card>
                  <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat>
                  <v-list dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>{{ $root.$t('resource.pod') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(p, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center"
                      link
                      :style="{ color: p.metadata.name === pod.metadata.name ? `#1e88e5 !important` : `` }"
                      @click="setPod(p)"
                    >
                      <v-list-item-content>
                        <span class="font-weight-medium">
                          {{ p.metadata.name }}
                        </span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </v-sheet>

        <v-flex class="text-subtitle-2 float-right primary--text">
          <span class="kubegems__text"> {{ $t('tip.realtime') }} </span>
          <v-switch
            v-model="stream"
            class="pl-2 primary--text float-right switch-mt"
            color="primary"
            dense
            hide-details
            @change="onStreamSwitchChange"
          />
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <ACEEditor
        ref="log"
        v-model="log"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded mx-3`"
        lang="yaml"
        :options="
          Object.assign($aceOptions, {
            readOnly: true,
            wrap: false,
          })
        "
        :style="{
          height: `${height}px !important`,
          width: 'auto',
        }"
        theme="chrome"
        @init="$aceinit"
        @keydown.stop
      />
    </v-card-text>
  </v-card>
</template>
<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getPodList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'WorkloadLog',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      container: '',
      containers: [],
      pod: { metadata: {} },
      pods: [],
      log: '',
      logWebsocket: null,
      stream: true,
      linenotbreak: true,
      containerMenu: false,
      podMenu: false,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      height() {
        return window.innerHeight - parseInt(350 * this.Scale) - 12;
      },
    },
    watch: {
      item: {
        handler() {
          this.$nextTick(() => {
            this.init();
          });
        },
        immediate: true,
      },
    },
    destroyed() {
      this.dispose();
    },
    methods: {
      async init() {
        await this.getContainerSelectData();
        this.initWebSocket();
      },
      async podList() {
        const data = await getPodList(this.$route.query.cluster, this.$route.query.namespace, {
          size: 1000,
          topkind: this.$route.query.type,
          topname: this.$route.params.name,
        });
        this.pods = data.List;
      },
      async getContainerSelectData(pod) {
        if (!pod) {
          await this.podList();
          if (this.pods.length > 0) {
            pod = this.pods[0];
            this.pod = pod;
          }
        }
        if (!pod) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.no_pod'),
            color: 'warning',
          });
          return;
        }
        this.containers = [];
        pod.spec.containers.forEach((i) => {
          this.containers.push({
            text: i.name,
            value: i.name,
          });
        });
        if (this.container === '') this.container = this.containers[0].value;
      },
      onStreamSwitchChange() {
        if (this.logWebsocket) {
          this.logWebsocket.close();
          this.logWebsocket = null;
        }
        this.initWebSocket();
      },
      setContainer(con) {
        if (this.container !== con.value) {
          this.container = con.value;
          if (this.logWebsocket) {
            this.logWebsocket.close();
            this.logWebsocket = null;
          }
          this.initWebSocket();
        }
      },
      async setPod(p) {
        if (this.pod.metadata.name !== p.metadata.name) {
          this.pod = p;
          if (this.logWebsocket) {
            this.logWebsocket.close();
            this.logWebsocket = null;
          }
          await this.getContainerSelectData(p);
          this.initWebSocket();
        }
      },
      initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${this.$route.query.cluster}/custom/core/v1/namespaces/${this.$route.query.namespace}/pods/${this.pod.metadata.name}/actions/logs?stream=true&container=${this.container}&token=${this.JWT}&tail=100&follow=${this.stream}`;
        this.logWebsocket = new WebSocket(wsuri);
        this.logWebsocket.binaryType = 'arraybuffer';
        this.logWebsocket.onopen = () => {
          this.log = '';
        };
        this.logWebsocket.onmessage = this.onWebsocketMessage;
        this.logWebsocket.onerror = this.onWebsocketError;
        this.logWebsocket.onclose = (e) => {
          if (e.code === 1006 && this.stream) {
            this.logWebsocket = null;
            this.initWebSocket();
          }
          // this.dispose()
          // this.dialog = false
        };
        if (this.$refs.log && this.$refs.log.editor) {
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
        this.stream = false;
        this.linenotbreak = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-input--selection-controls {
    margin-top: 0 !important;
  }
</style>
