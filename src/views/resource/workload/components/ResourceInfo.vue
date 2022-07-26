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
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail v-if="$route.query.type !== 'DaemonSet'" :mt="0" title="副本">
          <template #content>
            {{ workload && workload.status.updatedReplicas ? workload.status.updatedReplicas : 0 }}
            个副本已更新,
            {{ workload && workload.status.readyReplicas ? workload.status.readyReplicas : 0 }}
            个副本已就绪,
            {{
              workload && (workload.status.availableReplicas || workload.status.currentReplicas)
                ? $route.query.type === 'Deployment'
                  ? workload.status.availableReplicas
                  : workload.status.currentReplicas
                : 0
            }}
            个副本可用,
            {{
              workload && (workload.status.availableReplicas || workload.status.currentReplicas)
                ? workload.status.replicas -
                  ($route.query.type === 'Deployment'
                    ? workload.status.availableReplicas
                    : workload.status.currentReplicas)
                : 0
            }}
            个副本不可用
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="generation">
          <template #content>
            {{ workload ? workload.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="匹配标签">
          <template #content>
            <BaseCollapseChips
              v-if="workload"
              id="w_selector"
              :chips="workload.spec.selector.matchLabels || {}"
              icon="mdi-label"
              single-line
            />
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="滚动更新策略">
          <template #content>
            <span v-if="$route.query.type === 'StatefulSet'">
              {{ workload ? workload.spec.updateStrategy.type : '' }}
            </span>
            <span v-else-if="$route.query.type === 'Deployment'">
              {{ workload ? workload.spec.strategy.type : '' }}
            </span>
            <span v-else-if="$route.query.type === 'DaemonSet'">
              {{ workload ? workload.spec.updateStrategy.type : '' }}
            </span>
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="容器" />
      <DetailContainer :containers="workload ? workload.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="卷" />
      <DetailVolume :volumes="workload ? workload.spec.template.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="环境变量" />
      <DetailEnv :containers="workload ? workload.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="状况" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Reason</th>
              <th class="text-left">状态</th>
              <th class="text-left">Type</th>
              <th class="text-left">Message</th>
              <th class="text-left">上次更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in workload ? workload.status.conditions : []" :key="index">
              <td>{{ item.reason }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small>fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.message }}</td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import DetailContainer from '@/views/resource/components/common/DetailContainer';
  import DetailEnv from '@/views/resource/components/common/DetailEnv';
  import DetailVolume from '@/views/resource/components/common/DetailVolume';

  export default {
    name: 'ResourceInfo',
    components: {
      DetailContainer,
      DetailEnv,
      DetailVolume,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        workload: null,
      };
    },
    watch: {
      item() {
        this.workload = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.workload = deepCopy(this.item);
    },
  };
</script>
