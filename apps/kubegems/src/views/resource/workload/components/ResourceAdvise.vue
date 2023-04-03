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
  <div v-if="adviseItem">
    <BaseTipWindow icon="mdi-feather" :title="$t('tip.resource_suggest')" :top="top">
      <template #header>
        <v-icon :color="getCondition(adviseItem).color" small @click="scaleResourceLimit">
          {{ getCondition(adviseItem).icon }}
        </v-icon>
        <span
          :class="`text-caption ${
            getCondition(adviseItem).color
          }--text font-weight-medium kubegems__pointer kubegems__attach-position`"
        >
          {{ getCondition(adviseItem).text }}
        </span>
      </template>
      <template #content>
        <v-list-item v-for="(container, containerName, index) in adviseItem.Conditions" :key="containerName">
          <v-list-item-content>
            <v-list-item-title>
              {{ $root.$t('resource.container') }}
              <v-btn v-if="index == 0" absolute color="warning" right text x-small @click="clearAdvise">
                {{ $t('tip.ignore') }}
              </v-btn>
            </v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text">
              {{ containerName }}
            </v-list-item-content>
            <template v-if="container.CPUStatus !== null">
              <v-list-item-title>{{ $root.$t('resource.cpu') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ showAdvise(container.CPUStatus, $root.$t('resource.cpu')) }}
              </v-list-item-content>
            </template>
            <template v-if="container.MemoryStatus !== null">
              <v-list-item-title>{{ $root.$t('resource.memory') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ showAdvise(container.MemoryStatus, $root.$t('resource.memory')) }}
              </v-list-item-content>
            </template>
            <v-list-item-title>Pods({{ $t('tip.advice_2_scale') }})</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text my-0">
              <v-flex v-for="(pod, podIndex) in container.Pods" :key="podIndex" class="text-caption kubegems__text">
                {{ pod }}
              </v-flex>
            </v-list-item-content>
          </v-list-item-content>
        </v-list-item>
      </template>
    </BaseTipWindow>
  </div>
</template>

<script>
  import messages from '../i18n';
  import { deleteWorkloadResourceAdvise } from '@/api';

  export default {
    name: 'ResourceAdvise',
    i18n: {
      messages: messages,
    },
    props: {
      adviseItem: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
      top: {
        type: Boolean,
        default: () => false,
      },
    },
    methods: {
      getCondition(item) {
        if (
          item?.Conditions?.reviews?.CPUStatus?.Status === 'low' &&
          item?.Conditions?.reviews?.MemoryStatus?.Status === 'low'
        ) {
          return { color: 'success', text: this.$t('tip.advice_shrink'), icon: 'mdi-download' };
        } else if (
          item?.Conditions?.reviews?.CPUStatus?.Status === 'high' &&
          item?.Conditions?.reviews?.MemoryStatus?.Status === 'high'
        ) {
          return { color: 'warning', text: this.$t('tip.advice_expansion'), icon: 'mdi-upload' };
        } else if (item?.Conditions?.reviews?.CPUStatus?.Status === 'low' && !item?.Conditions?.reviews?.MemoryStatus) {
          return { color: 'warning', text: this.$t('tip.advice_cpu_shrink'), icon: 'mdi-download' };
        } else if (
          item?.Conditions?.reviews?.CPUStatus?.Status === 'high' &&
          !item?.Conditions?.reviews?.MemoryStatus
        ) {
          return { color: 'warning', text: this.$t('tip.advice_cpu_expansion'), icon: 'mdi-upload' };
        } else if (item?.Conditions?.reviews?.MemoryStatus?.Status === 'low' && !item?.Conditions?.reviews?.CPUStatus) {
          return { color: 'warning', text: this.$t('tip.advice_memory_shrink'), icon: 'mdi-download' };
        } else if (
          item?.Conditions?.reviews?.MemoryStatus?.Status === 'high' &&
          !item?.Conditions?.reviews?.CPUStatus
        ) {
          return { color: 'warning', text: this.$t('tip.advice_memory_expansion'), icon: 'mdi-upload' };
        }
        return { color: 'warning', text: this.$t('tip.resource_suggest'), icon: 'mdi-clipboard-alert' };
      },
      showAdvise(advise, prefex) {
        let showStr = '';
        switch (advise.Status) {
          case 'low':
            showStr = this.$t('tip.low_suggest', [
              prefex,
              (advise.CurrentRate * 100).toFixed(2),
              advise.CurrentLimit,
              advise.SuggestLimit,
            ]);
            advise.Action = 'scaleDown';

            break;
          case 'high':
            showStr = this.$t('tip.high_suggest', [
              prefex,
              (advise.CurrentRate * 100).toFixed(2),
              advise.CurrentLimit,
              advise.SuggestLimit,
            ]);
            advise.Action = 'scaleUp';
            break;
          case 'very_high':
            showStr = this.$t('tip.veryhigh_suggest', [
              prefex,
              (advise.CurrentRate * 100).toFixed(2),
              advise.CurrentLimit,
              advise.SuggestLimit,
            ]);
            advise.Action = 'scaleUp';
            break;
        }
        advise.Suggestion = showStr;
        return showStr;
      },
      scaleResourceLimit() {
        this.$emit('scaleResourceLimit', this.item, this.kind, this.adviseItem);
      },
      async clearAdvise() {
        await deleteWorkloadResourceAdvise(this.adviseItem.ID);
        this.$emit('clearAdvise', this.adviseItem);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item__content {
    word-break: break-all;
  }
</style>
