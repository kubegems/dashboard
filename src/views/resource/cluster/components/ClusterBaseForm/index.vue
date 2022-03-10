<template>
  <component
    :is="steps[step]"
    :ref="steps[step]"
    :item="item"
    :edit="edit"
    @refresh="refresh"
  />
</template>

<script>
import ValidateKubeConfig from './ValidateKubeConfig'
import TestKubeConfig from './TestKubeConfig'
import InitClusterConfig from './InitClusterConfig'

export default {
  name: 'ClusterBaseForm',
  components: {
    ValidateKubeConfig,
    TestKubeConfig,
    InitClusterConfig,
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
  },
  data: () => ({
    steps: [
      'ValidateKubeConfig',
      'TestKubeConfig',
      'InitClusterConfig',
    ],
  }),
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
    validate() {
      return this.$refs[this.steps[this.step]].$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs[this.steps[this.step]].reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.$refs[this.steps[this.step]].getData()
    },
    // eslint-disable-next-line vue/no-unused-properties
    getStatus() {
      return this.$refs[this.steps[this.step]].getStatus()
    },
    refresh(data) {
      this.$emit('refresh', data)
    },
  },
}
</script>
