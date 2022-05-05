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
      flow: null,
    }
  },
  watch: {
    item() {
      this.flow = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.flow = deepCopy(this.item)
  },
}
</script>
