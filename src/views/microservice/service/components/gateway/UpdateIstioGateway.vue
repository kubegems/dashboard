<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新istio网关"
    icon="mdi-gate"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="Gateway"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateIstioGateway"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchUpdateIstioGateway, getIstioGatewayDetail } from '@/api'
import IstioGatewayBaseForm from './IstioGatewayBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import IstioGatewaySchema from '@/views/microservice/service/mixins/schema'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateGateway',
  components: {
    YamlForm,
    IstioGatewayBaseForm,
  },
  mixins: [BaseResource, IstioGatewaySchema],
  data: () => ({
    dialog: false,
    yaml: null,
    item: null,
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
    async updateIstioGateway() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.checkDataWithOutNS(data)) return
          if (!this.validateJsonSchema(this.gatewayschema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'IstioGatewayBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        await patchUpdateIstioGateway(
          this.EnvironmentFilter.cluster,
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
      const data = await getIstioGatewayDetail(
        this.EnvironmentFilter.cluster,
        item.namespace,
        item.name,
      )
      this.item = deepCopy(data)
      this.$refs[this.formComponent].setYaml(deepCopy(data))
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
