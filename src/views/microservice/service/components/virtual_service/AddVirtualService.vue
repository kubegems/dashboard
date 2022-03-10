<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建istio虚拟服务"
    icon="mdi-cloud-outline"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        title="VirtualService"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addIstioVirtualService"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddIstioVirtualService } from '@/api'
import IstioVirtualServiceBaseForm from './IstioVirtualServiceBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import IstioVirtualServiceSchema from '@/views/microservice/service/mixins/schema'

export default {
  name: 'AddIstioVirtualService',
  components: {
    YamlForm,
    IstioVirtualServiceBaseForm,
  },
  mixins: [BaseResource, IstioVirtualServiceSchema],
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'YamlForm',
  }),
  computed: {
    ...mapState(['Circular', 'EnvironmentFilter']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addIstioVirtualService() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_validateJsonSchema(this.virtualserviceschema, data)) {
            return
          }
          data = this.m_resource_beautifyData(data)
        } else if (this.formComponent === 'IstioVirtualServiceBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.m_resource_beautifyData(data)
        }
        if (!this.m_resource_checkDataWithOutNS(data)) return
        await postAddIstioVirtualService(
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
