<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="服务定义" />
      <v-card-text class="pa-2">
        <v-row v-if="manifest">
          <v-col cols="6">
            <v-autocomplete
              v-model="resourceKind"
              color="primary"
              :items="kinds"
              :rules="objRules.kindRule"
              :readonly="edit"
              label="资源"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onKindChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
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
              required
              label="名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col
            v-if="AdminViewport && !manifest"
            cols="6"
          >
            <v-autocomplete
              v-model="obj.metadata.namespace"
              color="primary"
              :items="m_select_namespaceItems"
              :rules="objRules.namespaceRule"
              :readonly="edit"
              label="命名空间"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @focus="onNamespaceSelectFocus(ThisCluster)"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="selector"
              color="primary"
              :items="workloads"
              :rules="objRules.selectorRule"
              label="关联工作负载"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @focus="onRelatedWorkloadSelectFocus"
              @change="onWorkloadSelectorChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.clusterIP"
              color="primary"
              :items="types"
              :rules="objRules.clusterIPRule"
              label="访问类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.type"
              color="primary"
              :items="externaltypes"
              :rules="objRules.typeRule"
              label="外部访问"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            v-if="
              Object.prototype.hasOwnProperty.call(
                obj.spec,
                'sessionAffinityConfig',
              )
            "
            cols="6"
          >
            <v-text-field
              v-if="obj.spec.sessionAffinityConfig && obj.spec.sessionAffinityConfig.clientIP"
              v-model="obj.spec.sessionAffinityConfig.clientIP.timeoutSeconds"
              class="my-0"
              required
              label="会话保持(秒)"
              :rules="objRules.sessionRule"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <ServicePortForm
        ref="servicePortForm"
        :data="obj.spec.ports"
        @addData="addPortData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="端口配置" />
      <v-card-text class="pa-2">
        <ServicePortItem
          :ports="obj.spec.ports"
          @updatePort="updatePort"
          @removePort="removePort"
          @expandCard="expandCard"
        />
      </v-card-text>

      <LabelForm
        ref="labelForm"
        :data="obj.metadata.labels"
        @addData="addLabelData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="标签" />
      <v-card-text class="pa-2">
        <LabelItem
          :labels="obj.metadata.labels"
          @updateLabels="updateLabels"
          @removeLabels="removeLabels"
          @expandCard="expandCard"
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
        <BaseSubTitle title="注解" />
        <v-card-text class="pa-2">
          <AnnotationItem
            :annotations="obj.metadata.annotations"
            @updateAnnotations="updateAnnotations"
            @removeAnnotations="removeAnnotations"
            @expandCard="expandCard"
          />
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-flex>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getAppResourceFileMetas } from '@/api'
import ServicePortItem from './ServicePortItem'
import LabelItem from '@/views/resource/components/label/LabelItem'
import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem'
import LabelForm from '@/views/resource/components/label/LabelForm'
import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm'
import ServicePortForm from './ServicePortForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'ServiceBaseForm',
  components: {
    ServicePortItem,
    LabelItem,
    AnnotationItem,
    LabelForm,
    AnnotationForm,
    ServicePortForm,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
    kind: {
      type: String,
      default: () => 'Service',
    },
    manifest: {
      type: Boolean,
      default: () => false,
    },
    kinds: {
      type: Array,
      default: () => [],
    },
    app: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    resourceKind: '',
    workloads: [],
    selector: '',
    types: [
      { text: '集群内部IP访问(VirtualIP)', value: null },
      { text: '通过服务后端EndpointIP访问(Headless)', value: 'None' },
    ],
    externaltypes: [
      { text: 'LoadBalancer', value: 'LoadBalancer' },
      { text: 'NodePort', value: 'NodePort' },
      { text: '禁止访问', value: 'ClusterIP' },
    ],
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
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        namespaceRule: [required],
        selectorRule: [required],
        typeRule: [required],
        kindRule: [required],
      }
    },
  },
  watch: {
    item: {
      handler() {
        this.loadData()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async loadData() {
      this.$nextTick(async () => {
        if (!this.item) {
          this.$refs.form.resetValidation()
        } else {
          this.obj = deepCopy(this.item)
        }

        if (!this.manifest) {
          if (this.AdminViewport) {
            this.m_select_namespaceSelectData(this.ThisCluster)
          } else {
            this.obj.metadata.namespace = this.ThisNamespace
          }
        } else {
          this.obj.metadata.name = `${this.app.ApplicationName}`
        }

        if (!this.obj.metadata.labels) {
          this.obj.metadata.labels = {}
        }
        if (!this.obj.metadata.annotations) {
          this.obj.metadata.annotations = {}
        }
        if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null
        this.resourceKind = this.kind
        this.obj.kind = this.kind
        await this.onRelatedWorkloadSelectFocus()
        this.selector = this.getWorkloadSelectIndex()
        this.types = [
          {
            text: '集群内部IP访问(VirtualIP)',
            value:
              this.obj.spec.clusterIP === 'None'
                ? null
                : this.obj.spec.clusterIP,
          },
          { text: '通过服务后端EndpointIP访问(Headless)', value: 'None' },
        ]
      })
    },
    addLabelData(data) {
      this.obj.metadata.labels = data
      this.$refs.labelForm.closeCard()
    },
    addAnnotationData(data) {
      this.obj.metadata.annotations = data
      this.$refs.annotationForm.closeCard()
    },
    addPortData(data) {
      this.obj.spec.ports = data
      this.$refs.servicePortForm.closeCard()
    },
    updatePort(index) {
      const port = this.obj.spec.ports[index]
      const data = {
        index: index,
        name: port.name,
        protocol: port.protocol,
        port: port.port,
        targetPort: port.targetPort,
      }
      this.$nextTick(() => {
        this.$refs.servicePortForm.init(data)
        this.expand = true
      })
    },
    removePort(index) {
      this.$delete(this.obj.spec.ports, index)
    },
    updateLabels(key) {
      const data = { key: key, value: this.obj.metadata.labels[key] }
      this.$nextTick(() => {
        this.$refs.labelForm.init(data)
        this.expand = true
      })
    },
    removeLabels(key) {
      this.$delete(this.obj.metadata.labels, key)
    },
    updateAnnotations(key) {
      const data = { key: key, value: this.obj.metadata.annotations[key] }
      this.$nextTick(() => {
        this.$refs.annotationForm.init(data)
        this.expand = true
      })
    },
    removeAnnotations(key) {
      this.$delete(this.obj.metadata.annotations, key)
    },
    async onRelatedWorkloadSelectFocus() {
      if (this.manifest) {
        let kind = ''
        this.kinds.forEach((k) => {
          if (k.value === 'Deployment') {
            kind = 'Deployment'
            return
          } else if (k.value === 'StatefulSet') {
            kind = 'StatefulSet'
            return
          } else if (k.value === 'DaemonSet') {
            kind = 'DaemonSet'
            return
          }
        })
        const data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: kind,
          },
        )
        const workloadSelect = []
        data.forEach((workload, index) => {
          let selector = {}
          if (
            workload?.spec?.template?.metadata?.labels
          ) {
            selector = workload.spec.template.metadata.labels
            if (Object.prototype.hasOwnProperty.call(selector, 'version')) {
              delete selector['version']
            }
            workloadSelect.push({
              text: workload.metadata.name,
              labels: selector,
              value: index,
            })
          }
        })
        this.workloads = workloadSelect
        if (this.workloads.length > 0 && !this.edit) {
          this.obj.spec.selector = this.workloads[0].labels
        }
      } else {
        if (
          !this.obj.metadata.namespace ||
          this.obj.metadata.namespace === ''
        ) {
          return
        }
        await this.m_select_workloadSelectData(
          this.ThisCluster,
          this.obj.metadata.namespace,
        )
        this.workloads = this.m_select_workloadSelectItems
      }
    },
    onWorkloadSelectorChange() {
      if (this.workloads[this.selector]) {
        if (this.workloads[this.selector].labels) {
          this.obj.spec.selector = this.workloads[this.selector].labels
        } else this.obj.spec.selector = {}
      } else this.obj.spec.selector = {}
    },
    getWorkloadSelectIndex() {
      if (JSON.stringify(this.obj.spec.selector) === '{}') return -1
      let index = -1
      this.workloads.forEach((w) => {
        if (w && w.labels) {
          const keyin = Object.keys(this.obj.spec.selector).every(k => {
            return Object.keys(w.labels).indexOf(k) > -1
          })

          const valuein = Object.values(this.obj.spec.selector).every(v => {
            return Object.values(w.labels).indexOf(v) > -1
          })

          if (keyin && valuein) {
            index = w.value
            return
          }
        }
      })
      return index
    },
    expandCard(formComponent) {
      this.$nextTick(() => {
        this.$refs[formComponent].expand = true
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.labelForm.closeCard()
      this.$refs.annotationForm.closeCard()
      this.$refs.servicePortForm.closeCard()
      this.$refs.form.reset()
      this.selector = ''
      this.obj = this.$options.data().obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
        if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
        if (!this.obj.spec.clusterIP) this.obj.spec.clusterIP = null
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.$refs.labelForm.expand) {
        return !this.$refs.labelForm.expand
      }
      if (this.$refs.annotationForm.expand) {
        return !this.$refs.annotationForm.expand
      }
      if (this.$refs.servicePortForm.expand) {
        return !this.$refs.servicePortForm.expand
      }
      return true
    },
    onKindChange() {
      this.$emit('change', this.resourceKind)
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    onNamespaceSelectFocus(clusterName) {
      this.m_select_namespaceSelectData(clusterName)
    },
  },
}
</script>
