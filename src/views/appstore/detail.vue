<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template v-if="Object.keys(item.files).length > 0" #extend>
        <v-flex class="kubegems__full-right">
          <v-btn text small class="primary--text" @click="deployAppStore">
            <v-icon left small> mdi-rocket </v-icon>
            部署
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col cols="3" class="pt-0">
        <AppInfo
          :current-app="currentApp"
          :versions="versions"
          :select-version="selectVersion"
          :readonly="false"
          :show-version="true"
          :app-name="appName"
          :select-repo="selectRepo"
          @changeAppVersion="changeAppVersion"
        />
      </v-col>
      <v-col cols="9" class="pt-0">
        <v-card>
          <v-card-text>
            <v-tabs v-model="tab" height="40" class="pb-3">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
            <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :item="item" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <Deploy
      ref="deploy"
      :current-app="currentApp"
      :files="item.files"
      :versions="versions"
      :select-version="selectVersion"
      :select-repo="selectRepo"
      @changeAppVersion="changeAppVersion"
    />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';
  import { getAppStoreDetail, getAppStoreFiles } from '@/api';
  import Deploy from './components/Deploy';
  import Markdown from './components/Markdown';
  import AppInfo from './components/AppInfo';
  import AppDetail from './components/AppDetail';
  import ConfigFile from './components/ConfigFile';

  import { Base64 } from 'js-base64';

  export default {
    name: 'AppStoreDetail',
    components: {
      Markdown,
      Deploy,
      AppInfo,
      AppDetail,
      ConfigFile,
    },
    data: () => ({
      allApps: [],
      currentApp: {},
      versions: [],
      selectVersion: null,
      appName: '',
      selectRepo: '',
      tab: 0,
      tabItems: [
        { text: '应用详情', value: 'AppDetail' },
        { text: '配置文件', value: 'ConfigFile' },
      ],
      item: { files: {} },
    }),
    computed: {
      ...mapState(['Scale']),
      reponame() {
        return this.selectRepo === 'kubegems' ? '' : this.selectRepo;
      },
    },
    mounted() {
      this.appName = this.$route.params.name;
      this.selectRepo = this.$route.query.reponame;
      this.appStoreDetail();
    },
    methods: {
      async appStoreDetail() {
        const res = await getAppStoreDetail(this.appName, {
          reponame: this.reponame,
          noprocessing: true,
        });
        if (res) {
          this.allApps = res;
          for (const k in res) {
            this.versions.push(res[k].version);
          }
          this.selectVersion = this.versions[0];
          this.currentApp = this.allApps[0];
          await this.appStoreFiles();
        }
      },
      changeAppVersion(version) {
        this.selectVersion = version;
        for (const k in this.allApps) {
          if (this.allApps[k].version === this.selectVersion) {
            this.currentApp = this.allApps[k];
          }
        }
        this.appStoreFiles();
      },
      async appStoreFiles() {
        const res = await getAppStoreFiles({
          name: this.appName,
          version: this.selectVersion,
          reponame: this.reponame,
        });
        const files = res.files || {};
        Object.keys(files).forEach((name) => {
          files[name] = Base64.decode(files[name]);
        });
        this.item = { ...res, files }; // 使用解码后的文件
      },
      async deployAppStore() {
        this.$refs.deploy.init();
        this.$refs.deploy.open();
      },
    },
  };
</script>
