<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="流量切换"
    icon="mdi-recycle"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :service="service"
        :vs="vs"
        title="TrafficShifting"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addTrafficShifting"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddTrafficShifting } from '@/api'
import TrafficShiftingBaseForm from './TrafficShiftingBaseForm'
import BaseResource from '@/mixins/resource'

export default {
  name: 'TrafficShifting',
  components: {
    TrafficShiftingBaseForm,
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
    formComponent: 'TrafficShiftingBaseForm',
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
    async addTrafficShifting() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'TrafficShiftingBaseForm') {
          data = this.$refs[this.formComponent].obj
          data = this.beautifyData(data)
        }
        await postAddTrafficShifting(
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
      this.formComponent = 'TrafficShiftingBaseForm'
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
