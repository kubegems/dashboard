<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <component
      :is="steps[step]"
      :ref="steps[step]"
      :item="item"
      :edit="edit"
      :kind="kind"
    />
  </v-form>
</template>

<script>
import JobBaseInfo from './JobBaseInfo'
import ContaninerImage from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage'
import StorageMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount'
import ScheduleSelector from '@/views/resource/workload/components/WorkloadBaseForm/ScheduleSelector'

export default {
  name: 'JobBaseForm',
  components: {
    JobBaseInfo,
    ContaninerImage,
    StorageMount,
    ScheduleSelector,
  },
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
    step: {
      type: Number,
      default: () => 0,
    },
    kind: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    valid: false,
    steps: ['JobBaseInfo', 'ContaninerImage', 'StorageMount', 'ScheduleSelector'],
  }),
  computed: {
    // eslint-disable-next-line vue/no-unused-properties
    obj() {
      return this.$refs[this.steps[this.step]].obj
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$refs[this.steps[this.step]].init(data)
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$refs[this.steps[this.step]].back(data)
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.$refs[this.steps[this.step]].expand) {
        return !this.$refs[this.steps[this.step]].expand
      }
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs[this.steps[this.step]].$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs[this.steps[this.step]].$refs.form.reset()
    },
  },
}
</script>
