<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="mb-4"
      :divider="false"
    />
    <v-textarea
      :id="id"
      :value="param.value"
      auto-grow
      :rules="textareaRule"
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
  data() {
    return {
      textareaRule: [required],
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
    onChange(event) {
      this.$emit('changeBasicFormParam', this.param, event)
    },
  },
}
</script>
