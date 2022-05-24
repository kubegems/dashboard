<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新监控大盘"
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
        @click="updateDashboard"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateMonitorDashboard, getMonitorDashboard } from '@/api'
import DashboardBaseForm from './DashboardBaseForm'

export default {
  name: 'UpdateDashboard',
  components: {
    DashboardBaseForm,
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
      formComponent: 'DashboardBaseForm',
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
      this.getMonitorDashboard(item)
    },
    async getMonitorDashboard(item) {
      const data = await getMonitorDashboard(this.environment.value, item.id)
      this.item = data
    },
    async updateDashboard() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'DashboardBaseForm') {
          data = this.$refs[this.formComponent].getData()
        }
        await putUpdateMonitorDashboard(
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
