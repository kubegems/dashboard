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
      <v-col v-for="(item, index) in registryItems" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto registry__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-card-text>
              <div class="registry__title">
                <div class="mr-4 float-left">
                  <img height="40" :src="item.imgSrc" />
                </div>
                <a class="mr-4 float-left" :href="item.address" target="_blank">{{ item.address }}</a>
                <div class="mr-4 float-left">
                  <template v-if="item.status === 'SUCCESS'">
                    <v-icon color="success" small>mdi-check-circle</v-icon>
                    {{ i18nLocal.t('status.success') }}
                  </template>
                  <template v-else-if="item.status === 'FAILURE'">
                    <v-icon color="error" small>mdi-close-circle</v-icon>
                    {{ i18nLocal.t('status.failure') }}
                  </template>
                  <template v-else-if="item.status === 'STOP'">
                    <v-icon color="grey" small>mdi-alert-circle</v-icon>
                    {{ i18nLocal.t('status.no_sync') }}
                  </template>
                  <template v-else-if="['INITIALIZE', 'PROGRESS', 'STARTED'].indexOf(item.status) > -1">
                    <v-icon class="kubegems__waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
                    {{ i18nLocal.t('status.running') }} : {{ item.progress }}
                  </template>
                  {{ item.finishedAt ? moment(item.finishedAt).format('lll') : '' }}
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc">
                  <span class="font-weight-medium primary--text"> {{ item.name }} </span>
                  {{ item.tip }}
                </div>
                <div class="mr-4 float-left registry__stat text-subtitle-2">
                  {{ i18nLocal.t('tip.model_count') }} : {{ item ? item.modelsCount : 0 }}
                </div>
                <div class="mr-4 float-right">
                  <v-btn color="primary" text @click="toModelRegistryDetail(item)">{{
                    i18nLocal.t('operate.manage')
                  }}</v-btn>
                  <v-btn
                    :color="['INITIALIZE', 'PROGRESS'].indexOf(item.status) > -1 ? `error` : 'primary'"
                    text
                    @click="syncRegistry(item)"
                  >
                    {{
                      ['INITIALIZE', 'PROGRESS'].indexOf(item.status) > -1
                        ? i18nLocal.t('operate.stop_sync')
                        : i18n.t('operate.sync')
                    }}
                  </v-btn>
                  <v-btn color="primary" text @click="updateRegistry(item)">{{ i18n.t('operate.edit') }}</v-btn>
                  <v-btn :color="item.enabled ? 'error' : 'primary'" text @click="toggleActiveRegistry(item)">
                    {{ item.enabled ? i18nLocal.t('operate.forbid') : i18nLocal.t('operate.active') }}
                  </v-btn>
                  <v-btn v-if="!item.builtIn" color="error" text @click="removeRegistry(item)">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </div>
                <div class="kubegems__clear-float" />
              </div>
            </v-card-text>

            <template v-if="item.builtIn">
              <v-flex class="registry__watermarkbg" />
              <v-flex
                :class="`${
                  store.state.Locale === 'en' ? 'registry__watermark-en' : 'registry__watermark'
                } font-weight-medium`"
              >
                {{ i18nLocal.t('tip.inner') }}
              </v-flex>
            </template>
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
                  @click="addModelRegitry"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.add_c', [i18n.t('header.model_store')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ModelRegistryForm ref="modelRegitry" @refresh="getModelRegistryList" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onMounted, onUnmounted, ref } from 'vue';
  import VueI18n from 'vue-i18n';

  import ModelRegistryForm from './components/ModelRegistryForm/index.vue';
  import { useI18n } from './i18n';
  import { useRouter } from '@/composition/router';
  import { LOGO_BLUE } from '@/constants/platform';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { AIModelRegistry } from '@/types/ai_model';
  import { deepCopy } from '@/utils/helpers';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();

  const getRegistryMeta = (
    item: AIModelRegistry,
  ): { imgSrc: string; tip: VueI18n.TranslateResult; address: string } => {
    switch (item.name) {
      case 'huggingface':
        return {
          imgSrc: '/icon/hugging-face.svg',
          tip: i18nLocal.t('tip.huggingface'),
          address: 'https://huggingface.co/',
        };
      case 'openmmlab':
        return {
          imgSrc: '/icon/openmmlab.svg',
          tip: i18nLocal.t('tip.openmmlab'),
          address: 'https://openmmlab.com/',
        };
      case 'tensorflow':
        return {
          imgSrc: '/icon/tensorflow.svg',
          tip: i18nLocal.t('tip.tensorflow'),
          address: 'https://www.tensorflow.org/',
        };
      case 'pytorch':
        return {
          imgSrc: '/icon/pytorch.svg',
          tip: i18nLocal.t('tip.pytorch'),
          address: 'https://pytorch.org/',
        };
      case 'paddlepaddle':
        return {
          imgSrc: '/icon/paddlepaddle.svg',
          tip: i18nLocal.t('tip.paddlepaddle'),
          address: 'https://www.paddlepaddle.org.cn/',
        };
      case 'CloudMinds':
      case 'cloudminds':
      case 'cloudminds-modelx':
        return {
          imgSrc: '/icon/cloudminds-logo.svg',
          tip: i18nLocal.t('tip.cloudminds'),
          address: 'https://www.cloudminds.com/zh/',
        };
      default:
        return {
          imgSrc: LOGO_BLUE,
          tip: i18nLocal.t('tip.kubegems'),
          address: '',
        };
    }
  };

  const registryItems = ref<AIModelRegistry[]>([]);
  const getModelRegistryList = async (): Promise<void> => {
    let data = await new AIModelRegistry().getRegistryListByAdmin({ count: true });
    data = data.map((d) => {
      return new AIModelRegistry({
        ...d,
        ...getRegistryMeta(d),
      });
    });
    data.sort((a, b) => {
      return Number(b.builtIn) - Number(a.builtIn);
    });
    data.sort((a, b) => {
      return Date.parse(a.creationTime.toString()) - Date.parse(b.creationTime.toString());
    });
    registryItems.value = data;
    loadSyncStatus();
  };

  const modelRegitry = ref(null);
  const addModelRegitry = (): void => {
    modelRegitry.value.open();
  };

  const updateRegistry = (item: AIModelRegistry): void => {
    modelRegitry.value.init(item);
    modelRegitry.value.open();
  };

  const toModelRegistryDetail = (item: AIModelRegistry): void => {
    router.push({
      name: 'model-repository-detail',
      params: { name: item.name },
      query: { modelCount: item?.modelsCount?.toString(), framework: '', task: '', search: '', license: '' },
    });
  };

  const removeRegistry = (item: AIModelRegistry): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('header.model_store')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('header.model_store')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        await new AIModelRegistry(param.item).deleteRegistry();
        getModelRegistryList();
      },
    });
  };

  const toggleActiveRegistry = (item: AIModelRegistry): void => {
    store.commit('SET_CONFIRM', {
      title: item.enabled
        ? i18nLocal.t('operate.forbid_c', [i18n.t('header.model_store')])
        : i18nLocal.t('operate.active_c', [i18n.t('header.model_store')]),
      content: {
        text: item.enabled
          ? `${i18nLocal.t('operate.forbid_c', [i18n.t('header.model_store')])} ${item.name}`
          : `${i18nLocal.t('operate.active_c', [i18n.t('header.model_store')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        const data = deepCopy(param.item);
        data.enabled = !data.enabled;
        await new AIModelRegistry(data).updateRegistryByAdmin();
        getModelRegistryList();
      },
    });
  };

  const syncRegistry = (item: AIModelRegistry): void => {
    store.commit('SET_CONFIRM', {
      title:
        ['INITIALIZE', 'PROGRESS'].indexOf(item.status) > -1
          ? i18nLocal.t('operate.stop_sync_c', [i18n.t('header.model_store')])
          : i18n.t('operate.sync_c', [i18n.t('header.model_store')]),
      content: {
        text:
          ['INITIALIZE', 'PROGRESS'].indexOf(item.status) > -1
            ? `${i18nLocal.t('operate.stop_sync_c', [i18n.t('header.model_store')])} ${item.name}`
            : `${i18n.t('operate.sync_c', [i18n.t('header.model_store')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.status === 'running') {
          await new AIModelRegistry(param.item).deleteSyncTask();
        } else {
          await new AIModelRegistry(param.item).addSyncTask();
        }
        getModelRegistryList();
      },
    });
  };

  let interval: NodeJS.Timeout = undefined;
  const loadSyncStatus = (): void => {
    clearInterval(interval);
    registryItems.value.forEach(async (item, index) => {
      const statusData = await new AIModelRegistry({ name: item.name }).getRegistryStatusByAdmin({
        noprocessing: true,
      });
      registryItems.value[index] = { ...registryItems.value[index], ...statusData };
    });
    interval = setInterval(() => {
      registryItems.value.forEach(async (item, index) => {
        const statusData = await new AIModelRegistry({ name: item.name }).getRegistryStatusByAdmin({
          noprocessing: true,
        });
        registryItems.value[index] = { ...registryItems.value[index], ...statusData };
      });
    }, 1000 * 10);
  };

  onMounted(() => {
    getModelRegistryList();
  });

  onUnmounted(() => {
    clearInterval(interval);
  });
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

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermarkbg {
      position: absolute;
      width: 120px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 14px;
      right: -1px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__watermark-en {
      position: absolute;
      top: 15px;
      right: -3px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
