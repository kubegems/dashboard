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
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.persistentvolumeclaim')])" />
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
          <v-col v-if="!manifest || ThisAppEnvironmentID" cols="6">
            <v-autocomplete
              v-model="obj.spec.storageClassName"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_storageClassItems"
              :label="$root.$t('resource.storageclass')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.storageClassNameRule"
              @focus="onStorageClassSelectFocus(ThisCluster)"
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
              v-model="accessMode"
              class="my-0"
              color="primary"
              hide-selected
              :items="accessModes"
              :label="$t('table.access_mode')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.accessModesRule"
              @change="onAccessModeChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.resources.requests.storage"
              class="my-0"
              :label="$t('table.capacity')"
              required
              :rules="objRules.storageRule"
            />
          </v-col>
        </v-row>
      </v-card-text>

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
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';
  import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm';
  import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'PersistentVolumeClaimBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      AnnotationForm,
      AnnotationItem,
      LabelForm,
      LabelItem,
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
        default: () => 'PersistentVolumeClaim',
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
      accessMode: '',
      obj: {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: {
          name: '',
          namespace: null,
          labels: {},
          annotations: {},
        },
        spec: {
          accessModes: [],
          resources: {
            requests: {
              storage: '',
            },
          },
          storageClassName: '',
        },
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
      ...mapGetters(['Tenant', 'Cluster', 'Environment']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          accessModesRule: [required],
          storageRule: [
            required,
            (v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || this.$t('form.storage_rule'),
          ],
          storageClassNameRule: [required],
          kindRule: [required],
        };
      },
      storageClass() {
        if (this.obj.spec.storageClassName && this.obj.spec.storageClassName !== '') {
          const sc = this.m_select_storageClassItems.find((sc) => {
            return sc.value === this.obj.spec.storageClassName;
          });
          if (sc) {
            return sc.storageClass;
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
      accessModes() {
        if (
          this.storageClass &&
          this.storageClass.metadata &&
          this.storageClass.metadata.annotations &&
          this.storageClass.metadata.annotations[`storageclass.kubegems.io/supported-access-modes`]
        ) {
          const modes =
            this.storageClass.metadata.annotations[`storageclass.kubegems.io/supported-access-modes`].split(',');
          const accessModes = [];
          modes.forEach((mode) => {
            if (mode === 'rwo') {
              accessModes.push({ text: this.$t('tip.rwo'), value: 'ReadWriteOnce' });
            } else if (mode === 'rox') {
              accessModes.push({ text: this.$t('tip.rox'), value: 'ReadOnlyMany' });
            } else if (mode === 'rwx') {
              accessModes.push({ text: this.$t('tip.rwx'), value: 'ReadWriteMany' });
            }
          });
          return accessModes;
        } else {
          return [
            { text: this.$t('tip.rwo'), value: 'ReadWriteOnce' },
            { text: this.$t('tip.rox'), value: 'ReadOnlyMany' },
            { text: this.$t('tip.rwx'), value: 'ReadWriteMany' },
          ];
        }
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['persistentvolumeclaim'] || 'v1';
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
              this.m_select_storageClassSelectData(this.ThisCluster);
              this.m_select_namespaceSelectData(this.ThisCluster);
            } else {
              this.obj.metadata.namespace = this.ThisNamespace;
            }
          } else {
            this.obj.metadata.name = `${this.app.ApplicationName}`;
          }

          this.resourceKind = this.kind;
          this.obj.kind = this.kind;
          if (!this.obj.metadata.labels) {
            this.obj.metadata.labels = {};
          }
          if (!this.obj.metadata.annotations) {
            this.obj.metadata.annotations = {};
          }
          if (this.obj.spec.accessModes.length > 0) {
            this.accessMode = this.obj.spec.accessModes[0];
          }
          if (this.obj.spec.resources.requests.storage && !isNaN(this.obj.spec.resources.requests.storage)) {
            this.obj.spec.resources.requests.storage = `${
              parseInt(this.obj.spec.resources.requests.storage) / 1024 / 1024 / 1024
            }Gi`;
          }
        });
      },
      addLabelData(data) {
        this.obj.metadata.labels = data;
      },
      addAnnotationData(data) {
        this.obj.metadata.annotations = data;
      },
      onAccessModeChange() {
        this.obj.spec.accessModes = [this.accessMode];
      },
      removeLabels(key) {
        this.$delete(this.obj.metadata.labels, key);
      },
      removeAnnotations(key) {
        this.$delete(this.obj.metadata.annotations, key);
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.metadata.labels[key] };
        this.$nextTick(() => {
          this.$refs.labelForm.init(data);
          this.expand = true;
        });
      },
      updateAnnotations(key) {
        const data = { key: key, value: this.obj.metadata.annotations[key] };
        this.$nextTick(() => {
          this.$refs.annotationForm.init(data);
          this.expand = true;
        });
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
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
          if (!this.manifest) {
            this.m_select_storageClassSelectData(this.ThisCluster);
          }
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      checkSaved() {
        if (this.$refs.labelForm.expand) {
          return !this.$refs.labelForm.expand;
        }
        if (this.$refs.annotationForm.expand) {
          return !this.$refs.annotationForm.expand;
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
      onStorageClassSelectFocus(clusterName) {
        this.m_select_storageClassSelectData(clusterName);
      },
    },
  };
</script>
