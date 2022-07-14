<template>
  <BaseFullScreenDialog v-model="dialog" kubegems-logo :title="title" @dispose="dispose">
    <template #content>
      <v-flex>
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <ModelInfo :item="item" no-version />
          </v-col>
          <v-flex class="py-2" :style="{ height: `${height}px` }">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <DeployWizard ref="deployWizard" :item="item" @dispose="dispose" />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import DeployWizard from './DeployWizard';
  import ModelInfo from './ModelInfo';

  export default {
    name: 'Deploy',
    components: {
      DeployWizard,
      ModelInfo,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      title: '算法商店',
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return (window.innerHeight - 64) / this.Scale;
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {},
      dispose() {
        this.dialog = false;
        this.$refs.deployWizard.reset();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .deploy-wizard-overflow-y {
    overflow-y: auto;
  }
</style>
