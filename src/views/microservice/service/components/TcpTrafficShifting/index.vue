<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="Tcp流量切换"
    icon="mdi-recycle"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :service="service"
        :vs="vs"
        title="TcpTrafficShifting"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addTcpTrafficShifting"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddTcpTrafficShifting } from '@/api'
import TcpTrafficShiftingBaseForm from './TcpTrafficShiftingBaseForm'
import BaseResource from '@/mixins/resource'

export default {
  name: 'TcpTrafficShifting',
  components: {
    TcpTrafficShiftingBaseForm,
  },
  mixins: [BaseResource],
  props: {
    service: {
      type: Object,
      default: () => null,
    },
    vs: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    dialog: false,
    yaml: false,
    formComponent: 'TcpTrafficShiftingBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['VirtualSpace']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addTcpTrafficShifting() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'TcpTrafficShiftingBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        await postAddTcpTrafficShifting(
          this.VirtualSpace().ID,
          this.$route.query.environmentid,
          this.$route.params.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.formComponent = 'TcpTrafficShiftingBaseForm'
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = ''
      this.yaml = false
    },
  },
}
</script>
