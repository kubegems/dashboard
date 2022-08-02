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
                <span>匹配策略</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.name" class="my-0" label="name" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.sourceNamespace" class="my-0" label="sourceNamespace" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.gateways"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="[]"
                  label="网关"
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
                <v-text-field v-model="obj.port" class="my-0" label="port" required type="number" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <template v-if="Object.prototype.hasOwnProperty.call(obj, 'ignoreUriCase')">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-switch v-model="obj.ignoreUriCase" class="mt-4" label="ignoreUriCase" />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <template v-if="Object.prototype.hasOwnProperty.call(obj, 'uri')">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>uri</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="uriKey"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="[
                      { text: 'exact', valeu: 'exact' },
                      { text: 'prefix', valeu: 'prefix' },
                      { text: 'regex', valeu: 'regex' },
                    ]"
                    label="StringMatch"
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
                  <v-text-field v-model="uriValue" class="my-0" label="uri" required @keyup="onURIInput" />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <template v-if="Object.prototype.hasOwnProperty.call(obj, 'scheme')">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>scheme</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="schemeKey"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="[
                      { text: 'exact', valeu: 'exact' },
                      { text: 'prefix', valeu: 'prefix' },
                      { text: 'regex', valeu: 'regex' },
                    ]"
                    label="StringMatch"
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
                  <v-text-field v-model="schemeValue" class="my-0" label="scheme" required @keyup="onSchemeInput" />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <template v-if="Object.prototype.hasOwnProperty.call(obj, 'method')">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>method</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="methodKey"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="[
                      { text: 'exact', valeu: 'exact' },
                      { text: 'prefix', valeu: 'prefix' },
                      { text: 'regex', valeu: 'regex' },
                    ]"
                    label="StringMatch"
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
                  <v-text-field v-model="methodValue" class="my-0" label="method" required @keyup="onMethodInput" />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <template v-if="Object.prototype.hasOwnProperty.call(obj, 'authority')">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                  <span>authority</span>
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="authorityKey"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="[
                      { text: 'exact', valeu: 'exact' },
                      { text: 'prefix', valeu: 'prefix' },
                      { text: 'regex', valeu: 'regex' },
                    ]"
                    label="StringMatch"
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
                  <v-text-field
                    v-model="authorityValue"
                    class="my-0"
                    label="authority"
                    required
                    @keyup="onAuthorityInput"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>

            <BaseSubTitle title="匹配(headers)" />
            <StringMatchForm :data="obj.headers" @addData="addHeaderData" />

            <BaseSubTitle title="匹配(queryParams)" />
            <StringMatchForm :data="obj.queryParams" @addData="addQueryParamsData" />

            <BaseSubTitle title="匹配(withoutHeaders)" />
            <StringMatchForm :data="obj.withoutHeaders" @addData="addWithoutHeadersData" />

            <LabelForm ref="labelForm" :data="obj.sourceLabels" @addData="addLabelData" />
            <BaseSubTitle title="标签(sourceLabels)" />
            <v-card-text class="pa-2">
              <LabelItem
                :labels="obj.sourceLabels"
                @expandCard="expandLabelCard"
                @removeLabels="removeLabels"
                @updateLabels="updateLabels"
              />
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet v-for="(match, index) in matchCopy" :key="index" class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ match.name }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> name </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ match.uri }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> uri </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ match.headers }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> headers </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加匹配策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import StringMatchForm from './StringMatchForm';
  import { deepCopy } from '@/utils/helpers';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'HTTPMatchRequestForm',
    components: {
      LabelForm,
      LabelItem,
      StringMatchForm,
    },
    props: {
      match: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          index: -1,
          name: '',
          port: null,
          sourceNamespace: '',
          gateways: [],
          sourceLabels: {},
          uri: {},
          scheme: {},
          method: {},
          authority: {},
          ignoreUriCase: true,
          headers: {},
          queryParams: {},
          withoutHeaders: {},
        },
        matchCopy: [],

        uriKey: '',
        uriValue: '',

        schemeKey: '',
        schemeValue: '',

        methodKey: '',
        methodValue: '',

        authorityKey: '',
        authorityValue: '',
      };
    },
    watch: {
      match() {
        if (this.matchCopy) {
          this.matchCopy = deepCopy(this.match);
        }
      },
    },
    mounted() {
      if (this.matchCopy) {
        this.matchCopy = deepCopy(this.match);
      }
    },
    methods: {
      loaddata() {
        if (this.obj.uri) {
          const key = this.getExpertKey(this.obj.uri);
          if (key) {
            this.uriKey = key;
            this.uriValue = this.obj.uri[key];
          }
        }
        if (this.obj.scheme) {
          const key = this.getExpertKey(this.obj.scheme);
          if (key) {
            this.schemeKey = key;
            this.schemeValue = this.obj.scheme[key];
          }
        }
        if (this.obj.method) {
          const key = this.getExpertKey(this.obj.method);
          if (key) {
            this.methodKey = key;
            this.methodValue = this.obj.method[key];
          }
        }
        if (this.obj.authority) {
          const key = this.getExpertKey(this.obj.authority);
          if (key) {
            this.authorityKey = key;
            this.authorityValue = this.obj.authority[key];
          }
        }
      },
      getExpertKey(data) {
        if (data.exact) return 'exact';
        if (data.prefix) return 'prefix';
        if (data.regex) return 'regex';
        return null;
      },
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
        this.destinationSubnets = [];
        this.destinationSubnetsText = '';
      },
      onURIInput() {
        if (this.uriKey) {
          this.obj.uri = {};
          this.obj.uri[this.uriKey] = this.uriValue;
        }
      },

      onSchemeInput() {
        if (this.schemeKey) {
          this.obj.scheme = {};
          this.obj.scheme[this.schemeKey] = this.schemeValue;
        }
      },

      onMethodInput() {
        if (this.methodKey) {
          this.obj.method = {};
          this.obj.method[this.methodKey] = this.methodValue;
        }
      },

      onAuthorityInput() {
        if (this.authorityKey) {
          this.obj.authority = {};
          this.obj.authority[this.authorityKey] = this.authorityValue;
        }
      },

      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.obj);
          delete data['index'];
          if (this.obj.index === -1) {
            this.matchCopy.push(data);
          } else {
            this.$set(this.matchCopy, this.obj.index, data);
          }
          this.$emit('updateComponentData', this.matchCopy);
          this.closeCard();
        }
      },
      removeData(index) {
        this.$delete(this.matchCopy, index);
        this.$emit('updateComponentData', this.matchCopy);
      },
      updateData(index) {
        this.obj = deepCopy(this.matchCopy[index]);
        this.obj = { ...this.obj, index: index };
        this.loaddata();
        this.expandCard();
      },
      expandLabelCard() {
        this.$nextTick(() => {
          this.$refs.labelForm.expandCard();
          this.expand = true;
        });
      },
      addLabelData(data) {
        this.obj.sourceLabels = data;
      },
      removeLabels(key) {
        this.$delete(this.obj.sourceLabels, key);
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.sourceLabels[key] };
        this.$nextTick(() => {
          this.$refs.labelForm.init(data);
          this.expand = true;
        });
      },
      addHeaderData(data) {
        this.obj.headers = data;
      },
      addQueryParamsData(data) {
        this.obj.queryParams = data;
      },
      addWithoutHeadersData(data) {
        this.obj.withoutHeaders = data;
      },
    },
  };
</script>
