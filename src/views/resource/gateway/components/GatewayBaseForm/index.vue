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
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.gateway')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col v-if="AdminViewport && obj.spec.tenant !== 'notenant'" cols="6">
            <v-autocomplete
              v-model="obj.spec.tenant"
              class="my-0"
              color="primary"
              hide-selected
              item-value="text"
              :items="m_select_tenantItems"
              :label="$root.$t('resource.tenant')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.tenantRule"
              @focus="onTenantSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" :disabled="item.disabled" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              :label="$t('tip.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.type"
              class="my-0"
              color="primary"
              hide-selected
              :items="gatewayTypes"
              :label="$t('tip.type')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.gatewayTypeRule"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="protocol"
              class="my-0"
              color="primary"
              hide-selected
              :items="protocolTypes"
              :label="$t('tip.protocol')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.protocolTypeRule"
              @change="onProtocolChange"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.replicas"
              class="my-0"
              :label="$t('tip.replicas')"
              required
              :rules="objRules.replicasRule"
              type="number"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.baseDomain"
              class="my-0"
              :label="$t('tip.default_domain')"
              required
              :rules="objRules.baseDomainRule"
            >
              <template #append>
                <v-btn class="my-0" color="primary" small text @click="setDomain(obj)">
                  {{ $t('operate.use_default_domain') }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field v-model="image" class="my-0" :label="$t('tip.image')" required :rules="objRules.imageRule" />
          </v-col>
        </v-row>
      </v-card-text>

      <DataForm ref="dataForm" :data="obj.spec.configMapData" @addData="addData" @closeOverlay="closeExpand" />
      <BaseSubTitle :title="$t('tip.config_item')">
        <template #tips>
          <v-icon class="mt-n1 kubegems__pointer" color="warning" right small @click="help">
            mdi-information-variant
          </v-icon>
        </template>
      </BaseSubTitle>
      <v-card-text class="pa-2">
        <GatewayDataItem
          :data="obj.spec.configMapData"
          @expandCard="expandCard"
          @removeData="removeData"
          @updateData="updateData"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import GatewayDataItem from './GatewayDataItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';
  import DataForm from '@/views/resource/components/common/DataForm';

  export default {
    name: 'GatewayBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      DataForm,
      GatewayDataItem,
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
      protocolTypes: [
        { text: 'http/1.1', value: 'http/1.1' },
        { text: 'http/2', value: 'http/2' },
      ],
      protocol: 'http/2',
      image: '',
      obj: {
        apiVersion: '',
        kind: 'TenantGateway',
        metadata: {
          name: '',
        },
        spec: {
          tenant: '',
          type: 'NodePort',
          replicas: 1,
          baseDomain: '',
          configMapData: {},
        },
      },
    }),
    computed: {
      ...mapState(['AdminViewport', 'ApiResources']),
      ...mapGetters(['Tenant']),
      objRules() {
        return {
          nameRule: [
            required,
            (v) => !v || !!new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$').test(v) || this.$t('form.name_rule'),
          ],
          tenantRule: [required],
          gatewayTypeRule: [required],
          protocolTypeRule: [required],
          replicasRule: [positiveInteger],
          baseDomainRule: [(v) => !!v || this.$t('form.domain_rule')],
          imageRule: [
            (v) => !v || !!new RegExp('^([\\w|/|\\.|-]+)[:|@]([\\w|\\.|-]+)$').test(v) || this.$t('form.image_rule'),
          ],
        };
      },
      gatewayTypes() {
        return [
          { text: this.$t('tip.nodeport'), value: 'NodePort' },
          { text: this.$t('tip.loadbalancer'), value: 'LoadBalancer' },
        ];
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['tenantgateway'] || 'gems.kubegems.io/v1beta1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {
          if (!this.item) {
            this.$refs.form.resetValidation();
          } else {
            this.obj = deepCopy(this.item);
          }

          if (!this.AdminViewport) {
            this.obj.spec.tenant = this.Tenant().TenantName;
          }
          if (!this.obj.spec.configMapData) {
            this.$set(this.obj.spec, 'configMapData', {});
          }
          this.m_select_tenantSelectData();
        });
      },
      addData(data) {
        this.obj.spec.configMapData = data;
        this.$refs.dataForm.closeCard();
        if (data['use-http2']) {
          if (data['use-http2'] === 'false') {
            this.protocol = 'http/1.1';
          } else if (data['use-http2'] === 'true') {
            this.protocol = 'http/2';
          }
        }
      },
      updateData(key) {
        const data = { key: key, value: this.obj.spec.configMapData[key] };
        this.$refs.dataForm.init(data);
        this.expand = true;
        if (key === 'use-http2') {
          if (this.obj.spec.configMapData[key] === 'false') {
            this.protocol = 'http/1.1';
          } else if (this.obj.spec.configMapData[key] === 'true') {
            this.protocol = 'http/2';
          }
        }
      },
      removeData(key) {
        if (key === 'use-http2') {
          this.protocol = 'http/2';
        }
        this.$delete(this.obj.spec.configMapData, key);
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.dataForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.dataForm.closeCard();
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      setDomain(obj) {
        obj.spec.baseDomain = `*.kubegems.io`;
      },
      help() {
        window.open('https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/');
      },
      onProtocolChange() {
        if (this.protocol === 'http/2') {
          this.$set(this.obj.spec.configMapData, 'use-http2', 'true');
        } else {
          this.$set(this.obj.spec.configMapData, 'use-http2', 'false');
        }
      },
      setData(data) {
        this.obj = data;
        if (this.obj.spec.image) {
          this.image = `${this.obj.spec.image.repository}:${this.obj.spec.image.tag}`;
        }
      },
      onTenantSelectFocus() {
        this.m_select_tenantSelectData();
      },
      getData() {
        if (this.image) {
          const repository = this.splitImage(this.image, 'image');
          const tag = this.splitImage(this.image, 'tag');
          this.obj.spec.image = {
            repository: repository,
            tag: tag,
            pullPolicy: 'IfNotPresent',
          };
        } else {
          delete this.obj.spec.image;
        }
        return this.obj;
      },
      splitImage(image, type) {
        const match = new RegExp('([\\w|/|\\.|-]+)?[:|@]?([\\w|\\.|-]+)?', 'g').exec(image);

        if (match) {
          if (type === 'image') {
            return match[1];
          } else if (type === 'tag') {
            return match[2];
          }
          return '';
        }
        return '';
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
