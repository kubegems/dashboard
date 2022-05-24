<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新监控图"
    icon="mdi-chart-areaspline"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateGraph"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateMonitorDashboardGraph, getMonitorDashboardGraph } from '@/api'
import GraphBaseForm from './GraphBaseForm'

export default {
  name: 'UpdateDashboard',
  components: {
    GraphBaseForm,
  },
  props: {
    environment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      dialog: false,
      formComponent: 'GraphBaseForm',
      item: null,
    }
  },
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item) {
      this.getMonitorGraph(item)
    },
    async getMonitorGraph(item) {
      const data = await getMonitorDashboardGraph(this.environment.value, item.id)
      this.item = data
    },
    async updateGraph() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'GraphBaseForm') {
          data = this.$refs[this.formComponent].getData()
        }
        await putUpdateMonitorDashboardGraph(
          this.environment.value,
          data.id,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
