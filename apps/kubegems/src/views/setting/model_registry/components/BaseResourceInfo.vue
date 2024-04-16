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
  <v-card flat>
    <v-card-title class="text-h6 primary--text">
      <div>
        <img v-if="item" height="40" :src="getRegistryMeta(item).imgSrc" />
      </div>
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.name') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? item.name : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.address') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? getRegistryMeta(item).address : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.model_count') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ query.modelCount || 0 }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.update_at') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? moment(item.updationTime).format('lll') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.status') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          <template v-if="syncStatus && syncStatus.status === 'SUCCESS'">
            <v-icon color="success" small>mdi-check-circle</v-icon>
            {{ i18nLocal.t('status.success') }}
          </template>
          <template v-else-if="syncStatus && syncStatus.status === 'FAILURE'">
            <v-icon color="error" small>mdi-close-circle</v-icon>
            {{ i18nLocal.t('status.failure') }}
          </template>
          <template v-else-if="syncStatus && syncStatus.status === 'STOP'">
            <v-icon color="grey" small>mdi-alert-circle</v-icon>
            {{ i18nLocal.t('status.no_sync') }}
          </template>
          <template v-else-if="['INITIALIZE', 'PROGRESS', 'STARTED'].indexOf(syncStatus ? syncStatus.status : '') > -1">
            <v-icon class="kubegems__waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
            {{ i18nLocal.t('status.running') }} : {{ syncStatus ? syncStatus.progress : '' }}
          </template>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script lang="ts" setup>
  import { AIModelRegistry } from '@kubegems/api/typed/ai_model';
  import { useQuery } from '@kubegems/extension/router';
  import config from '@kubegems/libs/constants/global';
  import moment from 'moment';
  import { onUnmounted, ref, watch } from 'vue';
  import VueI18n from 'vue-i18n';

  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      item?: AIModelRegistry;
    }>(),
    {
      item: undefined,
    },
  );

  const i18nLocal = useI18n();
  const query = useQuery();

  const getRegistryMeta = (item): { imgSrc: string; tip: VueI18n.TranslateResult; address: string } => {
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
          imgSrc: config.layout.LOGO_PRIMARY,
          tip: i18nLocal.t('tip.kubegems'),
          address: '',
        };
    }
  };

  let interval: NodeJS.Timeout;
  onUnmounted(() => {
    clearInterval(interval);
  });
  const syncStatus = ref<{ finishedAt: Date; progress: string; startedAt: Date; status: string }>(undefined);
  const loadSyncStatus = async (): Promise<void> => {
    clearInterval(interval);
    const statusData = await new AIModelRegistry({ name: props.item.name }).getRegistryStatusByAdmin({
      noprocessing: true,
    });
    syncStatus.value = statusData;
    interval = setInterval(async () => {
      const statusData = await new AIModelRegistry({ name: props.item.name }).getRegistryStatusByAdmin({
        noprocessing: true,
      });
      syncStatus.value = statusData;
    }, 1000 * 10);
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      loadSyncStatus();
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
