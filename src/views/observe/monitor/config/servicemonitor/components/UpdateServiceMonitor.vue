<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新采集器"
    icon="mdi-eyedropper"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="false"
        title="ServiceMonitor"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateServiceMonitor"
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
import { patchUpdateServiceMonitor, getServiceMonitorDetail } from '@/api'
import ServiceMonitorBaseForm from './ServiceMonitorBaseForm'
import BaseResource from '@/mixins/resource'
import ServiceMonitorSchema from '../mixins/schema'
import { deepCopy, randomString } from '@/utils/helpers'

export default {
  name: 'UpdateServiceMonitor',
  components: {
    ServiceMonitorBaseForm,
  },
  mixins: [BaseResource, ServiceMonitorSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    item: {},
    formComponent: 'ServiceMonitorBaseForm',
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
    async updateServiceMonitor() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.checkDataWithNS(data, this.item.metadata.namespace)) return
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            return
          }
        } else if (this.formComponent === 'ServiceMonitorBaseForm') {
          data = this.$refs[this.formComponent].getData()
        }
        await patchUpdateServiceMonitor(
          this.$route.query.cluster,
          this.item.metadata.namespace,
          this.item.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getServiceMonitorDetail(
        this.$route.query.cluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.formComponent = 'ServiceMonitorBaseForm'
      this.item = deepCopy(data)
    },
    onYamlSwitchChange() {
      if (this.yaml) {
        const data = this.$refs[this.formComponent].getData()
        this.formComponent = 'BaseYamlForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setYaml(this.$yamldump(data))
        })
      } else {
        const yaml = this.$refs[this.formComponent].kubeyaml
        const data = this.$yamlload(yaml)
        if (!this.m_resource_validateJsonSchema(this.schema, data)) {
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
      this.$refs[this.formComponent].reset()
      this.formComponent = ''
      this.yaml = false
    },
  },
}
</script>
