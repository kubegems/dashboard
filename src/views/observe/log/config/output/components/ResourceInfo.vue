<template>
  <v-sheet>
    <v-sheet class="pa-2">
      <BaseListItemForDetail title="Output">
        <template #content>
          <BaseCollapseChips
            v-if="output && output.spec"
            :chips="Object.keys(output.spec) || []"
            single-line
            icon="mdi-router-wireless"
          />
        </template>
      </BaseListItemForDetail>
    </v-sheet>
  </v-sheet>
</template>

<script>
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceInfo',
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
