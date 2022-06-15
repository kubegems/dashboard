<template>
  <BasePanel v-model="panel" icon="fas fa-code" title="YAML" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3">
        {{ item ? item.metadata.name : '' }}
      </span>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <ACEEditor
          v-model="kubeyaml"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          :style="`height: ${height}px !important`"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'ResourceYaml',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      panel: false,
      kubeyaml: '',
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
    },
    watch: {
      item: {
        handler: function (value) {
          if (value) {
            this.kubeyaml = this.$yamldump(this.item);
          }
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      dispose() {},
    },
  };
</script>
