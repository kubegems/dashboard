<template>
  <BaseFullScreenDialog
    v-model="dialog"
    :title="title"
    :is-appstore="true"
    @dispose="dispose"
  >
    <template #content>
      <v-flex :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row class="mt-0 ma-0">
          <v-col
            cols="3"
            class="px-6 pa-0"
          >
            <AppInfo
              :current-app="currentApp"
              :versions="versions"
              :select-version="selectVersion"
              :readonly="true"
              :show-version="false"
              :class="`zoom-${Scale.toString().replaceAll('.', '-')}`"
              :app-name="currentApp.name"
              :select-repo="selectRepo"
            />
          </v-col>
          <v-flex class="py-2">
            <v-divider vertical />
          </v-flex>
          <v-col
            cols="9"
            class="pa-0"
          >
            <DeployWizard
              ref="deployWizard"
              class="deploy-wizard-overflow-y"
              :files="files"
              :current-app="currentApp"
              :versions="versions"
              :style="`height: ${wizardHeight}px;`"
              :select-repo="selectRepo"
              v-on="$listeners"
            />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import AppInfo from './AppInfo'
import BaseSelect from '@/mixins/select'

export default {
  name: 'Deploy',
  // 异步导入防止递归循环导入
  components: { DeployWizard: () => import('./DeployWizard'), AppInfo },
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
    versions: {
      type: Array,
      default: () => [],
    },
    selectVersion: {
      type: String,
      default: () => '',
    },
    selectRepo: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    dialog: false,
    title: '应用商店',
  }),
  computed: {
    ...mapState(['Scale']),
    wizardHeight() {
      return window.innerHeight - 64 * this.Scale - 1
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      this.$refs.deployWizard.obj.selectVersion = this.selectVersion
      this.$refs.deployWizard.obj.app = this.currentApp.name
      await this.$refs.deployWizard.parseFiles()
    },
    dispose() {
      this.$refs.deployWizard.reset()
    },
  },
}
</script>

<style lang="scss" scoped>
.deploy-wizard-overflow-y {
  overflow-y: auto;
}
</style>
