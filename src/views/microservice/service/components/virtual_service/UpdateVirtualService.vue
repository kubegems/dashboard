<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新istio虚拟服务"
    icon="mdi-cloud-outline"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="VirtualService"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateIstioVirtualService"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchUpdateIstioVirtualService, getIstioVirtualServiceDetail } from '@/api'
import IstioVirtualServiceBaseForm from './IstioVirtualServiceBaseForm'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import IstioVirtualServiceSchema from '@/views/microservice/service/mixins/schema'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateIstioVirtualService',
  components: {
    YamlForm,
    IstioVirtualServiceBaseForm,
  },
  mixins: [BaseResource, IstioVirtualServiceSchema],
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
    async updateIstioVirtualService() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.checkDataWithOutNS(data)) return
          if (!this.validateJsonSchema(this.virtualserviceschema, data)) {
            return
          }
          data = this.beautifyData(data)
        } else if (this.formComponent === 'IstioVirtualServiceBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        await patchUpdateIstioVirtualService(
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
      const data = await getIstioVirtualServiceDetail(
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
