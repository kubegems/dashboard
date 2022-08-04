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
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-5">
              <span>端口定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="server.port.number"
                class="my-0"
                label="端口"
                required
                :rules="serverRules.numberRule"
                type="number"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="server.port.protocol"
                class="my-0"
                label="协议"
                required
                :rules="serverRules.protocolRule"
                @keyup="onProtocolInput"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-4">
              <span />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="server.bind" class="my-0" label="bind" required />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 primary--text kubegems__min-width pt-6">
              <span>hosts定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__long-width">
              <v-combobox
                v-model="hosts"
                height="32"
                hide-no-data
                :items="[]"
                label="hosts(回车)"
                multiple
                :search-input.sync="hostText"
                small-chips
                @change="onHostChange"
                @keydown.enter="createHost"
              >
                <template #selection="{ item }">
                  <v-chip
                    class="pa-1"
                    close
                    close-icon="mdi-close-circle"
                    color="primary"
                    small
                    @click:close="removeHost(item)"
                  >
                    <span>
                      {{ item.text }}
                    </span>
                  </v-chip>
                </template>
              </v-combobox>
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 primary--text kubegems__min-width pt-5">
              <span>tls定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-switch v-model="tls" class="mt-5" hide-details label="开启tls" @change="onTLSChange" />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet v-if="tls" class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 primary--text kubegems__min-width pt-5">
              <span />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="server.tls.mode"
                class="my-0"
                color="primary"
                hide-selected
                :items="tlsModeItems"
                label="mode"
                no-data-text="暂无可选数据"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>

            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="server.tls.credentialName"
                class="my-0"
                color="primary"
                hide-selected
                :items="secretItems"
                label="credentialName"
                no-data-text="暂无可选数据"
                :rules="serverRules.credentialNameRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>

            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import { getSecretList } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { SERVICE_GATEWAY_NS } from '@/utils/namespace';
  import { required } from '@/utils/rules';

  export default {
    name: 'ServerForm',
    props: {
      data: {
        type: Array,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        tls: false,
        tlsModeItems: [{ text: 'SIMPLE', value: 'SIMPLE' }],
        secretItems: [],
        serversCopy: {},
        hosts: [],
        server: {
          index: -1,
          port: {
            number: 0,
            name: '',
            protocol: '',
          },
          hosts: [],
          bind: '',
        },
        serverRules: {
          numberRule: [required],
          protocolRule: [
            required,
            (v) => !!new RegExp('^HTTP$|^HTTPS$|^TCP$|^MONGO$|^GRPC$|^TLS$|^HTTP2$', 'g').test(v) || '不支持该协议',
          ],
          nameRule: [required],
          credentialNameRule: [required],
        },
        hostText: '',
      };
    },
    computed: {
      ...mapState(['EnvironmentFilter']),
    },
    watch: {
      data() {
        this.serversCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.serversCopy = deepCopy(this.data);
        this.secretList();
      }
    },
    methods: {
      init(data) {
        this.server = deepCopy(data);
        this.hosts = this.server.hosts.map((h, index) => {
          return { text: h, value: index };
        });
        if (this.server.tls) {
          this.tls = true;
        } else {
          this.tls = false;
        }
        this.secretList();
        this.expand = true;
      },
      async secretList() {
        const data = await getSecretList(this.EnvironmentFilter.cluster, SERVICE_GATEWAY_NS, {
          size: 1000,
        });
        this.secretItems = data.List.filter((s) => {
          return s.secret.type === 'kubernetes.io/tls';
        });
        this.secretItems.forEach((v) => {
          v.text = v.secret.metadata.name;
          v.value = v.secret.metadata.name;
        });
      },
      onHostChange() {
        const hosts = this.hosts.filter((host) => {
          return host !== '' && typeof host === 'object';
        });
        this.hosts = hosts;
      },
      createHost() {
        if (!this.hostText) return;
        const index = this.hosts.length;
        this.hosts.push({
          text: this.hostText,
          value: index,
        });
        this.hostText = '';
      },
      removeHost(item) {
        const hosts = this.hosts.filter((host) => {
          return host.value !== item.value;
        });
        this.hosts = hosts;
      },
      onProtocolInput() {
        this.server.port.name = `${this.server.port.protocol}-${this.server.port.number}`;
      },
      onTLSChange() {
        if (this.tls) {
          this.server.tls = {
            mode: 'SIMPLE',
            credentialName: '',
          };
        } else {
          this.$delete(this.server, 'tls');
        }
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.server);
          data.hosts = this.hosts.map((d) => {
            return d.text;
          });
          delete data['index'];
          if (this.server.index === -1) {
            this.serversCopy.push(data);
          } else {
            this.$set(this.serversCopy, this.server.index, data);
          }
          this.$emit('addData', this.serversCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.server.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
