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
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>TCP</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.maxConnections"
                  class="my-0"
                  label="maxConnections"
                  required
                  :rules="objRules.maxConnectionsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.connectTimeout"
                  class="my-0"
                  label="connectTimeout"
                  required
                  :rules="objRules.connectTimeoutRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.probes"
                  class="my-0"
                  label="tcpKeepalive.probes"
                  required
                  :rules="objRules.probesRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.time"
                  class="my-0"
                  label="tcpKeepalive.time"
                  required
                  :rules="objRules.timeRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.interval"
                  class="my-0"
                  label="tcpKeepalive.interval"
                  required
                  :rules="objRules.intervalRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>HTTP</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.http1MaxPendingRequests"
                  class="my-0"
                  label="http1MaxPendingRequests"
                  required
                  :rules="objRules.http1MaxPendingRequestsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.http2MaxRequests"
                  class="my-0"
                  label="http2MaxRequests"
                  required
                  :rules="objRules.http2MaxRequestsRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.maxRequestsPerConnection"
                  class="my-0"
                  label="maxRequestsPerConnection"
                  required
                  :rules="objRules.maxRequestsPerConnectionRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.maxRetries"
                  class="my-0"
                  label="maxRetries"
                  required
                  :rules="objRules.maxRetriesRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.idleTimeout"
                  class="my-0"
                  label="idleTimeout"
                  required
                  :rules="objRules.idleTimeoutRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.http.h2UpgradePolicy"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="h2UpgradePolicyItems"
                  label="h2UpgradePolicy"
                  no-data-text="暂无可选数据"
                  :rules="objRules.h2UpgradePolicyRule"
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
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-switch v-model="obj.http.useClientProtocol" class="mt-5" hide-details label="useClientProtocol" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet
      v-if="trafficPolicyCopy.connectionPool && JSON.stringify(trafficPolicyCopy.connectionPool) !== '{}'"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.tcp.maxConnections }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> tcp maxConnections </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.tcp.connectTimeout }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> tcp connectTimeout </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.http.maxRequestsPerConnection }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> http maxRequestsPerConnection </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.http.maxRetries }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> http maxRetries </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.http.idleTimeout }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> http idleTimeout </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加连接池
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'ConnectionPool',
    props: {
      trafficPolicy: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        h2UpgradePolicyItems: [
          { text: 'DEFAULT', value: 'DEFAULT' },
          { text: 'DO_NOT_UPGRADE', value: 'DO_NOT_UPGRADE' },
          { text: 'UPGRADE', value: 'UPGRADE' },
        ],
        obj: {
          tcp: {
            maxConnections: null,
            connectTimeout: '10s',
            tcpKeepalive: {
              probes: 9,
              time: '7200s',
              interval: '75s',
            },
          },
          http: {
            http1MaxPendingRequests: null,
            http2MaxRequests: null,
            maxRequestsPerConnection: null,
            maxRetries: null,
            idleTimeout: '3600s',
            h2UpgradePolicy: 'DEFAULT',
            useClientProtocol: false,
          },
        },
        objRules: {
          maxConnectionsRule: [positiveInteger],
          connectTimeoutRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          probesRule: [positiveInteger],
          timeoutRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          intervalRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          http1MaxPendingRequestsRule: [positiveInteger],
          http2MaxRequestsRule: [positiveInteger],
          maxRequestsPerConnectionRule: [positiveInteger],
          maxRetriesRule: [positiveInteger],
          idleTimeoutRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          h2UpgradePolicyRule: [required],
        },
        trafficPolicyCopy: {},
      };
    },
    watch: {
      trafficPolicy() {
        if (this.trafficPolicy) {
          this.trafficPolicyCopy = deepCopy(this.trafficPolicy);
        }
      },
    },
    mounted() {
      if (this.trafficPolicy) {
        this.trafficPolicyCopy = deepCopy(this.trafficPolicy);
      }
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.trafficPolicyCopy.connectionPool) {
            this.trafficPolicyCopy.connectionPool = {};
          }
          this.trafficPolicyCopy.connectionPool = this.obj;
          this.$emit('updateComponentData', this.trafficPolicyCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$delete(this.trafficPolicyCopy, 'connectionPool');
        this.$emit('updateComponentData', this.trafficPolicyCopy);
      },
      updateData() {
        this.obj = deepCopy(this.trafficPolicyCopy.connectionPool);
        this.expandCard();
      },
    },
  };
</script>
