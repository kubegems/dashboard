<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建istio网关"
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
        @click="addIstioGateway"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddIstioGateway } from '@/api'
import IstioGatewayBaseForm from './IstioGatewayBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import IstioGatewaySchema from '@/views/microservice/service/mixins/schema'

export default {
  name: 'AddIstioGateway',
  components: {
    YamlForm,
    IstioGatewayBaseForm,
  },
  mixins: [BaseResource, IstioGatewaySchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'YamlForm',
  }),
  computed: {
    ...mapState(['Circular', 'EnvironmentFilter']),
    ...mapGetters(['VirtualSpace']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addIstioGateway() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.validateJsonSchema(this.gatewayschema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'IstioGatewayBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        if (!this.checkDataWithOutNS(data)) return
        await postAddIstioGateway(
          this.EnvironmentFilter.cluster,
          this.EnvironmentFilter.namespace,
          data.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'YamlForm'
      this.yaml = false
    },
  },
}
</script>
