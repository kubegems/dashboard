<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="任务定义" />
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
      </v-row>
    </v-card-text>

    <BaseSubTitle title="任务设置" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.backoffLimit"
            class="my-0"
            required
            label="最大重试次数"
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.completions"
            class="my-0"
            required
            label="完成数"
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.parallelism"
            class="my-0"
            required
            label="并行数"
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.activeDeadlineSeconds"
            class="my-0"
            required
            label="退出超时时限(秒)"
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.spec.template.spec.restartPolicy"
            color="primary"
            :items="restartPolicys"
            label="重启策略"
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
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'JobBaseInfo',
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
      default: () => 'Job',
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
  data() {
    return {
      valid: false,
      resourceKind: '',
      restartPolicys: [
        { text: 'Never (故障时创建新的容器组)', value: 'Never' },
        {
          text: 'OnFailure (故障时内部重启容器)',
          value: 'OnFailure',
        },
      ],
      obj: {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          parallelism: 0,
          completions: 0,
          backoffLimit: 0,
          activeDeadlineSeconds: 0,
          template: {
            spec: {
              restartPolicy: 'Never',
            },
            metadata: {
              labels: {},
            },
          },
        },
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        namespaceRule: [required],
        kindRule: [required],
      }
    },
  },
  watch: {
    item() {
      this.loadData()
    },
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.$nextTick(() => {
        if (!this.manifest) {
          if (this.AdminViewport) {
            this.m_select_namespaceSelectData(this.ThisCluster)
          } else {
            this.obj.metadata.namespace = this.ThisNamespace
          }
        } else {
          this.obj.metadata.name = `${this.app.ApplicationName}`
        }
        this.obj = this.$_.merge(this.obj, deepCopy(this.item))
        this.resourceKind = this.kind
        this.obj.kind = this.kind
        this.obj.spec.template.spec.nodeSelector = {}
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = this.$_.merge(this.obj, deepCopy(data))
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    onKindChange() {
      this.$emit('change', this.resourceKind)
    },
    onNamespaceSelectFocus(clusterName) {
      this.m_select_namespaceSelectData(clusterName)
    },
  },
}
</script>
