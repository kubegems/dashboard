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
      <BaseSubTitle :title="$root.$t('from.definition', [$root.$t('resource.service')])" />
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
              :no-data-text="$root.$t('data.no_data')"
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
          <v-col cols="6">
            <v-autocomplete
              v-model="selector"
              class="my-0"
              color="primary"
              hide-selected
              :items="workloads"
              :label="$t('tip.link_workload')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.selectorRule"
              @change="onWorkloadSelectorChange"
              @focus="onRelatedWorkloadSelectFocus"
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
              v-model="obj.spec.clusterIP"
              class="my-0"
              color="primary"
              hide-selected
              :items="types"
              :label="$t('tip.access_type')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.clusterIPRule"
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
              v-model="obj.spec.type"
              class="my-0"
              color="primary"
              hide-selected
              :items="externaltypes"
              :label="$t('tip.extend_access')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.typeRule"
              @change="onTypeChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col v-if="obj.spec.type === 'ExternalName'" cols="6">
            <v-text-field
              v-model="obj.spec.externalName"
              class="my-0"
              label="ExternalName"
              required
              :rules="objRules.externalNameRule"
            />
          </v-col>
          <v-col v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'sessionAffinityConfig')" cols="6">
            <v-text-field
              v-if="obj.spec.sessionAffinityConfig && obj.spec.sessionAffinityConfig.clientIP"
              v-model="obj.spec.sessionAffinityConfig.clientIP.timeoutSeconds"
              class="my-0"
              :label="$t('tip.keep_alive')"
              required
              :rules="objRules.sessionRule"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="obj.spec.type !== 'ExternalName'">
        <ServicePortForm
          ref="servicePortForm"
          :data="obj.spec.ports"
          @addData="addPortData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle :title="$t('tip.port_config')" />
        <v-card-text class="pa-2">
          <ServicePortItem
            :ports="obj.spec.ports"
            @expandCard="expandCard"
            @removePort="removePort"
            @updatePort="updatePort"
          />
        </v-card-text>
      </template>

      <LabelForm ref="labelForm" :data="obj.metadata.labels" @addData="addLabelData" @closeOverlay="closeExpand" />
      <BaseSubTitle :title="$t('tip.label')" />
      <v-card-text class="pa-2">
        <LabelItem
          :labels="obj.metadata.labels"
          @expandCard="expandCard"
          @removeLabels="removeLabels"
          @updateLabels="updateLabels"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>

      <AnnotationForm
        ref="annotationForm"
        :data="obj.metadata.annotations"
        @addData="addAnnotationData"
        @closeOverlay="closeExpand"
      />
      <v-flex v-if="obj.spec.type === 'LoadBalancer'">
        <BaseSubTitle :title="$t('tip.annotation')" />
        <v-card-text class="pa-2">
          <AnnotationItem
            :annotations="obj.metadata.annotations"
            @expandCard="expandCard"
            @removeAnnotations="removeAnnotations"
            @updateAnnotations="updateAnnotations"
          />
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-flex>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import ServicePortForm from './ServicePortForm';
  import ServicePortItem from './ServicePortItem';
  import { getAppResourceFileMetas } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';
  import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm';
  import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'ServiceBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      AnnotationForm,
      AnnotationItem,
      LabelForm,
      LabelItem,
      ServicePortForm,
      ServicePortItem,
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
      kinds: {
        type: Array,
        default: () => [],
      },
      kind: {
        type: String,
        default: () => 'Service',
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
      workloads: [],
      selector: '',
      obj: {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: '',
          namespace: null,
          labels: {},
          annotations: {},
        },
        spec: {
          clusterIP: '',
          ports: [],
          selector: {},
          type: '',
          sessionAffinityConfig: {
            clientIP: {
              timeoutSeconds: 10800,
            },
          },
        },
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Cluster']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          selectorRule: [required],
          typeRule: [required],
          kindRule: [required],
          externalNameRule: [required],
        };
      },
      types() {
        return [
          { text: this.$t('tip.vip'), value: null },
          { text: this.$t('tip.headless'), value: 'None' },
        ];
      },
      externaltypes() {
        return [
          { text: 'LoadBalancer', value: 'LoadBalancer' },
          { text: 'NodePort', value: 'NodePort' },
          { text: 'ExternalName', value: 'ExternalName' },
          { text: this.$t('tip.no_access'), value: 'ClusterIP' },
        ];
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['service'] || 'v1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadData() {
        this.$nextTick(async () => {
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
          } else {
            this.obj.metadata.name = `${this.app.ApplicationName}`;
          }

          if (!this.obj.metadata.labels) {
            this.obj.metadata.labels = {};
          }
          if (!this.obj.metadata.annotations) {
            this.obj.metadata.annotations = {};
          }
          if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null;
          this.resourceKind = this.kind;
          this.obj.kind = this.kind;
          await this.onRelatedWorkloadSelectFocus();
          this.selector = this.getWorkloadSelectIndex();
          this.types = [
            {
              text: this.$t('tip.vip'),
              value: this.obj.spec.clusterIP === 'None' ? null : this.obj.spec.clusterIP,
            },
            { text: this.$t('tip.headless'), value: 'None' },
          ];
        });
      },
      onTypeChange() {
        if (this.obj.spec.type === 'ExternalName') {
          this.obj.spec.externalName = this.item?.spec?.externalName;
        } else {
          this.$delete(this.obj.spec, 'externalName');
        }
      },
      addLabelData(data) {
        this.obj.metadata.labels = data;
        this.$refs.labelForm.closeCard();
      },
      addAnnotationData(data) {
        this.obj.metadata.annotations = data;
        this.$refs.annotationForm.closeCard();
      },
      addPortData(data) {
        this.obj.spec.ports = data;
        this.$refs.servicePortForm.closeCard();
      },
      updatePort(index) {
        const port = this.obj.spec.ports[index];
        const data = {
          index: index,
          name: port.name,
          protocol: port.protocol,
          port: port.port,
          targetPort: port.targetPort,
        };
        this.$nextTick(() => {
          this.$refs.servicePortForm.init(data);
          this.expand = true;
        });
      },
      removePort(index) {
        this.$delete(this.obj.spec.ports, index);
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.metadata.labels[key] };
        this.$nextTick(() => {
          this.$refs.labelForm.init(data);
          this.expand = true;
        });
      },
      removeLabels(key) {
        this.$delete(this.obj.metadata.labels, key);
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
      async onRelatedWorkloadSelectFocus() {
        if (this.manifest) {
          let kind = '';
          this.kinds.forEach((k) => {
            if (k.value === 'Deployment') {
              kind = 'Deployment';
              return;
            } else if (k.value === 'StatefulSet') {
              kind = 'StatefulSet';
              return;
            } else if (k.value === 'DaemonSet') {
              kind = 'DaemonSet';
              return;
            }
          });
          const data = await getAppResourceFileMetas(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            this.ThisAppEnvironmentID,
            this.$route.params.name,
            {
              kind: kind,
            },
          );
          const workloadSelect = [];
          data.forEach((workload, index) => {
            let selector = {};
            if (workload?.spec?.template?.metadata?.labels) {
              selector = workload.spec.template.metadata.labels;
              if (Object.prototype.hasOwnProperty.call(selector, 'version')) {
                delete selector['version'];
              }
              workloadSelect.push({
                text: workload.metadata.name,
                labels: selector,
                value: index,
              });
            }
          });
          this.workloads = workloadSelect;
          if (this.workloads.length > 0 && !this.edit) {
            this.obj.spec.selector = this.workloads[0].labels;
          }
        } else {
          if (!this.obj.metadata.namespace || this.obj.metadata.namespace === '') {
            return;
          }
          await this.m_select_workloadSelectData(this.ThisCluster, this.obj.metadata.namespace);
          this.workloads = this.m_select_workloadSelectItems;
        }
      },
      onWorkloadSelectorChange() {
        if (this.workloads[this.selector]) {
          if (this.workloads[this.selector].labels) {
            this.obj.spec.selector = this.workloads[this.selector].labels;
          } else this.obj.spec.selector = {};
        } else this.obj.spec.selector = {};
      },
      getWorkloadSelectIndex() {
        if (JSON.stringify(this.obj.spec.selector) === '{}') return -1;
        let index = -1;
        this.workloads.forEach((w) => {
          if (w && w.labels) {
            const keyin = Object.keys(this.obj.spec.selector).every((k) => {
              return Object.keys(w.labels).indexOf(k) > -1;
            });

            const valuein = Object.values(this.obj.spec.selector).every((v) => {
              return Object.values(w.labels).indexOf(v) > -1;
            });

            if (keyin && valuein) {
              index = w.value;
              return;
            }
          }
        });
        return index;
      },
      expandCard(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.labelForm.closeCard();
        this.$refs.annotationForm.closeCard();
        if (this.$refs.servicePortForm) {
          this.$refs.servicePortForm.closeCard();
        }
        this.$refs.form.reset();
        this.selector = '';
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
          if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null;
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
          if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null;
        });
      },
      checkSaved() {
        if (this.$refs.labelForm.expand) {
          return !this.$refs.labelForm.expand;
        }
        if (this.$refs.annotationForm.expand) {
          return !this.$refs.annotationForm.expand;
        }
        if (this.$refs.servicePortForm && this.$refs.servicePortForm.expand) {
          return !this.$refs.servicePortForm.expand;
        }
        return true;
      },
      onKindChange() {
        this.$emit('change', this.resourceKind);
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
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName);
      },
    },
  };
</script>
