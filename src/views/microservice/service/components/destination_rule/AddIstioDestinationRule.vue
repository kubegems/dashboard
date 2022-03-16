<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建istio流量规则"
    icon="mdi-ruler"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="DestinationRule"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addIstioDestinationRule"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddIstioDestinationRule } from '@/api'
import IstioDestinationRuleBaseForm from './IstioDestinationRuleBaseForm'
import BaseResource from '@/mixins/resource'
import IstioDestinationRuleSchema from '@/views/microservice/service/mixins/schema'

export default {
  name: 'AddIstioDestinationRule',
  components: {
    IstioDestinationRuleBaseForm,
  },
  mixins: [BaseResource, IstioDestinationRuleSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'BaseYamlForm',
  }),
  computed: {
    ...mapState(['Circular', 'EnvironmentFilter']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addIstioDestinationRule() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_validateJsonSchema(this.destinationruleschema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'IstioDestinationRuleBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        if (!this.m_resource_checkDataWithOutNS(data)) return
        await postAddIstioDestinationRule(
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
      this.formComponent = 'BaseYamlForm'
      this.yaml = false
    },
  },
}
</script>
