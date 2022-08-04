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
                <span>负载均衡</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.simple"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="simpleItems"
                  label="simple"
                  no-data-text="暂无可选数据"
                  :rules="objRules.simpleRule"
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
                  v-model="consistentHashType"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="consistentHashItems"
                  label="consistentHash"
                  no-data-text="暂无可选数据"
                  @change="onConsistentHashChange"
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

            <v-sheet v-if="consistentHashType === 'httpHeaderName'" class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consistentHash.httpHeaderName"
                  class="my-0"
                  label="httpHeaderName"
                  required
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet v-else-if="consistentHashType === 'httpQueryParameterName'" class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consistentHash.httpQueryParameterName"
                  class="my-0"
                  label="httpQueryParameterName"
                  required
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet v-else-if="consistentHashType === 'minimumRingSize'" class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consistentHash.minimumRingSize"
                  class="my-0"
                  label="minimumRingSize"
                  required
                  type="number"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet v-else-if="consistentHashType === 'useSourceIp'" class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-switch
                  v-model="obj.consistentHash.useSourceIp"
                  class="mt-5"
                  hide-details
                  label="使用源IP"
                  @change="onLocalityLbSettingEnableChange"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <template v-else-if="consistentHashType === 'httpCookie'">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                  <span />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.consistentHash.httpCookie.name"
                    class="my-0"
                    label="httpCookie.name"
                    required
                    :rules="objRules.httpCookieNameRule"
                  />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.consistentHash.httpCookie.path"
                    class="my-0"
                    label="httpCookie.path"
                    required
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
                    v-model="obj.consistentHash.httpCookie.ttl"
                    class="my-0"
                    label="httpCookie.ttl"
                    required
                    :rules="objRules.httpCookieTtlRule"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>localityLbSetting</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-switch
                  v-model="obj.localityLbSetting.enabled"
                  class="mt-5"
                  hide-details
                  label="打开localityLbSetting"
                  @change="onLocalityLbSettingEnableChange"
                />
              </v-flex>
              <v-flex v-if="obj.localityLbSetting.enabled" class="float-left ml-2 kubegems__form-width">
                <v-btn class="mr-2 mt-4" color="primary" small text @click="addDistribute">
                  <v-icon left small> mdi-plus </v-icon>
                  distribute
                </v-btn>
                <v-btn class="mr-2 mt-4" color="primary" small text @click="addFailover">
                  <v-icon left small> mdi-plus </v-icon>
                  failover
                </v-btn>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <template v-for="(item, index) in obj.localityLbSetting.distribute ? obj.localityLbSetting.distribute : []">
              <v-sheet :key="`df${index}`" class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>distribute{{ index + 1 }}</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.localityLbSetting.distribute[index].from"
                    class="my-0"
                    label="from"
                    required
                    :rules="objRules.distributeRule[index].from"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
              <v-sheet :key="`dt${index}`" class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__long-width">
                  <v-combobox
                    v-model="distributeto[index]"
                    height="32"
                    hide-no-data
                    :items="[]"
                    label="to(回车key[string]:value[int])"
                    multiple
                    :rules="objRules.distributeRule[index].from"
                    :search-input.sync="distributetotext[index]"
                    small-chips
                    @change="onToChange(index)"
                    @keydown.enter="createTo(index)"
                  >
                    <template #selection="{ item }">
                      <v-chip
                        class="pa-1"
                        close
                        close-icon="mdi-close-circle"
                        color="primary"
                        small
                        @click:close="removeTo(item, index)"
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
            </template>

            <template v-for="(item, index) in obj.localityLbSetting.failover ? obj.localityLbSetting.failover : []">
              <v-sheet :key="`f${index}`" class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>failover{{ index + 1 }}</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.localityLbSetting.failover[index].from"
                    class="my-0"
                    label="from"
                    required
                    :rules="objRules.failoverRule[index].from"
                  />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.localityLbSetting.failover[index].to"
                    class="my-0"
                    label="to"
                    required
                    :rules="objRules.failoverRule[index].to"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>
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
      v-if="trafficPolicyCopy.loadBalancer && JSON.stringify(trafficPolicyCopy.loadBalancer) !== '{}'"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.loadBalancer.simple }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> simple </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ consistentHashType }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> consistentHash </v-list-item-subtitle>
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
              添加负载均衡
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'LoadBalancer',
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
        simpleItems: [
          { text: 'ROUND_ROBIN', value: 'ROUND_ROBIN' },
          { text: 'LEAST_CONN', value: 'LEAST_CONN' },
          { text: 'RANDOM', value: 'RANDOM' },
          { text: 'PASSTHROUGH', value: 'PASSTHROUGH' },
        ],
        consistentHashItems: [
          { text: 'httpHeaderName', value: 'httpHeaderName' },
          { text: 'httpCookie', value: 'httpCookie' },
          { text: 'useSourceIp', value: 'useSourceIp' },
          { text: 'minimumRingSize', value: 'minimumRingSize' },
          { text: 'httpQueryParameterName', value: 'httpQueryParameterName' },
        ],
        consistentHashType: '',
        obj: {
          simple: 'ROUND_ROBIN',
          consistentHash: {},
          localityLbSetting: {
            enabled: false,
          },
        },
        trafficPolicyCopy: {},
        distributeto: [],
        distributetotext: [],
      };
    },
    computed: {
      objRules() {
        const rule = {
          simpleRule: [required],
          httpCookieNameRule: [required],
          httpCookieTtlRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
        };
        const failoverRule = [];
        if (this.obj.localityLbSetting.failover) {
          this.obj.localityLbSetting.failover.forEach(() => {
            failoverRule.push({
              from: [required],
              to: [required],
            });
          });
        }
        const distributeRule = [];
        if (this.obj.localityLbSetting.distribute) {
          this.obj.localityLbSetting.distribute.forEach(() => {
            distributeRule.push({
              from: [required],
              to: [required],
            });
          });
        }
        return {
          ...rule,
          failoverRule: failoverRule,
          distributeRule: distributeRule,
        };
      },
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
      onToChange(index) {
        const to = this.distributeto[index].filter((t) => {
          return t !== '' && typeof t === 'object';
        });
        this.distributeto[index] = to;
      },
      createTo(index) {
        if (!this.distributetotext[index]) return;
        const i = this.distributeto[index].length;
        this.distributeto[index].push({
          text: this.distributetotext[index],
          value: i,
        });
        this.distributetotext[index] = '';
      },
      removeTo(item, index) {
        const to = this.distributeto[index].filter((t) => {
          return t.value !== item.value;
        });
        this.distributeto[index] = to;
      },
      addFailover() {
        if (!this.obj.localityLbSetting.failover) {
          this.obj.localityLbSetting.failover = [];
        }
        this.obj.localityLbSetting.failover.push({
          from: '',
          to: '',
        });
      },
      addDistribute() {
        if (!this.obj.localityLbSetting.distribute) {
          this.obj.localityLbSetting.distribute = [];
        }
        this.obj.localityLbSetting.distribute.push({
          from: '',
          to: {},
        });
        this.distributeto.push([]);
        this.distributetotext.push('');
      },
      onConsistentHashChange() {
        this.obj.consistentHash = {};
        if (['httpHeaderName', 'httpQueryParameterName'].indexOf(this.consistentHashType) > -1) {
          this.obj.consistentHash[this.consistentHashType] = '';
        } else if (['minimumRingSize'].indexOf(this.consistentHashType) > -1) {
          this.obj.consistentHash[this.consistentHashType] = 0;
        } else if (['useSourceIp'].indexOf(this.consistentHashType) > -1) {
          this.obj.consistentHash[this.consistentHashType] = 'false';
        } else if (['httpCookie'].indexOf(this.consistentHashType) > -1) {
          this.obj.consistentHash[this.consistentHashType] = {
            name: '',
            path: '',
            ttl: '',
          };
        }
      },
      onLocalityLbSettingEnableChange() {
        if (this.obj.localityLbSetting.enabled) {
          this.obj.localityLbSetting = {
            distribute: [],
            failover: [],
            enabled: true,
          };
        } else {
          this.obj.localityLbSetting = {
            enabled: false,
          };
          this.distributeto = [];
          this.distributetotext = [];
        }
      },
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
          if (!this.trafficPolicyCopy.loadBalancer) {
            this.trafficPolicyCopy.loadBalancer = {};
          }
          this.trafficPolicyCopy.loadBalancer = this.obj;
          this.distributeto.forEach((to, index) => {
            const td = {};
            to.forEach((t) => {
              if (t.text.indexOf(':') > -1) {
                const tv = t.text.split(':');
                td[tv[0]] = tv[1];
              }
            });
            this.$set(this.obj.localityLbSetting.distribute[index], 'to', td);
          });
          this.$emit('updateComponentData', this.trafficPolicyCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$delete(this.trafficPolicyCopy, 'loadBalancer');
        this.$emit('updateComponentData', this.trafficPolicyCopy);
      },
      updateData() {
        this.obj = deepCopy(this.trafficPolicyCopy.loadBalancer);
        if (this.obj.localityLbSetting.distribute) {
          this.obj.localityLbSetting.distribute.forEach((item) => {
            this.distributetotext.push('');
            const distributetoitem = [];
            Object.keys(item.to).forEach((key, index) => {
              distributetoitem.push({
                text: `${key}:${item.to[key]}`,
                index: index,
              });
            });
            this.distributeto.push(distributetoitem);
          });
        }
        this.expandCard();
      },
    },
  };
</script>
