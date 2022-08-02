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
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>名称</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="http.name" class="my-0" label="name" required />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="http.timeout" class="my-0" label="timeout" required />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <template v-if="Object.prototype.hasOwnProperty.call(http, 'redirect')">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>redirect</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.redirect.uri" class="my-0" label="uri" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.redirect.authority" class="my-0" label="authority" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="http.redirect.redirectCode"
                  class="my-0"
                  label="redirectCode"
                  required
                  type="number"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <template v-if="Object.prototype.hasOwnProperty.call(http, 'delegate')">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>delegate</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.delegate.name" class="my-0" label="name" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.delegate.namespace" class="my-0" label="namespace" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <template v-if="Object.prototype.hasOwnProperty.call(http, 'rewrite')">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>rewrite</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.rewrite.uri" class="my-0" label="uri" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.rewrite.authority" class="my-0" label="authority" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <template v-if="Object.prototype.hasOwnProperty.call(http, 'retries')">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>retries</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.retries.attempts" class="my-0" label="attempts" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.retries.perTryTimeout" class="my-0" label="perTryTimeout" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.retries.retryOn" class="my-0" label="retryOn" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="http.retries.retryRemoteLocalities"
                  class="my-0"
                  label="retryRemoteLocalities"
                  required
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <template v-if="Object.prototype.hasOwnProperty.call(http, 'mirror')">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>mirror</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.mirror.host" class="my-0" label="host" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.mirror.subset" class="my-0" label="subset" required />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="http.mirror.port" class="my-0" label="port" required type="number" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <BaseSubTitle title="匹配策略" />
          <HTTPMatchRequestForm :match="http.match" @updateComponentData="updateMatchComponentData" />

          <BaseSubTitle title="路由策略" />
          <HTTPRouteDestinationForm :route="http.route" @updateComponentData="updateRouteComponentData" />
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
  import { deepCopy } from '@/utils/helpers';
  import HTTPMatchRequestForm from '@/views/microservice/service/components/virtual_service/match/HTTPMatchRequestForm';
  import HTTPRouteDestinationForm from '@/views/microservice/service/components/virtual_service/route/HTTPRouteDestinationForm';

  export default {
    name: 'HttpForm',
    components: {
      HTTPMatchRequestForm,
      HTTPRouteDestinationForm,
    },
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
        httpCopy: [],
        http: {},
      };
    },
    watch: {
      data() {
        this.httpCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.httpCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        if (data) {
          this.http = deepCopy(data);
        } else {
          this.http = {
            index: -1,
            name: '',
            timeout: '',
            redirect: {
              uri: '',
              authority: '',
              redirectCode: 301,
            },
            delegate: {
              name: '',
              namespace: '',
            },
            rewrite: {
              uri: '',
              authority: '',
            },
            retries: {
              attempts: null,
              perTryTimeout: '',
              retryOn: '',
              retryRemoteLocalities: null,
            },
            mirror: {
              host: '',
              subset: '',
              port: null,
            },
            match: [],
            route: [],
          };
        }
        this.expand = true;
      },
      updateMatchComponentData(data) {
        this.http.match = data;
      },
      updateRouteComponentData(data) {
        this.http.route = data;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.http);
          delete data['index'];
          if (this.http.index === -1) {
            this.httpCopy.push(data);
          } else {
            this.$set(this.httpCopy, this.http.index, data);
          }
          this.$emit('addData', this.httpCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.http.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
