<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建工作负载"
    icon="mdi-engine"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :step="step"
        :kind="kind"
        title="Workload"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1 || formComponent === 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="addWorkload"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        上一步
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        style="margin-top: 8px !important;"
        color="white"
        hide-details
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 white--text font-weight-medium">
            YAML
          </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddDaemonSet, postAddDeployment, postAddStatefulSet } from '@/api'
import WorkloadBaseForm from './WorkloadBaseForm'
import WorkloadSchema from '@/views/resource/workload/mixins/schema'
import BaseResource from '@/mixins/resource'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddWorkload',
  components: {
    WorkloadBaseForm,
  },
  mixins: [BaseResource, WorkloadSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'WorkloadBaseForm',
    kind: '',
    step: 0,
    totalStep: 5,
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular', 'AdminViewport']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addWorkload() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].getYaml()
          data = this.$yamlload(data)
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'WorkloadBaseForm') {
          data = this.$refs[this.formComponent].getData()
          data = this.m_resource_beautifyData(data)
        }
        const namespace = this.AdminViewport
          ? data?.metadata?.namespace
          : this.ThisNamespace
        if (!this.m_resource_checkDataWithNS(data, namespace)) {
          return
        }
        const kind = this.kind
        if (kind === 'DaemonSet') {
          await postAddDaemonSet(
            this.ThisCluster,
            namespace,
            data.metadata.name,
            data,
          )
        } else if (kind === 'Deployment') {
          await postAddDeployment(
            this.ThisCluster,
            namespace,
            data.metadata.name,
            data,
          )
        } else if (kind === 'StatefulSet') {
          await postAddStatefulSet(
            this.ThisCluster,
            namespace,
            data.metadata.name,
            data,
          )
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].getData()
        this.m_resource_addNsToData(
          data,
          this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace,
        )
        this.formComponent = 'BaseYamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].getYaml()
        const data = this.$yamlload(yaml)
        this.m_resource_addNsToData(
          data,
          this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace,
        )
        if (!this.m_resource_validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'WorkloadBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    lastStep() {
      if (!this.$refs[this.formComponent]) {
        return
      }
      if (!this.$refs[this.formComponent].checkSaved()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请保存数据',
          color: 'warning',
        })
        return
      }
      if (this.step > 0) {
        const data = this.$refs[this.formComponent].getData()
        this.step -= 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].back(data)
        })
      }
    },
    nextStep() {
      if (!this.$refs[this.formComponent]) {
        return
      }
      if (!this.$refs[this.formComponent].checkSaved()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请保存数据',
          color: 'warning',
        })
        return
      }
      if (
        this.step < this.totalStep - 1 &&
        this.$refs[this.formComponent].validate()
      ) {
        const data = this.$refs[this.formComponent].getData()
        if (
          this.step === 1 &&
          (!data.spec.template.spec.containers ||
            (data.spec.template.spec.containers &&
              data.spec.template.spec.containers.length === 0))
        ) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请添加容器镜像',
            color: 'warning',
          })
          return
        }
        this.step += 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.formComponent = 'WorkloadBaseForm'
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.step = 0
      this.formComponent = ''
      this.yaml = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    setKind(kind) {
      this.kind = kind
    },
  },
}
</script>
