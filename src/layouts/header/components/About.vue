<template>
  <v-dialog v-model="dialog" height="100%" :max-width="500" persistent scrollable>
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img class="ma-2" contain :src="logo" width="200" />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-2 ma-4 font-weight-medium">
          {{ $DESCRIPTION }}
        </h6>

        <v-flex v-for="(value, key) in version" :key="key" class="mx-4">
          <h6 class="text-body-2 grey--text text--darken-1 font-weight-regular"> {{ cnDict[key] }} : {{ value }} </h6>
        </v-flex>
      </v-card-text>
      <div class="pa-2">
        <v-btn class="float-right" color="error" small text @click="dialog = false"> 关闭 </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { getPlatformVersion } from '@/api';

  export default {
    name: 'About',
    data() {
      return {
        dialog: false,
        version: {},
        cnDict: {
          version: 'Dashboard版本',
          date: 'Dashboard版本日期',
          GitVersion: 'Api版本',
          GitCommit: 'Commit',
          BuildDate: 'Api版本日期',
          GoVersion: 'Go版本',
          Compiler: '编译',
          Platform: '编译平台',
        },
        apiVersion: null,
        logo: this.$LOGO_BULE,
      };
    },
    computed: {
      dashboardVersion() {
        return {
          version: process.env.VUE_APP_RELEASE,
          date: process.env.VUE_APP_DATE ? this.$moment(process.env.VUE_APP_DATE).format('lll') : '',
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        await this.platformVersion();
        this.version = Object.assign(this.apiVersion, this.dashboardVersion);
        if (this.apiVersion.BuildDate) {
          this.apiVersion.BuildDate = this.$moment(this.apiVersion.BuildDate).format('lll');
        }
      },
      async platformVersion() {
        const data = await getPlatformVersion({ noprocessing: true });
        this.apiVersion = data;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item--dense,
  .v-list--dense .v-list-item {
    min-height: 30px;
  }
</style>
