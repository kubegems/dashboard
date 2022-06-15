<template>
  <BaseFullScreenDialog v-model="dialog" :is-appstore="true" :title="title" @dispose="dispose">
    <template #content>
      <v-flex :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <AppInfo
              :app-name="currentApp.name"
              :class="`zoom-${Scale.toString().replaceAll('.', '-')}`"
              :current-app="currentApp"
              :readonly="true"
              :select-repo="selectRepo"
              :select-version="selectVersion"
              :show-version="false"
              :versions="versions"
            />
          </v-col>
          <v-flex class="py-2">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <DeployWizard
              ref="deployWizard"
              class="deploy-wizard-overflow-y"
              :current-app="currentApp"
              :files="files"
              :select-repo="selectRepo"
              :style="`height: ${wizardHeight}px;`"
              :versions="versions"
              v-on="$listeners"
            />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import AppInfo from './AppInfo';

  import BaseSelect from '@/mixins/select';

  export default {
    name: 'Deploy',
    // 异步导入防止递归循环导入
    components: {
      AppInfo,
      DeployWizard: () => import('./DeployWizard'),
    },
    mixins: [BaseSelect],
    props: {
      currentApp: {
        type: Object,
        default: () => {},
      },
      files: {
        type: Object,
        default: () => {},
      },
      selectRepo: {
        type: String,
        default: () => '',
      },
      selectVersion: {
        type: String,
        default: () => '',
      },
      versions: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      dialog: false,
      title: '应用商店',
    }),
    computed: {
      ...mapState(['Scale']),
      wizardHeight() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
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
