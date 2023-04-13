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
  <v-flex class="mb-3">
    <v-row class="ma-0 pa-0">
      <v-col class="pa-0" cols="1" sm="12">
        <v-card class="custom-shaodow pa-0" flat height="64">
          <v-card-text class="breadcrumb__flex">
            <div class="text-subtitle-2 kubegems__text font-weight-medium breadcrumb__font">
              <img height="32" :src="state.imgSrc" />
            </div>
            <v-icon v-if="state.tip !== undefined" class="breadcrumb__bg mr-1" right small> mdi-help-rhombus </v-icon>
            <div
              v-if="state.tip !== undefined"
              class="text-overline breadcrumb__bg breadcrumb__tip font-weight-regular"
            >
              {{ state.tip }}
            </div>
            <div v-if="state.status" class="breadcrumb__status">
              <template v-if="state.status.status === 'SUCCESS'">
                <v-icon class="mr-1" color="success" small>mdi-check-circle</v-icon>
                {{ i18nLocal.t('status.synced') }}
              </template>
              <template v-else-if="['INITIALIZE', 'PROGRESS', 'STARTED'].indexOf(state.status.status) > -1">
                <v-icon class="mr-1 kubegems__waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
                {{ i18nLocal.t('status.running') }}
                {{ state.status.progress }}
              </template>
              <template v-else-if="state.status.status === 'FAILURE'">
                <v-icon class="mr-1" color="error" small> mdi-close-circle </v-icon>
                {{ i18nLocal.t('status.failure') }}
              </template>
              <template v-else-if="state.status.status === 'STOP'">
                <v-icon class="mr-1" color="grey" small> mdi-alert-circle </v-icon>
                {{ i18nLocal.t('status.no_sync') }}
              </template>
              {{ state.status.finishedAt ? moment(state.status.finishedAt).format('lll') : '' }}
            </div>
            <slot name="extend" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-flex>
</template>

<script lang="ts" setup>
  import { AIModelRegistry } from '@kubegems/api/typed/ai_model';
  import { useQuery } from '@kubegems/extension/router';
  import { LOGO_BLUE } from '@kubegems/libs/constants/platform';
  import moment from 'moment';
  import { onUnmounted, reactive, watch } from 'vue';

  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      syncStatus?: boolean;
    }>(),
    {
      syncStatus: false,
    },
  );

  const i18nLocal = useI18n();
  const query = useQuery();

  const state = reactive({
    imgSrc: '',
    tip: '',
    status: null,
    timeinterval: null,
  });

  const loadRegistryStatus = (): void => {
    clearVal();
    getRegistryStatus();
    state.timeinterval = setInterval(() => {
      getRegistryStatus();
    }, 1000 * 10);
  };

  const emit = defineEmits(['updateModelCount', 'setOnline']);
  const getRegistryStatus = async (): Promise<void> => {
    const data = await new AIModelRegistry({ name: query.value.registry }).getRegistry({
      noprocessing: true,
      count: true,
    });
    state.status = data.syncStatus;
    emit('updateModelCount', data.modelsCount || 0);
    emit('setOnline', data.online);
  };

  const clearVal = (): void => {
    if (state.timeinterval) clearInterval(state.timeinterval);
  };

  watch(
    () => query.value.registry,
    async (newValue) => {
      switch (newValue) {
        case 'huggingface':
          state.imgSrc = '/icon/hugging-face.svg';
          state.tip = i18nLocal.t('tip.huggingface').toString();
          break;
        case 'openmmlab':
          state.imgSrc = '/icon/openmmlab.svg';
          state.tip = i18nLocal.t('tip.openmmlab').toString();
          break;
        case 'tensorflow':
          state.imgSrc = '/icon/tensorflow.svg';
          state.tip = i18nLocal.t('tip.tensorflow').toString();
          break;
        case 'kubegems-charts':
          state.imgSrc = LOGO_BLUE;
          state.tip = i18nLocal.t('tip.kubegems_chart').toString();
          break;
        case 'bitnami':
          state.imgSrc = '/icon/bitnami.svg';
          state.tip = i18nLocal.t('tip.bitnami').toString();
          break;
        case 'chartmuseum':
          state.imgSrc = '/icon/chartmuseum-b.svg';
          state.tip = i18nLocal.t('tip.chartmuseum').toString();
          break;
        case 'pytorch':
          state.imgSrc = '/icon/pytorch.svg';
          state.tip = i18nLocal.t('tip.pytorch').toString();
          break;
        case 'paddlepaddle':
          state.imgSrc = '/icon/paddlepaddle.svg';
          state.tip = i18nLocal.t('tip.paddlepaddle').toString();
          break;
        case 'banzaicloud':
          state.imgSrc = '/icon/banzaicloud-logo.svg';
          state.tip = i18nLocal.t('tip.banzaicloud').toString();
          break;
        case 'hashicorp':
          state.imgSrc = '/icon/hashicorp-logo.svg';
          state.tip = i18nLocal.t('tip.hashicorp').toString();
          break;
        case 'cloudminds':
        case 'CloudMinds':
        case 'cloudminds-modelx':
          state.imgSrc = '/icon/cloudminds-logo.svg';
          state.tip = i18nLocal.t('tip.cloudminds').toString();
          break;
        default:
          state.imgSrc = LOGO_BLUE;
          state.tip = i18nLocal.t('tip.kubegems').toString();
          break;
      }
      if (props.syncStatus && newValue) {
        loadRegistryStatus();
      }
    },
    { immediate: true, deep: true },
  );

  onUnmounted(() => {
    clearVal();
  });
</script>

<style lang="scss" scoped>
  .breadcrumb {
    &__flex {
      display: flex;
    }

    &__font {
      line-height: 1rem !important;

      @media (max-width: 1000px) {
        min-width: 75px;
      }
    }

    &__bg {
      color: rgba(0, 0, 0, 0.6);
      text-transform: capitalize !important;
    }

    &__tip {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 1000px) {
        width: 600px;
      }
    }

    &__status {
      line-height: 32px;
    }
  }
</style>
