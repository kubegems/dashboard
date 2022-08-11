<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

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
                  {{
                    $root.$t('operate.sync_c', [
                      item.SyncStatus === 'success' ? $root.$t('status.success') : $root.$t('status.failure'),
                    ])
                  }}
                  :{{ $moment(item.LastSync).format('lll') }}
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc">
                  <span class="font-weight-medium primary--text"> {{ item.ChartRepoName }} </span>
                  {{ item.tip }}
                </div>
                <div class="mr-4 float-right">
                  <v-btn color="primary" text @click="syncRepository(item)">{{ $root.$t('operate.sync') }}</v-btn>
                  <v-btn color="primary" text @click="updateRepository(item)">{{ $root.$t('operate.edit') }}</v-btn>
                  <v-btn color="error" text @click="removeRepository(item)">{{ $root.$t('operate.delete') }}</v-btn>
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
                  {{ $root.$t('operate.add_c', [$root.$t('header.app_store')]) }}
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
  import messages from './i18n';
  import { deleteRepository, getRepositoryList, postSyncRepository } from '@/api';

  export default {
    name: 'RepositoryList',
    i18n: {
      messages: messages,
    },
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
        this.$refs.repositoryInfo.setTitle(this.$root.$t('operate.add_c', [this.$root.$t('header.app_store')]));
        this.$refs.repositoryInfo.open();
      },
      updateRepository(item) {
        this.$refs.repositoryInfo.setTitle(this.$root.$t('operate.update_c', [this.$root.$t('header.app_store')]));
        this.$refs.repositoryInfo.init(item);
        this.$refs.repositoryInfo.open();
      },
      removeRepository(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('tip.registry')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('tip.registry')])} ${item.ChartRepoName}`,
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
          title: this.$root.$t('operate.sync_c', [this.$t('tip.registry')]),
          content: {
            text: `${this.$root.$t('operate.sync_c', [this.$t('tip.registry')])} ${item.ChartRepoName}`,
            type: 'confirm',
          },
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
              tip: this.$t('tip.bitnami'),
            };
          case 'chartmuseum':
            return {
              imgSrc: '/icon/chartmuseum.svg',
              tip: this.$t('tip.chartmuseum'),
            };
          default:
            return {
              imgSrc: this.$LOGO_BLUE,
              tip: this.$t('tip.kubegems'),
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
      width: 950px;
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
