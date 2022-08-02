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
        <v-list-item-title class="text-subtitle-2"> 名称 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? item.name : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 地址 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? getRegistryMeta(item).address : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 模型数 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $route.query.modelCount || 0 }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 更新时间 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? $moment(item.updationTime).format('lll') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 同步状态 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          <template v-if="syncStatus.status === 'SUCCESS'">
            <v-icon color="success" small>mdi-check-circle</v-icon>
            同步成功
          </template>
          <template v-else-if="syncStatus.status === 'FAILURE'">
            <v-icon color="error" small>mdi-close-circle</v-icon>
            同步失败
          </template>
          <template v-else-if="syncStatus.status === 'STOP'">
            <v-icon color="grey" small>mdi-alert-circle</v-icon>
            暂无同步
          </template>
          <template v-else-if="['INITIALIZE', 'PROGRESS', 'STARTED'].indexOf(syncStatus.status) > -1">
            <v-icon class="kubegems__waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
            正在同步: {{ syncStatus.progress }}
          </template>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
  import { getAdminModelStoreSync } from '@/api';

  export default {
    name: 'BasicResourceInfo',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        syncStatus: {},
        timeinterval: null,
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.loadSyncStatus();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      this.clearInterval();
    },
    methods: {
      async loadSyncStatus() {
        this.clearInterval();

        const statusData = await getAdminModelStoreSync(this.item.name, { noprocessing: true });
        this.syncStatus = statusData;

        this.timeinterval = setInterval(async () => {
          const statusData = await getAdminModelStoreSync(this.item.name, { noprocessing: true });
          this.syncStatus = statusData;
        }, 1000 * 10);
      },
      clearInterval() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
      getRegistryMeta(item) {
        switch (item.name) {
          case 'huggingface':
            return {
              imgSrc: '/icon/hugging-face.svg',
              tip: '全球大型开源社区,专注于NLP技术。',
              address: 'https://huggingface.co/',
            };
          case 'openmmlab':
            return {
              imgSrc: '/icon/openmmlab.svg',
              tip: '深度学习时代最完整的计算机视觉开源算法体系。',
              address: 'https://openmmlab.com/',
            };
          case 'tensorflow':
            return {
              imgSrc: '/icon/tensorflow.svg',
              tip: '一个核心开源库，可以帮助您开发和训练机器学习模型。',
              address: 'https://www.tensorflow.org/',
            };
          case 'pytorch':
            return {
              imgSrc: '/icon/pytorch.svg',
              tip: '发现模型并将其发布到专为研究探索而设计的预训练模型存储库。',
              address: 'https://pytorch.org/',
            };
          case 'paddlepaddle':
            return {
              imgSrc: '/icon/paddlepaddle.svg',
              tip: '源于产业实践的开源深度学习平台。',
              address: 'https://www.paddlepaddle.org.cn/',
            };
          default:
            return {
              imgSrc: this.$LOGO_BLUE,
              tip: 'Kubegems内置算法模型商店。',
              address: '',
            };
        }
      },
    },
  };
</script>
