<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="存储卷定义" />
      <v-card-text class="pa-2">
        <v-row v-if="manifest">
          <v-col cols="6">
            <v-autocomplete
              v-model="resourceKind"
              class="my-0"
              color="primary"
              hide-selected
              :items="kinds"
              label="资源"
              no-data-text="暂无可选数据"
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
              label="名称"
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
              label="命名空间"
              no-data-text="暂无可选数据"
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
              label="存储类型"
              no-data-text="暂无可选数据"
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
              label="访问模式"
              no-data-text="暂无可选数据"
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
              label="容量"
              required
              :rules="objRules.storageRule"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <LabelForm ref="labelForm" :data="obj.metadata.labels" @addData="addLabelData" @closeOverlay="closeExpand" />
      <BaseSubTitle title="标签" />
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
      <BaseSubTitle title="注解" />
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
            (v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || '格式错误(示例:1Ki,1Mi,1Gi,1Ti)',
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
              accessModes.push({ text: '单节点读写', value: 'ReadWriteOnce' });
            } else if (mode === 'rox') {
              accessModes.push({ text: '多节点只读', value: 'ReadOnlyMany' });
            } else if (mode === 'rwx') {
              accessModes.push({ text: '多节点读写', value: 'ReadWriteMany' });
            }
          });
          return accessModes;
        } else {
          return [
            { text: '单节点读写', value: 'ReadWriteOnce' },
            { text: '多节点只读', value: 'ReadOnlyMany' },
            { text: '多节点读写', value: 'ReadWriteMany' },
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
