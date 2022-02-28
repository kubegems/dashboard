<template>
  <v-dialog
    v-model="dialog"
    :max-width="500"
    persistent
    scrollable
    height="100%"
  >
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img
            src="/logo-about.svg"
            width="200"
            contain
            class="ma-2"
          />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-1 ma-4 font-weight-regular">
          KubeGems 是在Kubernetes
          之上构建的面向云原生应用的操作平台，支持多云与多集群管理，提供全栈的IT
          自动化运维能力，简化DevOps 工作流。
        </h6>

        <v-flex
          v-for="(value, key) in version"
          :key="key"
          class="mx-4"
        >
          <h6
            class="
              text-subtitle-2
              grey--text
              text--darken-1
              font-weight-regular
            "
          >
            {{ cnDict[key] }} : {{ value }}
          </h6>
        </v-flex>
      </v-card-text>
      <div class="pa-2">
        <v-btn
          small
          class="float-right"
          color="error"
          text
          @click="dialog = false"
        >
          关闭
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { getPlatformVersion } from '@/api'

export default {
  name: 'About',
  data() {
    return {
      dialog: false,
      version: {},
      cnDict: {
        version: 'UI版本',
        date: 'UI版本日期',
        GitVersion: 'Api版本',
        GitCommit: 'Commit',
        BuildDate: 'Api版本日期',
        GoVersion: 'Go版本',
        Compiler: '编译',
        Platform: '编译平台',
      },
      apiVersion: null,
    }
  },
  computed: {
    dashboardVersion() {
      return {
        version: process.env.VUE_APP_RELEASE,
        date: process.env.VUE_APP_DATE
          ? this.$moment(process.env.VUE_APP_DATE).add(8, 'hours').format('lll')
          : '',
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      await this.platformVersion()
      this.version = Object.assign(this.apiVersion, this.dashboardVersion)
      if (this.apiVersion.BuildDate) {
        this.apiVersion.BuildDate = this.$moment(
          this.apiVersion.BuildDate,
        ).format('lll')
      }
    },
    async platformVersion() {
      const data = await getPlatformVersion({ noprocessing: true })
      this.apiVersion = data
    },
  },
}
</script>

<style lang="scss" scoped>
.v-list-item--dense,
.v-list--dense .v-list-item {
  min-height: 30px;
}
</style>
