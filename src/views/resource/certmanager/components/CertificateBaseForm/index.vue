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
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.certificate')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              :label="$t('form.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
              @keyup="onCertificateNameInput"
            />
          </v-col>
          <v-col v-if="AdminViewport" cols="6">
            <v-autocomplete
              v-model="obj.metadata.namespace"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_namespaceItems"
              :label="$root.$t('resource.namespace')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.namespaceRule"
              @change="onNamespaceChange"
              @focus="m_select_namespaceSelectData(ThisCluster)"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.issuerRef.name"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_issuerItems"
              :label="$t('table.issuer')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.issuerRule"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.duration"
              class="my-0"
              color="primary"
              hide-selected
              :items="durationItems"
              :label="$t('form.expire_at')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.durationRule"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-switch v-model="renew" class="mt-4" :label="$t('form.auto_renew')" @change="onRenewChange" />
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="obj.spec.usages"
              class="my-0"
              hide-selected
              :items="keyUsage"
              :label="$t('form.cert_use')"
              multiple
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
      <BaseSubTitle :title="$t('form.domain')" />
      <DnsNameForm ref="dnsNameForm" @addData="addData" @closeOverlay="closeExpand" @updateData="updateData" />
      <DnsNameItem
        :items="obj.spec.dnsNames"
        @expandCard="expandCard"
        @removeConfig="removeConfig"
        @updateConfig="updateConfig"
      />
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import DnsNameForm from './DnsNameForm';
  import DnsNameItem from './DnsNameItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'CertificateBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      DnsNameForm,
      DnsNameItem,
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
      obj: {
        apiVersion: 'cert-manager.io/v1',
        kind: 'Certificate',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          duration: '8760h0m0s',
          renewBefore: '360h0m0s',
          secretName: '',
          dnsNames: [],
          usages: [],
          issuerRef: {
            kind: 'Issuer',
            name: '',
          },
        },
      },
      renew: true,
      durationItems: [
        { text: '3个月', value: '2160h0m0s' },
        { text: '6个月', value: '4320h0m0s' },
        { text: '1年', value: '8760h0m0s' },
        { text: '2年', value: '17520h0m0s' },
        { text: '5年', value: '43800h0m0s' },
        { text: '10年', value: '87600h0m0s' },
      ],
      keyUsage: [
        { text: 'signing', value: 'signing' },
        { text: 'digital signature', value: 'digital signature' },
        { text: 'server auth', value: 'server auth' },
        { text: 'client auth', value: 'client auth' },
        { text: 'content commitment', value: 'content commitment' },
        { text: 'key encipherment', value: 'key encipherment' },
        { text: 'key agreement', value: 'key agreement' },
        { text: 'data encipherment', value: 'data encipherment' },
        { text: 'cert sign', value: 'cert sign' },
        { text: 'crl sign', value: 'crl sign' },
        { text: 'encipher only', value: 'encipher only' },
        { text: 'decipher only', value: 'decipher only' },
        { text: 'any', value: 'any' },
        { text: 'code signing', value: 'code signing' },
        { text: 'email protection', value: 'email protection' },
        { text: 's/mime', value: 's/mime' },
        { text: 'ipsec end system', value: 'ipsec end system' },
        { text: 'ipsec tunnel', value: 'ipsec tunnel' },
        { text: 'ipsec user', value: 'ipsec user' },
        { text: 'timestamping', value: 'timestamping' },
        { text: 'ocsp signing', value: 'ocsp signing' },
        { text: 'microsoft sgc', value: 'microsoft sgc' },
        { text: 'netscape sgc', value: 'netscape sgc' },
      ],
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          issuerRule: [required],
          durationRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['certificate'] || 'cert-manager.io/v1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      loadData() {
        this.$nextTick(() => {
          if (this.item) {
            this.obj = deepCopy(this.item);
          }

          if (this.AdminViewport) {
            this.m_select_namespaceSelectData(this.ThisCluster);
          } else {
            this.obj.metadata.namespace = this.ThisNamespace;
          }

          if (this.obj.metadata.namespace) {
            this.m_select_issuerSelectData(this.ThisCluster, this.obj.metadata.namespace);
          }
        });
      },
      onRenewChange() {
        if (this.renew) {
          this.obj.spec.renewBefore = '360h0m0s';
        } else {
          this.obj.spec.renewBefore = '';
        }
      },
      onNamespaceChange() {
        this.m_select_issuerSelectData(this.ThisCluster, this.obj.metadata.namespace);
      },
      expandCard(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.expand = true;
        });
      },
      onCertificateNameInput() {
        this.obj.spec.secretName = this.obj.metadata.name;
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = deepCopy(this.$options.data().obj);
      },
      addData(type, config) {
        switch (type) {
          case 'DnsName':
            this.obj.spec.dnsNames.push(config);
            break;
        }
      },
      updateData(type, config, index) {
        switch (type) {
          case 'DnsName':
            this.$set(this.obj.spec.dnsNames, index, config);
            break;
        }
      },
      removeConfig(type, index) {
        switch (type) {
          case 'DnsName':
            this.$delete(this.obj.spec.dnsNames, index);
            break;
        }
      },
      updateConfig(type, index) {
        switch (type) {
          case 'DnsName':
            this.$refs.dnsNameForm.expandCard();
            this.$refs.dnsNameForm.init(this.obj.spec.dnsNames, index);
            this.expand = true;
            break;
        }
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
