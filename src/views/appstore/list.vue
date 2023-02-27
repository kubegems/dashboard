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
      <v-col v-for="(item, index) in repositoryItems" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto" :elevation="hover ? 5 : 0" flat height="100%">
            <v-card-text>
              <div class="registry__title">
                <div class="mr-4 float-left">
                  <img height="40" :src="item.imgSrc" />
                </div>
                <a class="mr-4 float-left" :href="item.URL" target="_blank">{{ item.URL }}</a>
                <div class="mr-4 float-left">
                  <StatusTip :item="item">
                    <template #trigger>
                      <v-icon v-if="item.SyncStatus === 'success'" color="success" small> mdi-check-circle </v-icon>
                      <v-icon v-else color="error" small> mdi-minus-circle </v-icon>
                    </template>
                  </StatusTip>
                  {{
                    i18n.t('operate.sync_c', [
                      item.SyncStatus === 'success' ? i18n.t('status.success') : i18n.t('status.failure'),
                    ])
                  }}
                  :{{ moment(item.LastSync).format('lll') }}
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc">
                  <span class="font-weight-medium primary--text"> {{ item.ChartRepoName }} </span>
                  {{ item.tip }}
                </div>
                <div class="mr-4 float-right">
                  <v-btn color="primary" text @click="syncRepository(item)">{{ i18n.t('operate.sync') }}</v-btn>
                  <v-btn color="primary" text @click="updateRepository(item)">{{ i18n.t('operate.edit') }}</v-btn>
                  <v-btn color="error" text @click="removeRepository(item)">{{ i18n.t('operate.delete') }}</v-btn>
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
                  {{ i18n.t('operate.add_c', [i18n.t('header.app_store')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <RepositoryInfo ref="respository" @refresh="getRepositoryList" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onMounted, ref } from 'vue';
  import VueI18n from 'vue-i18n';

  import RepositoryInfo from './components/RepositoryInfo.vue';
  import StatusTip from './components/StatusTip.vue';
  import { useI18n } from './i18n';
  import { LOGO_BLUE } from '@/constants/platform';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { HelmRepository } from '@/types/helm';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const repositoryItems = ref<HelmRepository[]>([]);
  const getRepositoryList = async (): Promise<void> => {
    const data = await new HelmRepository().getRepositoryList();
    repositoryItems.value = data.map((item) => {
      return new HelmRepository({
        name: item.ChartRepoName,
        ...item,
        ...getRepositoryMeta(item),
      });
    });
  };

  onMounted(() => {
    getRepositoryList();
  });

  const respository = ref(null);
  const addRepository = (): void => {
    respository.value.setTitle(i18n.t('operate.add_c', [i18n.t('header.app_store')]));
    respository.value.open();
  };

  const updateRepository = (item: HelmRepository): void => {
    respository.value.setTitle(i18n.t('operate.update_c', [i18n.t('header.app_store')]));
    respository.value.init(item);
    respository.value.open();
  };

  const removeRepository = (item: HelmRepository): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('tip.registry')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('tip.registry')])} ${item.ChartRepoName}`,
        type: 'delete',
        name: item.ChartRepoName,
      },
      param: { item },
      doFunc: async (param) => {
        await new HelmRepository(param.item).deleteRepository();
        getRepositoryList();
      },
    });
  };

  const syncRepository = (item: HelmRepository): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.sync_c', [i18nLocal.t('tip.registry')]),
      content: {
        text: `${i18n.t('operate.sync_c', [i18nLocal.t('tip.registry')])} ${item.ChartRepoName}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new HelmRepository(param.item).syncRepository();
        getRepositoryList();
      },
    });
  };

  const getRepositoryMeta = (item: HelmRepository): { imgSrc: string; tip: VueI18n.TranslateResult } => {
    switch (item.ChartRepoName) {
      case 'bitnami':
        return {
          imgSrc: '/icon/bitnami.svg',
          tip: i18nLocal.t('tip.bitnami'),
        };
      case 'chartmuseum':
        return {
          imgSrc: '/icon/chartmuseum.svg',
          tip: i18nLocal.t('tip.chartmuseum'),
        };
      case 'banzaicloud':
        return {
          imgSrc: '/icon/banzaicloud-logo.svg',
          tip: i18nLocal.t('tip.banzaicloud'),
        };
      case 'hashicorp':
        return {
          imgSrc: '/icon/hashicorp-logo.svg',
          tip: i18nLocal.t('tip.hashicorp'),
        };
      case 'grafana':
        return {
          imgSrc: '/icon/grafana.svg',
          tip: i18nLocal.t('tip.grafana'),
        };
      case 'elastic':
        return {
          imgSrc: '/icon/elastic.svg',
          tip: i18nLocal.t('tip.kubegems'),
        };
      case 'opentelemetry-helm':
      case 'opentelemetry':
        return {
          imgSrc: '/icon/opentelemetry.svg',
          tip: i18nLocal.t('tip.opentelemetry'),
        };
      case 'kubecost':
        return {
          imgSrc: '/icon/kubecost.svg',
          tip: i18nLocal.t('tip.kubecost'),
        };
      case 'scylla':
      case 'scylladb':
        return {
          imgSrc: '/icon/scylla.svg',
          tip: i18nLocal.t('tip.scylla'),
        };
      default:
        return {
          imgSrc: LOGO_BLUE,
          tip: i18nLocal.t('tip.kubegems'),
        };
    }
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
