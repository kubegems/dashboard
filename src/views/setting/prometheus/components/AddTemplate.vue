<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建 Prometheus 查询模版"
    icon="mdi-file-powerpoint-box"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :units="units"
        title="Reocrding Rules"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addTemplate"
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
  name: 'AddTemplate',
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
    async addTemplate() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'TemplateBaseForm') {
          data = this.$refs[this.formComponent].generateData()
          const ruleName = data.name
          delete data.name
          await postPrometheusTemplate(this.resourceName, ruleName, data)
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(resourceName) {
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
