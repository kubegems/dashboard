<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="路由定义" />
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
              label="声明网关"
              no-data-text="暂无可选数据"
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
        </v-row>
      </v-card-text>

      <IngressRuleForm
        ref="ingressRuleForm"
        :domain="baseDomain"
        :obj="obj"
        @addData="addRulerData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="路由规则" />
      <v-card-text class="pa-2">
        <IngressRuleItem
          :obj="obj"
          :rules="obj.spec.rules"
          :tls="obj.spec.tls"
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
      <BaseSubTitle title="注解">
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
      obj: {
        apiVersion: 'networking.k8s.io/v1beta1',
        kind: 'Ingress',
        metadata: {
          name: '',
          namespace: '',
          annotations: {},
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
          this.obj.apiVersion = this.ApiResources['ingress'] || 'networking.k8s.io/v1beta1';
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
          }
          this.resourceKind = this.kind;
          this.obj.kind = this.kind;
        });
      },
      getTLS(rule, tls) {
        let basePrefix = 'http';
        let prefix = 'http';
        let secret = '';
        if (this.obj.metadata.annotations) {
          if (this.obj.metadata.annotations['nginx.org/websocket-services']) {
            if (
              rule.http.paths.find((p) => {
                return (
                  this.obj.metadata.annotations['nginx.org/websocket-services']
                    .split(',')
                    .indexOf(p.backend.serviceName) > -1
                );
              })
            ) {
              basePrefix = 'ws';
              prefix = 'ws';
            }
          } else if (this.obj.metadata.annotations['nginx.org/grpc-services']) {
            if (
              rule.http.paths.find((p) => {
                return (
                  this.obj.metadata.annotations['nginx.org/grpc-services'].split(',').indexOf(p.backend.serviceName) >
                  -1
                );
              })
            ) {
              basePrefix = 'grpc';
              prefix = 'grpc';
            }
          }
        }
        if (tls) {
          tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              if (basePrefix === 'http') prefix = 'https';
              else if (basePrefix === 'ws') prefix = 'wss';
              else if (basePrefix === 'grpc') prefix = 'grpc';
              secret = t.secretName;
              return;
            }
          });
        }
        return { protocol: `${prefix}`, secretName: secret };
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
          paths.push({
            path: p.path,
            serviceName: p.backend.serviceName,
            servicePort: p.backend.servicePort,
          });
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
        window.open(
          'https://docs.nginx.com/nginx-ingress-controller/configuration/ingress-resources/advanced-configuration-with-annotations',
        );
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
    },
  };
</script>
