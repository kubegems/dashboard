<template>
  <v-overlay :value="Progress && !DialogActive && !PanelActive">
    <!-- <v-progress-circular indeterminate size="64" :width="5"></v-progress-circular> -->
    <v-card class="progress__light">
      <v-card-text>
        <img width="100px" src="/loading.gif" />
        <div class="text-subtitle-2 text-center grey--text">数据获取中...</div>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BaseProgress',
  computed: {
    ...mapState(['Progress', 'DialogActive', 'PanelActive']),
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

.progress {
  &__light {
    background-color: #ffffff !important;
    border-color: #ffffff !important;
    color: rgba(0, 0, 0, 0.87) !important;
  }
}
</style>
