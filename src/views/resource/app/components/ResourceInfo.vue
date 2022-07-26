<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-card>
    <v-card-title v-if="$route.query.kind === 'modelstore'" class="text-h6 primary--text">
      {{ item ? item.metadata.name : '' }}
    </v-card-title>
    <v-card-title v-else class="text-h6 primary--text">
      {{ item ? item.name : '' }}
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 项目 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $route.params.project }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="ThisAppEnvironmentID" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 环境 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $route.params.environment }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <template v-if="$route.query.kind === 'modelstore'">
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 模型名称 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.name : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 模型版本 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.version : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 模型源 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.source : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 框架 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.framework : '' }}
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
    </template>
    <template v-else>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 服务类型 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.kind : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 创建人 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.runtime.creator : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> 创建时间 </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item && item.runtime.createAt ? $moment(item.runtime.createAt).format('lll') : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    computed: {
      ...mapGetters(['Project', 'Environment']),
    },
  };
</script>
