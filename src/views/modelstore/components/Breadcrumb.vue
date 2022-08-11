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
              <img height="32" :src="imgSrc" />
            </div>
            <v-icon v-if="tip !== undefined" class="breadcrumb__bg mr-1" right small> mdi-help-rhombus </v-icon>
            <div v-if="tip !== undefined" class="text-overline breadcrumb__bg breadcrumb__tip font-weight-regular">
              {{ tip }}
            </div>
            <div v-if="status" class="breadcrumb__status">
              <template v-if="status.status === 'SUCCESS'">
                <v-icon class="mr-1" color="success" small>mdi-check-circle</v-icon>
                已同步
              </template>
              <template v-else-if="['INITIALIZE', 'PROGRESS', 'STARTED'].indexOf(status.status) > -1">
                <v-icon class="mr-1 kubegems__waiting-circle-flashing" color="warning"> mdi-autorenew </v-icon>
                正在同步
                {{ status.progress }}
              </template>
              <template v-else-if="status.status === 'FAILURE'">
                <v-icon class="mr-1" color="error" small> mdi-close-circle </v-icon>
                同步失败
              </template>
              <template v-else-if="status.status === 'STOP'">
                <v-icon class="mr-1" color="grey" small> mdi-alert-circle </v-icon>
                暂未同步
              </template>
              {{ status.finishedAt ? $moment(status.finishedAt).format('lll') : '' }}
            </div>
            <slot name="extend" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-flex>
</template>

<script>
  import messages from '../i18n';
  import { getModelSourceDetail } from '@/api';

  export default {
    name: 'Breadcrumb',
    i18n: {
      messages: messages,
    },
    props: {
      hub: {
        type: String,
        default: () => 'kubegems-hub',
      },
      syncStatus: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        imgSrc: '',
        tip: '',
        status: null,
        timeinterval: null,
      };
    },
    watch: {
      hub: {
        handler(newValue) {
          switch (newValue) {
            case 'huggingface':
              this.imgSrc = '/icon/hugging-face.svg';
              this.tip = this.$t('tip.huggingface');
              break;
            case 'openmmlab':
              this.imgSrc = '/icon/openmmlab.svg';
              this.tip = this.$t('tip.openmmlab');
              break;
            case 'tensorflow':
              this.imgSrc = '/icon/tensorflow.svg';
              this.tip = this.$t('tip.tensorflow');
              break;
            case 'kubegems-charts':
              this.imgSrc = this.$LOGO_BLUE;
              this.tip = this.$t('tip.kubegems_chart');
              break;
            case 'bitnami':
              this.imgSrc = '/icon/bitnami.svg';
              this.tip = this.$t('tip.bitnami');
              break;
            case 'chartmuseum':
              this.imgSrc = '/icon/chartmuseum-b.svg';
              this.tip = this.$t('tip.chartmuseum');
              break;
            case 'pytorch':
              this.imgSrc = '/icon/pytorch.svg';
              this.tip = this.$t('tip.pytorch');
              break;
            case 'paddlepaddle':
              this.imgSrc = '/icon/paddlepaddle.svg';
              this.tip = this.$t('tip.paddlepaddle');
              break;
            default:
              this.imgSrc = this.$LOGO_BLUE;
              this.tip = this.$t('tip.kubegems');
              break;
          }
          if (this.syncStatus && newValue) {
            this.loadRegistryStatus();
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
      loadRegistryStatus() {
        this.clearInterval();
        this.registryStatus();
        this.timeinterval = setInterval(() => {
          this.registryStatus();
        }, 1000 * 10);
      },
      async registryStatus() {
        const data = await getModelSourceDetail(this.$route.query.registry, { noprocessing: true, count: true });
        this.status = data.syncStatus;
        this.$emit('updateModelCount', data.modelsCount || 0);
      },
      clearInterval() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
    },
  };
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
