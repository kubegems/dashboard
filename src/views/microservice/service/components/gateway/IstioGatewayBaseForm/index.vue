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
      <BaseSubTitle title="istio网关定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              label="网关名称"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="ingressgateway"
              class="my-0"
              color="primary"
              hide-selected
              :items="ingressgatewayItems"
              label="selector(网关实例)"
              no-data-text="暂无可选数据"
              :rules="objRules.selectorRule"
              @change="onIngressgatewayChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>

      <ServerForm ref="serverForm" :data="obj.spec.servers" @addData="addServerData" @closeOverlay="closeExpand" />
      <BaseSubTitle title="服务配置" />
      <v-card-text class="pa-2">
        <ServerItem
          :servers="obj.spec.servers"
          @expandCard="expandServerCard"
          @removeServer="removeServer"
          @updateServer="updateServer"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ServerForm from './ServerForm';
  import ServerItem from './ServerItem';
  import { getIstioGatewayInstanceList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'IstioGatewayBaseForm',
    components: {
      ServerForm,
      ServerItem,
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
      ingressgatewayItems: [],
      ingressgateway: null,
      obj: {
        apiVersion: 'networking.istio.io/v1beta1',
        kind: 'Gateway',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          selector: {},
          servers: [],
        },
      },
    }),
    computed: {
      ...mapState(['EnvironmentFilter', 'ApiResources']),
      ...mapGetters(['VirtualSpace']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          selectorRule: [required],
        };
      },
    },
    watch: {
      item() {
        this.$nextTick(() => {
          this.obj.apiVersion = this.ApiResources['gateway'] || 'networking.istio.io/v1beta1';
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
        this.istioGatewayInstanceList();
      });
    },
    methods: {
      loaddata() {
        if (this.obj.spec.selector[`gems.kubegems.io/istioGateway`]) {
          this.ingressgateway = this.obj.spec.selector[`gems.kubegems.io/istioGateway`];
        }
      },
      async istioGatewayInstanceList() {
        const data = await getIstioGatewayInstanceList(this.VirtualSpace().ID, this.EnvironmentFilter.clusterid, {
          noprocessing: true,
        });
        this.ingressgatewayItems = [];
        data.forEach((gateway) => {
          this.ingressgatewayItems.push({
            text: gateway.Name,
            value: gateway.Name,
          });
        });
      },
      onIngressgatewayChange() {
        this.obj.spec.selector = {};
        this.obj.spec.selector[`gems.kubegems.io/istioGateway`] = this.ingressgateway;
        this.obj.spec.selector[`gems.kubegems.io/virtualSpace`] = this.VirtualSpace().VirtualSpaceName;
      },
      addServerData(data) {
        this.obj.spec.servers = data;
        this.$refs.serverForm.closeCard();
      },
      updateServer(index) {
        const server = this.obj.spec.servers[index];
        const data = { index: index, ...server };
        this.$nextTick(() => {
          this.$refs.serverForm.init(data);
          this.expand = true;
        });
      },
      removeServer(index) {
        this.$delete(this.obj.spec.servers, index);
      },
      expandServerCard() {
        this.$nextTick(() => {
          this.$refs.serverForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        if (this.$refs.serverForm) this.$refs.serverForm.closeCard();
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
