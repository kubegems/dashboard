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
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.issuer')])" />
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
              @keyup="onIssuerNameInput"
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
              v-model="issuer"
              class="my-0"
              color="primary"
              hide-selected
              :items="issuerItems"
              :label="$t('form.issuer_type')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.issuerRule"
              @change="onIssuerChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="issuer === 'acme'">
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.acme.server"
              class="my-0"
              color="primary"
              hide-selected
              :items="serverItems"
              label="Server"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.serverRule"
              :search-input.sync="serverText"
              @keyup.enter="createServer"
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
              v-model="obj.spec.acme.solvers[0].http01.ingress.name"
              class="my-0"
              color="primary"
              hide-selected
              :items="ingressItems"
              :label="$t('form.ingress')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.ingressRule"
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
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getIngressList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'IssuerBaseForm',
    i18n: {
      messages: messages,
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
        kind: 'Issuer',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          selfSigned: {},
        },
      },
      issuer: 'selfSigned',
      issuerItems: [
        { text: 'SelfSigned', value: 'selfSigned' },
        { text: 'Let’s Encrypt', value: 'acme' },
      ],
      serverText: '',
      serverItems: [
        {
          text: 'https://acme-staging-v02.api.letsencrypt.org/directory',
          value: 'https://acme-staging-v02.api.letsencrypt.org/directory',
        },
        {
          text: 'https://acme-v02.api.letsencrypt.org/directory',
          value: 'https://acme-v02.api.letsencrypt.org/directory',
        },
        {
          text: 'https://acme-staging.api.letsencrypt.org/directory',
          value: 'https://acme-staging.api.letsencrypt.org/directory',
        },
      ],
      ingressItems: [],
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          issuerRule: [required],
          serverRule: [required],
          ingressRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['issuer'] || 'cert-manager.io/v1';
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
          if (this.obj.spec.acme) {
            this.issuer = 'acme';
            if (
              !this.serverItems.find((s) => {
                return s.value === this.obj.spec.acme.server;
              })
            ) {
              this.serverItems.push({
                text: this.obj.spec.acme.server,
                value: this.obj.spec.acme.server,
              });
            }
          }

          if (this.AdminViewport) {
            this.m_select_namespaceSelectData(this.ThisCluster);
          } else {
            this.obj.metadata.namespace = this.ThisNamespace;
          }

          if (this.obj.metadata.namespace) this.ingressList();
        });
      },
      reset() {
        this.issuer = 'selfSigned';
        this.$refs.form.resetValidation();
        this.obj = deepCopy(this.$options.data().obj);
      },
      async ingressList() {
        const data = await getIngressList(this.ThisCluster, this.obj.metadata.namespace, {
          size: 1000,
        });
        this.ingressItems = [];
        data.List.forEach((ing) => {
          this.ingressItems.push({
            text: ing.metadata.name,
            value: ing.metadata.name,
          });
        });
      },
      createServer() {
        if (
          !this.serverItems.find((v) => {
            return v.value === this.serverText;
          })
        ) {
          this.serverItems.push({
            text: this.serverText,
            value: this.serverText,
          });
        }
        this.obj.spec.acme.server = this.serverText;
        this.serverText = '';
      },
      onNamespaceChange() {
        this.ingressList();
      },
      onIssuerNameInput() {
        if (this.obj.spec.acme) {
          this.obj.spec.acme.privateKeySecretRef.name = this.obj.metadata.name;
        }
      },
      onIssuerChange() {
        if (this.issuer === 'selfSigned') {
          this.obj.spec.selfSigned = {};
          this.$delete(this.obj.spec, 'acme');
        } else if (this.issuer === 'acme') {
          this.obj.spec.acme = {
            server: '',
            privateKeySecretRef: {
              name: this.obj.metadata.name,
            },
            solvers: [
              {
                http01: {
                  ingress: { name: '' },
                },
              },
            ],
          };
          this.$delete(this.obj.spec, 'selfSigned');
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
