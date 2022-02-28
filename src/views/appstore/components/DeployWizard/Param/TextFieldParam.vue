<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="mb-4"
      :divider="false"
    />
    <v-text-field
      :id="id"
      :value="param.value"
      :type="inputType ? inputType : 'text'"
      :rules="textRule"
      :label="pathLevel === 1 ? '' : label"
      class="my-2"
      @change="onChange($event)"
    />
  </v-flex>
</template>

<script>
import { required } from '@/utils/rules'

export default {
  name: 'TextFieldParam',
  props: {
    inputType: {
      type: String,
      default: () => '',
    },
    label: {
      type: String,
      default: () => '',
    },
    param: {
      type: Object,
      default: () => {},
    },
    id: {
      type: String,
      default: () => '',
    },
  },
  data () {
    return {
      textRule: [required],
    }
  },
  computed: {
    pathLevel() {
      return this.param.path.split('/').length
    },
  },
  mounted() {
    this.onChange(this.param.value)
  },
  methods: {
    onChange(value) {
      if (this.inputType === 'number' && value) {
        value = parseFloat(value, 10)
      }
      if (value) {
        this.$emit('changeBasicFormParam', this.param, value)
      }
    },
  },
}
</script>
