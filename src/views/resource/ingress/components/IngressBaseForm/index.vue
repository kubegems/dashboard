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
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.ingress')])" />
      <v-card-text class="pa-2">
        <v-row v-if="manifest">
          <v-col cols="6">
            <v-autocomplete
              v-model="resourceKind"
              class="my-0"
              color="primary"
              hide-selected
              :items="kinds"
              :label="$root.$t('resource.kind')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit"
              :rules="objRules.kindRule"
              @change="onKindChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col v-if="AdminViewport && !manifest" cols="6">
            <v-autocomplete
              v-model="obj.metadata.namespace"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_namespaceItems"
              :label="$root.$t('resource.namespace')"
              :no-data-text="$root.$t('resource.resource')"
              :readonly="edit"
              :rules="objRules.namespaceRule"
              @focus="onNamespaceSelectFocus(ThisCluster)"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            v-if="
              (!manifest || ThisAppEnvironmentID) && Object.prototype.hasOwnProperty.call(obj.spec, 'ingressClassName')
            "
            cols="6"
          >
            <v-autocomplete
              v-model="obj.spec.ingressClassName"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_gatewayItems"
              :label="$t('tip.gateway')"
              :no-data-text="$root.$t('resource.resource')"
              :rules="objRules.ingressClassNameRule"
              @focus="onGatewaySelectFocus(ThisCluster)"
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
              v-model="protocol"
              class="my-0"
              color="primary"
              hide-selected
              :items="protocolItems"
              :label="$t('tip.protocol')"
              :no-data-text="$root.$t('resource.resource')"
              :rules="objRules.protocolRule"
              @change="onProtocolChange"
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

      <IngressRuleForm
        ref="ingressRuleForm"
        :annotations="obj.metadata.annotations"
        :domain="baseDomain"
        :obj="obj"
        @addData="addRulerData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle :title="$t('tip.ingress_rule')" />
      <v-card-text class="pa-2">
        <IngressRuleItem
          :rules="obj.spec.rules"
          @expandCard="expandCard"
          @removePort="removePort"
          @updatePort="updatePort"
        />
      </v-card-text>

      <AnnotationForm
        ref="annotationForm"
        :data="obj.metadata.annotations"
        @addData="addAnnotationData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle :title="$t('tip.annotation')">
        <template #tips>
          <v-icon class="mt-n1 kubegems__pointer" color="warning" right small @click="help">
            mdi-information-variant
          </v-icon>
        </template>
      </BaseSubTitle>
      <v-card-text class="pa-2">
        <AnnotationItem
          :annotations="obj.metadata.annotations"
          @expandCard="expandCard"
          @removeAnnotations="removeAnnotations"
          @updateAnnotations="updateAnnotations"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import IngressRuleForm from './IngressRuleForm';
  import IngressRuleItem from './IngressRuleItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';
  import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm';
  import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem';

  export default {
    name: 'IngressBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      AnnotationForm,
      AnnotationItem,
      IngressRuleForm,
      IngressRuleItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      app: {
        type: Object,
        default: () => {},
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => 'Ingress',
      },
      kinds: {
        type: Array,
        default: () => [],
      },
      manifest: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      resourceKind: '',
      protocol: 'HTTP',
      protocolItems: [
        { text: 'http', value: 'HTTP' },
        { text: 'https', value: 'HTTPS' },
        { text: 'grpc', value: 'GRPC' },
        { text: 'grpcs', value: 'GRPCS' },
      ],
      obj: {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
          name: '',
          namespace: '',
          annotations: {
            'nginx.ingress.kubernetes.io/backend-protocol': 'HTTP',
          },
        },
        spec: {
          ingressClassName: '',
          tls: [],
          rules: [],
        },
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Tenant', 'Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          // ingressClassNameRule: [required],
          kindRule: [required],
          protocolRule: [required],
        };
      },
      baseDomain() {
        const gateway = this.m_select_gatewayItems.find((g) => {
          return g.value === this.obj.spec.ingressClassName;
        });
        if (gateway) {
          return gateway.baseDomain;
        }
        return '';
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['ingress'] || 'networking.k8s.io/v1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      loadData() {
        this.$nextTick(() => {
          if (!this.item) {
            this.$refs.form.resetValidation();
          } else {
            this.obj = deepCopy(this.item);
          }

          if (!this.manifest) {
            if (this.AdminViewport) {
              this.m_select_namespaceSelectData(this.ThisCluster);
            } else {
              this.obj.metadata.namespace = this.ThisNamespace;
            }
            this.m_select_gatewaySelectData(this.ThisCluster);
          } else {
            this.obj.metadata.name = `${this.app.ApplicationName}`;
          }

          if (!this.obj.metadata.annotations) {
            this.obj.metadata.annotations = {};
          } else {
            this.protocol = this.obj.metadata.annotations['nginx.ingress.kubernetes.io/backend-protocol'] || 'HTTP';
          }
          this.resourceKind = this.kind;
          this.obj.kind = this.kind;
        });
      },
      getTLS(rule, tls) {
        let secret = '';
        if (tls) {
          tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              secret = t.secretName;
              return;
            }
          });
        }
        return {
          protocol: this.obj.metadata.annotations['nginx.ingress.kubernetes.io/backend-protocol'],
          secretName: secret,
        };
      },
      addAnnotationData(data) {
        this.obj.metadata.annotations = data;
        this.$refs.annotationForm.closeCard();
      },
      addRulerData(data) {
        this.obj = data;
        this.$refs.ingressRuleForm.closeCard();
      },
      updatePort(index) {
        const rule = this.obj.spec.rules[index];
        const tls = this.obj.spec.tls ? this.obj.spec.tls : [{ hosts: [], secretName: '' }];
        const ruler = {};
        ruler.index = index;
        ruler.host = rule.host;
        const tlsDict = this.getTLS(rule, tls);
        ruler.tls = tlsDict.protocol;
        ruler.secretName = tlsDict.secretName;
        const paths = [];
        rule.http.paths.forEach((p) => {
          if (p.backend.service?.port?.name) {
            paths.push({
              path: p.path,
              pathType: p.pathType,
              serviceName: p.backend.service.name,
              servicePort: p.backend.service.port.name,
              portType: 'name',
              portTypeMenu: false,
            });
          } else {
            paths.push({
              path: p.path,
              pathType: p.pathType,
              serviceName: p.backend.service.name,
              servicePort: p.backend.service.port.number,
              portType: 'number',
              portTypeMenu: false,
            });
          }
        });
        ruler.paths = paths;
        this.$nextTick(() => {
          this.$refs.ingressRuleForm.init(ruler);
          this.expand = true;
        });
      },
      removePort(index) {
        this.$delete(this.obj.spec.rules, index);
        if (this.obj.spec.tls) {
          this.$delete(this.obj.spec.tls, index);
        }
      },
      updateAnnotations(key) {
        const data = { key: key, value: this.obj.metadata.annotations[key] };
        this.$nextTick(() => {
          this.$refs.annotationForm.init(data);
          this.expand = true;
        });
      },
      removeAnnotations(key) {
        this.$delete(this.obj.metadata.annotations, key);
      },
      expandCard(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.$refs[formComponent].$refs.form.resetValidation();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      checkSaved() {
        if (this.$refs.annotationForm.expand) {
          return !this.$refs.annotationForm.expand;
        }
        if (this.$refs.ingressRuleForm.expand) {
          return !this.$refs.ingressRuleForm.expand;
        }
        return true;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      onKindChange() {
        this.$emit('change', this.resourceKind);
      },
      reset() {
        if (this.$refs.annotationForm) this.$refs.annotationForm.closeCard();
        this.$refs.ingressRuleForm.closeCard();
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      help() {
        window.open('https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/');
      },
      setData(data) {
        this.obj = data;
      },
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName);
      },
      onGatewaySelectFocus(clusterName) {
        this.m_select_gatewaySelectData(clusterName);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      onProtocolChange() {
        this.obj.metadata.annotations['nginx.ingress.kubernetes.io/backend-protocol'] = this.protocol;
      },
    },
  };
</script>
