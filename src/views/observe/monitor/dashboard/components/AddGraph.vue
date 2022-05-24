<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建监控图"
    icon="mdi-chart-areaspline"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addGraph"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddMonitorDashboardGraph } from '@/api'
import GraphBaseForm from './GraphBaseForm'

export default {
  name: 'AddGraph',
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
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
    async addGraph() {
      if (this.$refs[this.formComponent].validate()) {
        let data = ''
        if (this.formComponent === 'GraphBaseForm') {
          data = this.$refs[this.formComponent].getData()
        }
        await postAddMonitorDashboardGraph(
          this.environment.value,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
  },
}
</script>
