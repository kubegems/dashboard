<template>
  <BaseFullScreenDialog v-model="dialog" :is-appstore="true" :title="title" @dispose="dispose">
    <template #content>
      <v-flex :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <ModelInfo />
          </v-col>
          <v-flex class="py-2">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9" />
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ModelInfo from './ModelInfo';

  export default {
    name: 'Deploy',
    components: {
      ModelInfo,
      // DeployWizard: () => import('./DeployWizard'),
    },
    data: () => ({
      dialog: false,
      title: '模型商店',
    }),
    computed: {
      ...mapState(['Scale']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        this.$refs.deployWizard.setData({
          selectVersion: this.selectVersion,
          app: this.currentApp.name,
        });
        await this.$refs.deployWizard.parseFiles();
      },
      dispose() {
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
