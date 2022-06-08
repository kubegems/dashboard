<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新 Prometheus 查询模版"
    icon="mdi-file-powerpoint-box"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :units="units"
        :edit="true"
        title="Reocrding Rules"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateTemplate"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postPrometheusTemplate } from '@/api'
import TemplateBaseForm from './TemplateBaseForm'

export default {
  name: 'UpdateTemplate',
  components: {
    TemplateBaseForm,
  },
  props: {
    units: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    dialog: false,
    yaml: null,
    item: null,
    resourceName: null,
    formComponent: 'TemplateBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateTemplate() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'TemplateBaseForm') {
          data = this.$refs[this.formComponent].getData()
          const ruleName = data.name
          delete data.name
          await postPrometheusTemplate(this.resourceName, ruleName, data)
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(resourceName, item) {
      this.item = item
      this.resourceName = resourceName
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'TemplateBaseForm'
      this.yaml = false
    },
  },
}
</script>
