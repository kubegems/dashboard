<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建采集器"
    icon="mdi-eyedropper"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="ServiceMonitor"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addServiceMonitor"
      >
        确定
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
import { postAddServiceMonitor } from '@/api'
import YamlForm from '@/views/resource/components/common/YamlForm'
import ServiceMonitorBaseForm from './ServiceMonitorBaseForm'
import BaseResource from '@/mixins/resource'
import ServiceMonitorSchema from '@/views/resource/servicemonitor/mixins/schema'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddServiceMonitor',
  components: {
    YamlForm,
    ServiceMonitorBaseForm,
  },
  mixins: [BaseResource, ServiceMonitorSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'ServiceMonitorBaseForm',
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
    async addServiceMonitor() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (
            !this.checkDataWithNS(
              data,
              this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace,
            )
          ) {
            return
          }
          if (!this.validateJsonSchema(this.schema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'ServiceMonitorBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        const namespace = this.AdminViewport
          ? data?.metadata?.namespace
          : this.ThisNamespace
        await postAddServiceMonitor(
          this.ThisCluster,
          namespace,
          data.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].obj
        this.formComponent = 'YamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        if (!this.validateJsonSchema(this.schema, data)) {
          this.yaml = true
          this.switchKey = randomString(6)
          return
        }
        this.formComponent = 'ServiceMonitorBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.formComponent = 'ServiceMonitorBaseForm'
      if (
        this.$refs[this.formComponent] &&
        this.$refs[this.formComponent].reset
      ) {
        this.$refs[this.formComponent].reset()
      }
      this.yaml = false
    },
  },
}
</script>
