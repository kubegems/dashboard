<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建网关"
    icon="mdi-gate"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="Gateway"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addGateway"
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
import { mapGetters, mapState } from 'vuex'
import { postAddGateway } from '@/api'
import GatewayBaseForm from './GatewayBaseForm'
import BaseResource from '@/mixins/resource'
import GatewaySchema from '@/views/resource/gateway/mixins/schema'
import { randomString } from '@/utils/helpers'

export default {
  name: 'AddGateway',
  components: {
    GatewayBaseForm,
  },
  mixins: [BaseResource, GatewaySchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'GatewayBaseForm',
    switchKey: '',
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addGateway() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        if (this.$refs[this.formComponent].$refs.form.validate(true)) {
          let data = ''
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].kubeyaml
            data = this.$yamlload(data)
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return
            }
            data = this.m_resource_beautifyData(data)
          } else if (this.formComponent === 'GatewayBaseForm') {
            data = this.$refs[this.formComponent].getData()
            if (data.cluster === '') data.cluster = this.ThisCluster
            data = this.m_resource_beautifyData(data)
          }
          if (!this.m_resource_checkDataWithOutNS(data)) return
          await postAddGateway(this.Tenant().ID, this.ThisClusterID, data)
          this.reset()
          this.$emit('refresh')
        }
      }
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
        this.formComponent = 'GatewayBaseForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].setData(data)
        })
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'GatewayBaseForm'
      this.yaml = false
    },
  },
}
</script>
