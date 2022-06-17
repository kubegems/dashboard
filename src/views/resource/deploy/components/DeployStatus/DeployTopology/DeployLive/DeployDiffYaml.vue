<template>
  <v-flex
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :style="`height: ${height}px !important;overflow: auto;`"
  >
    <CodeDiff :new-string="predictedLiveState" :old-string="normalizedLiveState" />
  </v-flex>
</template>

<script>
  import CodeDiff from 'vue-code-diff';
  import { mapState } from 'vuex';

  export default {
    name: 'DeployDiffYaml',
    components: {
      CodeDiff,
    },
    props: {
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      normalizedLiveState: '',
      predictedLiveState: '',
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1 - 45 * this.Scale;
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.normalizedLiveState = this.$yamldump(this.resource.normalizedLiveState);
            this.predictedLiveState = this.$yamldump(this.resource.predictedLiveState);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      dispose() {},
    },
  };
</script>

<style lang="scss">
  .theme--light.v-application code {
    background-color: rgba(0, 0, 0, 0) !important;
    color: currentColor;
    font-size: 13px;
    line-height: 13px !important;
    font-family: Monaco, Menlo, Consolas, Courier New, monospace, PingFang SC;
  }

  .hljs {
    height: 22px !important;
  }

  .d2h-code-line {
    font-size: 13px !important;
  }

  .d2h-diff-tbody {
    overflow: auto !important;
  }
</style>
