<template>
  <BaseFullScreenDialog
    v-model="dialog"
    title="模型商店"
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
            <ModelInfo
              :model="model"
              :show-version="false"
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
              class="deploy-wizard"
              :model="model"
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
import { mapState } from 'vuex'
import ModelInfo from './ModelInfo'
import BaseSelect from '@/mixins/select'

export default {
  name: 'Deploy',
  // 异步导入防止递归循环导入
  components: { DeployWizard: () => import('./DeployWizard'), ModelInfo },
  mixins: [BaseSelect],
  props: {
    model: {
      type: Object,
      default: () => null,
    },
    versions: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    dialog: false,
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
.fixed {
  position: fixed;
}
.deploy-wizard {
  overflow-y: auto;
}
</style>
