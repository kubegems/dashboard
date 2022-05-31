<template>
  <v-flex
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :style="`height: ${height}px !important;overflow: auto;`"
  >
    <ACEEditor
      v-model="kubeyaml"
      lang="yaml"
      class="rounded-0"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
      theme="chrome"
      @init="$aceinit"
      @keydown.stop
    />
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DeployLiveYaml',
  props: {
    resource: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    kubeyaml: '',
  }),
  computed: {
    ...mapState(['Scale']),
    height() {
      return window.innerHeight - 64 * this.Scale - 1 - 45 * this.Scale
    },
  },
  watch: {
    resource: {
      handler: function () {
        if (this.resource) {
          this.kubeyaml = this.$yamldump(this.resource.liveState)
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    dispose() {},
  },
}
</script>
