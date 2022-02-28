<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="工作负载定义" />
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
            @input="onWorkloadNameInput"
          />
        </v-col>
        <v-col
          v-if="AdminViewport && !manifest"
          cols="6"
        >
          <v-autocomplete
            v-model="obj.metadata.namespace"
            color="primary"
            :items="namespaceSelect"
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

    <template v-if="kind !== 'DaemonSet'">
      <BaseSubTitle title="副本定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.replicas"
              class="my-0"
              required
              label="副本数量"
              :rules="objRules.replicasRule"
              type="number"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required, positiveInteger } from '@/utils/rules'

export default {
  name: 'WorkloadBaseInfo',
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
      default: () => '',
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
      obj: {
        apiVersion: 'apps/v1',
        kind: '',
        metadata: {
          name: '',
          namespace: null,
          labels: {},
        },
        spec: {
          template: {
            metadata: {
              labels: {},
            },
            spec: {},
          },
          selector: {
            matchLabels: {},
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
        replicasRule: [
          positiveInteger,
          (v) => parseInt(v) >= 0 || '副本数小于0',
        ],
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
            this.namespaceSelectData(this.ThisCluster)
          } else {
            this.obj.metadata.namespace = this.ThisNamespace
          }
        } else {
          this.obj.metadata.name = `${this.app.ApplicationName}`
        }
        this.obj = this.$_.merge(this.obj, deepCopy(this.item))
        this.resourceKind = this.kind
        this.obj.kind = this.kind
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
    onWorkloadNameInput() {
      this.obj.metadata.labels['app'] = this.obj.metadata.name
      this.obj.spec.template.metadata.labels['app'] = this.obj.metadata.name
      this.obj.spec.selector.matchLabels['app'] = this.obj.metadata.name
    },
    onKindChange() {
      this.$emit('change', this.resourceKind)
    },
    onNamespaceSelectFocus(clusterName) {
      this.namespaceSelectData(clusterName)
    },
  },
}
</script>
