<template>
  <YamlForm
    ref="yamlForm"
    :title="title"
    :item="data"
  />
</template>

<script>
import YamlForm from '@/views/resource/components/common/YamlForm'

export default {
  name: 'LogYamlForm',
  components: {
    YamlForm,
  },
  props: {
    data: {
      type: Object,
      default: () => null,
    },
    title: {
      type: String,
      default: 'Flow',
    },
  },
  beforeDestroy() {
    this.onUpdateData()
  },
  methods: {
    onUpdateData() {
      return this.$emit(
        'update:data',
        this.$yamlload(this.$refs.yamlForm.kubeyaml),
      )
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.yamlForm.validate(true)
    },
  },
}
</script>
