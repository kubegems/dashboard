<template>
  <BaseDialog
    v-model="visible"
    :width="1000"
    title="创建采集器"
    icon="mdi-eyedropper"
    @reset="onReset"
  >
    <template #content>
      <v-form
        id="observe-metrics-targets-form"
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <BaseSubTitle title="采集器定义" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="formData.name"
                :rules="formData.required"
                :disabled="type === 'edit'"
                label="名称"
              />
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model="formData.namespace"
                :items="namespaceItems"
                :rules="formRules.required"
                :disabled="type === 'edit'"
                label="命名空间"
                hide-selected
                no-data-text="暂无可选数据"
                @change="onNamespaceChange"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    small
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="formData.target_type"
                :items="targetTypeItems"
                :rules="formRules.required"
                :disabled="type === 'edit'"
                hide-selected
                label="类型"
                @change="getTargetNameItems"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    small
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-select>
            </v-col>

            <v-col cols="6">
              <v-autocomplete
                v-model="formData.target_namespace"
                :items="namespaceItems"
                :rules="formRules.required"
                :disabled="type === 'edit'"
                hide-selected
                label="目标命名空间"
                no-data-text="暂无可选数据"
                @change="getTargetNameItems"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    small
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="6">
              <v-autocomplete
                v-model="formData.target_name"
                :items="targetNameItems"
                :disabled="!formData.target_type || !formData.target_namespace || type === 'edit'"
                :rules="formRules.required"
                hide-selected
                label="目标"
                no-data-text="暂无可选数据"
                @change="onTargetNameChange"
              >
                <template #selection="{ item }">
                  <v-chip
                    color="primary"
                    small
                  >
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>

      <TargetsLabels :labels.sync="formData.target_labels" />
      <TargetsEndpoints
        :endpoints.sync="formData.target_endpoints"
        :port-items="portItems"
      />
    </template>

    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        @click="onSubmit"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getDeploymentList, getStatefulSetList, getDaemonSetList, getServiceList, postUpdateMetricsTarget } from '@/api'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'
import getNamespaceItems from '@/views/observe/hooks/namespace'
import TargetsEndpoints from './TargetsEndpoints.vue'
import TargetsLabels from './TargetsLabels.vue'

export default {
  name: 'MetricsTargetForm',
  components: {
    TargetsEndpoints,
    TargetsLabels,
  },
  props: {
    cluster: {
      type: String,
      default: undefined,
    },
  },
  data () {
    this.formRules = {
      required: [required],
    }

    this.targetTypeItems = [
      { text: 'service', value: 'service' },
      { text: 'deployment', value: 'deployment' },
      { text: 'statefulset', value: 'statefulset' },
      { text: 'daemonset', value: 'daemonset' },
    ]

    return {
      visible: false,
      valid: false,
      type: 'add',
      formData: {},
      namespaceItems: [],
      targetNameItems: [],
      portItems: [], // endpoints.port候选值列表
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    async getNamespaceItems () {
      if (!this.namespaceItems.length) {
        this.namespaceItems = await getNamespaceItems(this.AdminViewport, this.cluster, this.Tenant().ID)
      }
    },
    onReset () {
      this.formData = {}
      this.$refs.form.resetValidation()
    },
    onAdd () {},
    onEdit (item) {
      this.formData = deepCopy(item)
      this.getTargetNameItems(item.target_type)
    },
    onNamespaceChange (value) {
      this.formData.target_namespace = value
      this.getTargetNameItems(this.formData.target_type)
    },
    async getTargetNameItems () {
      if (!this.formData.target_type || !this.formData.target_namespace) return
      let action = null
      switch (this.formData.target_type) {
        case 'service': action = getServiceList; break
        case 'deployment': action = getDeploymentList; break
        case 'statefulset': action = getStatefulSetList; break
        case 'daemonset': action = getDaemonSetList; break
      }
      const params = [this.cluster, this.formData.target_namespace, { size: 999, noprocessing: true }]
      const data = await action(...params)
      this.targetNameItems = (data.List || []).map(item => {
        return {
          text: item.metadata.name,
          value: item.metadata.name,
          data: item,
        }
      })

      const current = this.targetNameItems.find(item => item.value === this.formData.target_name)
      if (current) {
        this.setPortItems(current.data)
      }
    },
    setLabels (item) {
      let labels = {}
      if (this.formData.target_type === 'service') {
        labels = { ...(item.metadata.labels || {}) }
        this.$set(this.formData, 'target_labels', { ...this.formData.target_labels })
      } else {
        if (item.spec && item.spec.template && item.spec.template.metadata) {
          labels = { ...(item.spec.template.metadata.labels || {}) }
        }
      }
      this.$set(this.formData, 'target_labels', { ...this.formData.target_labels, ...labels })
    },
    setPortItems (item) {
      this.portItems = []
      if (this.formData.target_type === 'service') {
        if (item.spec && item.spec.ports) {
          this.portItems = item.spec.ports.map(port => port.name)
        }
      } else {
        if (item.spec && item.spec.template && item.spec.template.spec && item.spec.template.spec.containers) {
          this.portItems = item.spec.template.spec.containers.map(container => container.name)
        }
      }
    },
    onTargetNameChange (value) {
      const current = this.targetNameItems.find(item => item.value === value)
      if (!current) return
      this.setLabels(current.data)
      this.setPortItems(current.data)
    },
    async onSubmit () {
      if (this.$refs.form.validate(true)) {
        await postUpdateMetricsTarget(this.cluster, this.formData.namespace, this.formData)
        this.visible = false
        this.$emit('finishSubmit')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    show (type = 'add', item) {
      this.visible = true
      this.type = type
      if (type === 'add') {
        this.onAdd()
      } else {
        this.onEdit(item)
      }
      this.getNamespaceItems()
    },
  },
}
</script>
