<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="配置定义" />
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
          <v-col cols="6">
            <v-autocomplete
              v-if="AdminViewport && !manifest"
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

      <component
        :is="formComponent"
        :ref="formComponent"
        :data="obj.data"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="配置项" />
      <v-card-text class="pa-2">
        <ConfigMapDataItem
          :data="obj.data"
          @updateData="updateData"
          @removeData="removeData"
          @expandCard="expandCard"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import DataForm from '@/views/resource/components/common/DataForm'
import ConfigMapDataItem from './ConfigMapDataItem'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'ConfigMapBaseForm',
  components: {
    DataForm,
    ConfigMapDataItem,
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
      default: () => 'ConfigMap',
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
    obj: {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: '',
        namespace: null,
      },
      data: {},
    },
    formComponent: 'DataForm',
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
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
    item: {
      handler() {
        this.loadData()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    loadData() {
      this.$nextTick(() => {
        if (!this.item) {
          this.obj = this.$options.data().obj
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

        this.resourceKind = this.kind
        this.obj.kind = this.kind
      })
    },
    addData(data) {
      this.obj.data = data
      this.$refs[this.formComponent].closeCard()
    },
    updateData(key) {
      const data = { key: key, value: this.obj.data[key] }
      this.$refs[this.formComponent].init(data)
      this.expand = true
    },
    removeData(key) {
      this.$delete(this.obj.data, key)
    },
    expandCard() {
      this.$nextTick(() => {
        this.$refs[this.formComponent].expand = true
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs[this.formComponent].closeCard()
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.$refs[this.formComponent].expand) {
        return !this.$refs[this.formComponent].expand
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
