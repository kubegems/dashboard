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
        :edit="true"
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
import { putUpdateMonitorDashboard } from '@/api'
import GraphBaseForm from './GraphBaseForm'
import { deepCopy } from '@/utils/helpers'

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
    dashboard: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      dialog: false,
      formComponent: 'GraphBaseForm',
      index: 0,
      item: null,
      dashboardCopy: null,
    }
  },
  computed: {
    ...mapState(['Circular']),
  },
  watch: {
    dashboard: {
      handler(newValue) {
        if (newValue) {
          this.dashboardCopy = deepCopy(newValue)
        }
      },
      deep: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item, index) {
      this.index = index
      this.item = deepCopy(item)
    },
    async updateGraph() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'GraphBaseForm') {
          data = this.$refs[this.formComponent].getData()
          this.dashboardCopy.graphs[this.index] = data
        }
        await putUpdateMonitorDashboard(
          this.environment.value,
          this.dashboardCopy.id,
          this.dashboardCopy,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.index = 0
    },
  },
}
</script>
