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
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="istio虚拟服务定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              label="虚拟服务名称"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.gateways"
              class="my-0"
              color="primary"
              hide-selected
              :items="gateways"
              label="网关"
              multiple
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12">
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
                <v-chip close close-icon="mdi-close-circle" color="primary" small @click:close="removeHost(item)">
                  <span>
                    {{ item.text }}
                  </span>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col v-if="obj.spec.exportTo" cols="12">
            <v-combobox
              v-model="exportTo"
              height="32"
              hide-no-data
              :items="[]"
              label="exportTo(回车)"
              multiple
              :search-input.sync="exportToText"
              small-chips
              @change="onExportToChange"
              @keydown.enter="createExportTo"
            >
              <template #selection="{ item }">
                <v-chip close close-icon="mdi-close-circle" color="primary" small @click:close="removeExportTo(item)">
                  <span>
                    {{ item.text }}
                  </span>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'http')">
        <HttpForm ref="httpForm" :data="obj.spec.http" @addData="addHttpData" @closeOverlay="closeExpand" />
        <BaseSubTitle title="http流量配置" />
        <v-card-text class="pa-2">
          <HttpItem
            :http="obj.spec.http"
            @expandCard="expandHttpCard"
            @removeHttp="removeHttp"
            @updateHttp="updateHttp"
          />
        </v-card-text>
      </template>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'tcp')">
        <TcpForm ref="tcpForm" :data="obj.spec.tcp" @addData="addTcpData" @closeOverlay="closeExpand" />
        <BaseSubTitle title="tcp流量配置" />
        <v-card-text class="pa-2">
          <TcpItem :tcp="obj.spec.tcp" @expandCard="expandTcpCard" @removeTcp="removeTcp" @updateTcp="updateTcp" />
        </v-card-text>
      </template>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'tls')">
        <TLSForm ref="tlsForm" :data="obj.spec.tls" @addData="addTLSData" @closeOverlay="closeExpand" />
        <BaseSubTitle title="tls流量配置" />
        <v-card-text class="pa-2">
          <TLSItem :tls="obj.spec.tls" @expandCard="expandTLSCard" @removeTLS="removeTLS" @updateTLS="updateTLS" />
        </v-card-text>
      </template>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import HttpForm from './HttpForm';
  import HttpItem from './HttpItem';
  import TcpForm from './TcpForm';
  import TcpItem from './TcpItem';
  import TLSForm from './TLSForm';
  import TLSItem from './TLSItem';
  import { getIstioGatewayList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'IstioVirtualServiceBaseForm',
    components: {
      HttpForm,
      HttpItem,
      TcpForm,
      TcpItem,
      TLSForm,
      TLSItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      gateways: [],
      obj: {
        apiVersion: 'networking.istio.io/v1beta1',
        kind: 'VirtualService',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          hosts: [],
          gateways: [],
          exportTo: [],
          http: [],
          tls: [],
          tcp: [],
        },
      },
      exportTo: [],
      exportToText: '',
      hosts: [],
      hostText: '',
    }),
    computed: {
      ...mapState(['EnvironmentFilter', 'ApiResources']),
      objRules() {
        return {
          nameRule: [required, k8sName],
        };
      },
    },
    watch: {
      item() {
        this.$nextTick(() => {
          this.obj.apiVersion = this.ApiResources['virtualservice'] || 'networking.istio.io/v1beta1';
          this.obj = deepCopy(this.item);
          this.obj.metadata.namespace = this.EnvironmentFilter.namespace;
          this.loaddata();
        });
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.obj.metadata.namespace = this.EnvironmentFilter.namespace;
        this.loaddata();
        this.istioGatewayList();
      });
    },
    methods: {
      loaddata() {
        if (this.obj.spec.hosts) {
          this.obj.spec.hosts.forEach((h, index) => {
            this.hosts.push({
              text: h,
              value: index,
            });
          });
        }
        if (this.obj.spec.exportTo) {
          this.obj.spec.exportTo.forEach((e, index) => {
            this.exportTo.push({
              text: e,
              value: index,
            });
          });
        }
      },
      async istioGatewayList() {
        const data = await getIstioGatewayList(this.EnvironmentFilter.cluster, this.EnvironmentFilter.namespace, {
          size: 1000,
          noprocessing: true,
        });
        this.gateways = data.List;
        this.gateways.forEach((v) => {
          v.text = v.metadata.name;
          v.value = v.metadata.name;
        });
      },
      onExportToChange() {
        const exportTo = this.exportTo.filter((to) => {
          return to !== '' && typeof to === 'object';
        });
        this.exportTo = exportTo;
        this.obj.spec.exportTo = exportTo.map((to) => {
          return to.text;
        });
      },
      createExportTo() {
        if (!this.exportToText) return;
        const index = this.exportTo.length;
        this.exportTo.push({
          text: this.exportToText,
          value: index,
        });
        this.obj.spec.exportTo.push(this.exportToText);
        this.exportToText = '';
      },
      removeExportTo(item) {
        const exportTo = this.exportTo.filter((to) => {
          return to.value !== item.value;
        });
        this.exportTo = exportTo;
        const index = this.obj.spec.exportTo.indexOf(item.text);
        this.obj.spec.exportTo.splice(index, 1);
      },

      onHostChange() {
        const hosts = this.hosts.filter((host) => {
          return host !== '' && typeof host === 'object';
        });
        this.hosts = hosts;
        this.obj.spec.hosts = hosts.map((host) => {
          return host.text;
        });
      },
      createHost() {
        if (!this.hostText) return;
        const index = this.hosts.length;
        this.hosts.push({
          text: this.hostText,
          value: index,
        });
        this.obj.spec.hosts.push(this.hostText);
        this.hostText = '';
      },
      removeHost(item) {
        const hosts = this.hosts.filter((host) => {
          return host.value !== item.value;
        });
        this.hosts = hosts;
        const index = this.obj.spec.hosts.indexOf(item.text);
        this.obj.spec.hosts.splice(index, 1);
      },

      addTLSData(data) {
        this.obj.spec.tls = data;
        this.$refs.tlsForm.closeCard();
      },
      updateTLS(index) {
        const tls = this.obj.spec.tls[index];
        const data = { index: index, ...tls };
        this.$nextTick(() => {
          this.$refs.tlsForm.init(data);
          this.expand = true;
        });
      },
      removeTLS(index) {
        this.$delete(this.obj.spec.tls, index);
      },
      expandTLSCard() {
        this.$nextTick(() => {
          this.$refs.tlsForm.init();
          this.$refs.tlsForm.expandCard();
          this.expand = true;
        });
      },

      addTcpData(data) {
        this.obj.spec.tcp = data;
        this.$refs.tcpForm.closeCard();
      },
      updateTcp(index) {
        const tcp = this.obj.spec.tcp[index];
        const data = { index: index, ...tcp };
        this.$nextTick(() => {
          this.$refs.tcpForm.init(data);
          this.expand = true;
        });
      },
      removeTcp(index) {
        this.$delete(this.obj.spec.tcp, index);
      },
      expandTcpCard() {
        this.$nextTick(() => {
          this.$refs.tcpForm.init();
          this.$refs.tcpForm.expandCard();
          this.expand = true;
        });
      },

      addHttpData(data) {
        this.obj.spec.http = data;
        this.$refs.httpForm.closeCard();
      },
      updateHttp(index) {
        const http = this.obj.spec.http[index];
        const data = { index: index, ...http };
        this.$nextTick(() => {
          this.$refs.httpForm.init(data);
          this.expand = true;
        });
      },
      removeHttp(index) {
        this.$delete(this.obj.spec.http, index);
      },
      expandHttpCard() {
        this.$nextTick(() => {
          this.$refs.httpForm.init();
          this.$refs.httpForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        if (this.$refs.httpForm) this.$refs.httpForm.closeCard();
        if (this.$refs.tcpForm) this.$refs.tcpForm.closeCard();
        if (this.$refs.tlsForm) this.$refs.tlsForm.closeCard();
        this.exportTo = [];
        this.hosts = [];
        this.$refs.form.reset();
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
