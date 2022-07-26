<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto" :elevation="hover ? 5 : 0" flat height="100%">
            <v-card-text>
              <div class="registry__title">
                <div class="mr-4 float-left">
                  <img height="40" :src="item.imgSrc" />
                </div>
                <a class="mr-4 float-left" :href="item.address" target="_blank">{{ item.URL }}</a>
                <div class="mr-4 float-left">
                  <StatusTip :item="item">
                    <template #trigger>
                      <v-icon v-if="item.SyncStatus === 'success'" color="success" small> mdi-check-circle </v-icon>
                      <v-icon v-else color="error" small> mdi-minus-circle </v-icon>
                    </template>
                  </StatusTip>
                  同步{{ item.SyncStatus === 'success' ? '成功' : '失败' }}:{{ $moment(item.LastSync).format('lll') }}
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc"> {{ item.tip }} </div>
                <div class="mr-4 float-right">
                  <v-btn color="primary" text @click="syncRepository(item)">同步</v-btn>
                  <v-btn color="primary" text @click="updateRepository(item)">编辑</v-btn>
                  <v-btn color="error" text @click="removeRepository(item)">删除</v-btn>
                </div>
                <div class="kubegems__clear-float" />
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>

      <v-col class="pt-0 pb-3" cols="12">
        <v-card class="kubegems__full-height" flat min-height="123">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn
                  class="text-h6 kubegems__full-center"
                  color="primary"
                  max-width="200"
                  text
                  @click="addRepository"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  添加应用商店
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <RepositoryInfo ref="repositoryInfo" @refresh="repositoryList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RepositoryInfo from './components/RepositoryInfo';
  import StatusTip from './components/StatusTip';
  import { deleteRepository, getRepositoryList, postSyncRepository } from '@/api';

  export default {
    name: 'RepositoryList',
    components: {
      RepositoryInfo,
      StatusTip,
    },
    data: () => ({
      items: [],
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      if (this.JWT) {
        this.repositoryList();
      }
    },
    methods: {
      async repositoryList() {
        const data = await getRepositoryList(this.params);
        this.items = data.map((item) => {
          return {
            name: item.ChartRepoName,
            ...item,
            ...this.getRepositoryMeta(item.ChartRepoName),
          };
        });
      },
      addRepository() {
        this.$refs.repositoryInfo.setTitle('添加应用商店');
        this.$refs.repositoryInfo.open();
      },
      updateRepository(item) {
        this.$refs.repositoryInfo.setTitle('更新应用商店');
        this.$refs.repositoryInfo.init(item);
        this.$refs.repositoryInfo.open();
      },
      removeRepository(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除仓库`,
          content: {
            text: `删除仓库 ${item.ChartRepoName}`,
            type: 'delete',
            name: item.ChartRepoName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteRepository(param.item.ChartRepoName);
            this.repositoryList();
          },
        });
      },
      syncRepository(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `同步仓库`,
          content: { text: `同步仓库 ${item.ChartRepoName}`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await postSyncRepository(param.item.ChartRepoName);
            this.repositoryList();
          },
        });
      },
      getRepositoryMeta(item) {
        switch (item.name) {
          case 'bitnami':
            return {
              imgSrc: '/icon/bitnami.svg',
              tip: 'Bitnami 让您可以轻松地在任何平台上启动和运行您最喜欢的开源软件，包括您的笔记本电脑、Kubernetes 和所有主要云。',
            };
          case 'chartmuseum':
            return {
              imgSrc: '/icon/chartmuseum.svg',
              tip: 'ChartMuseum 是一个开源的、易于部署的、Helm Chart 存储库服务器。',
            };
          default:
            return {
              imgSrc: this.$LOGO_BLUE,
              tip: '一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等。',
            };
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .registry {
    &__title {
      line-height: 40px;
    }

    &__desc {
      width: 900px;
    }

    &__stat {
      width: 100px;
    }

    &__action,
    &__action div {
      line-height: 34px;
    }
  }
</style>
