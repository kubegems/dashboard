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
      {{ item ? item.metadata.name : '' }}
      <template v-if="item && item.kind === 'Pod' && tke">
        <v-menu :close-delay="200" open-on-hover top>
          <template #activator="{ on }">
            <span class="mt-1 mr-2" v-on="on">
              <BaseLogo icon-name="tke" />
            </span>
          </template>
          <v-card>
            <v-card-text class="pa-2">tke </v-card-text>
          </v-card>
        </v-menu>
      </template>
      <template v-if="item && item.kind === 'Pod' && nvidia">
        <v-menu :close-delay="200" open-on-hover top>
          <template #activator="{ on }">
            <span class="mt-1 mr-2" v-on="on">
              <BaseLogo icon-name="nvidia" />
            </span>
          </template>
          <v-card>
            <v-card-text class="pa-2"> nvidia </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 集群 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? ThisCluster : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="project" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 项目 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? (item.metadata.labels ? item.metadata.labels[`gems.kubegems.io/project`] : '') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="environment" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 环境 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? (item.metadata.labels ? item.metadata.labels[`gems.kubegems.io/environment`] : '') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 创建时间 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'BasicResourceInfo',
    mixins: [BaseResource],
    props: {
      environment: {
        type: Boolean,
        default: () => true,
      },
      item: {
        type: Object,
        default: () => null,
      },
      project: {
        type: Boolean,
        default: () => true,
      },
    },
    computed: {
      tke() {
        if (this?.item?.spec?.nodeSelector) {
          return this.item.spec.nodeSelector['tencent.com/vcuda'] === 'true';
        }
        return false;
      },
      nvidia() {
        if (this?.item?.spec?.nodeSelector) {
          return this.item.spec.nodeSelector['nvidia.com/gpu'] === 'true';
        }
        return false;
      },
    },
  };
</script>
