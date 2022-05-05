<template>
  <div />
</template>

<script>
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceInfo',
  components: {

  },
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      output: null,
    }
  },
  watch: {
    item() {
      this.output = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.output = deepCopy(this.item)
  },
}
</script>
