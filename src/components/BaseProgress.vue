<template>
  <v-overlay :value="Progress">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </v-overlay>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BaseProgress',
  computed: {
    ...mapState(['Progress']),
  },
}
</script>

<style lang="scss" scoped>
.v-progress-linear-position {
  top: 64px !important;
  z-index: 20;
}

.v-overlay {
  z-index: 20 !important;
}
</style>
