<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新工作负载"
    icon="mdi-engine"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :step="step"
        :edit="true"
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
        @click="updateWorkload"
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
        style="margin-top: 6px !important;"
        color="primary"
        hide-details
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 primary--text font-weight-medium">
            Yaml
          </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import {
  patchUpdateDaemonSet,
  patchUpdateDeployment,
  patchUpdateStatefulSet,
  getDaemonSetDetail,
  getDeploymentDetail,
  getStatefulSetDetail,
} from '@/api'
import WorkloadBaseForm from './WorkloadBaseForm'
import WorkloadSchema from '@/views/resource/workload/mixins/schema'
import BaseResource from '@/mixins/resource'
import { deepCopy, randomString } from '@/utils/helpers'

export default {
  name: 'UpdateWorkload',
  components: {
    WorkloadBaseForm,
  },
  mixins: [BaseResource, WorkloadSchema],
  props: {
    cluster: {
      type: String,
      default: () => null,
    },
  },
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'WorkloadBaseForm',
    item: null,
    kind: '',
    step: 0,
    totalStep: 5,
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateWorkload() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = {}
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
          if (!this.m_resource_checkDataWithNS(data, this.item.metadata.namespace)) return
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'WorkloadBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        const kind = this.kind
        if (kind === 'DaemonSet') {
          await patchUpdateDaemonSet(
            this.ThisCluster || this.cluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
            data,
          )
        } else if (kind === 'Deployment') {
          await patchUpdateDeployment(
            this.ThisCluster || this.cluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
            data,
          )
        } else if (kind === 'StatefulSet') {
          await patchUpdateStatefulSet(
            this.ThisCluster || this.cluster,
            this.item.metadata.namespace,
            this.item.metadata.name,
            data,
          )
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item, kind) {
      let data = null
      this.kind = kind
      if (kind === 'DaemonSet') {
        data = await getDaemonSetDetail(
          this.ThisCluster || this.cluster,
          item.metadata.namespace,
          item.metadata.name,
        )
      } else if (kind === 'Deployment') {
        data = await getDeploymentDetail(
          this.ThisCluster || this.cluster,
          item.metadata.namespace,
          item.metadata.name,
        )
      } else if (kind === 'StatefulSet') {
        data = await getStatefulSetDetail(
          this.ThisCluster || this.cluster,
          item.metadata.namespace,
          item.metadata.name,
        )
      }
      this.formComponent = 'WorkloadBaseForm'
      this.item = deepCopy(data)
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].obj
        this.m_resource_addNsToData(
          data,
          this.AdminViewport
            ? this.item.metadata.namespace
            : this.ThisNamespace,
        )
        this.formComponent = 'BaseYamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        this.m_resource_addNsToData(
          data,
          this.AdminViewport
            ? this.item.metadata.namespace
            : this.ThisNamespace,
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
        const data = this.$refs[this.formComponent].obj
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
        const data = this.$refs[this.formComponent].obj
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
    reset() {
      this.dialog = false
      if (this.$refs[this.formComponent]) this.$refs[this.formComponent].reset()
      this.step = 0
      this.formComponent = ''
      this.yaml = false
    },
  },
}
</script>
