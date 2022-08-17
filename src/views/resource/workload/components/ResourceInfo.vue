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
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail v-if="$route.query.type !== 'DaemonSet'" :mt="0" :title="$t('tip.replicas')">
          <template #content>
            {{
              $t('tip.updated_replicas', [
                workload && workload.status.updatedReplicas ? workload.status.updatedReplicas : 0,
              ])
            }},
            {{
              $t('tip.ready_replicas', [workload && workload.status.readyReplicas ? workload.status.readyReplicas : 0])
            }},
            {{
              $t('tip.available_replicas', [
                workload && (workload.status.availableReplicas || workload.status.currentReplicas)
                  ? $route.query.type === 'Deployment'
                    ? workload.status.availableReplicas
                    : workload.status.currentReplicas
                  : 0,
              ])
            }},
            {{
              $t('tip.unavailable_replicas', [
                workload && (workload.status.availableReplicas || workload.status.currentReplicas)
                  ? workload.status.replicas -
                    ($route.query.type === 'Deployment'
                      ? workload.status.availableReplicas
                      : workload.status.currentReplicas)
                  : 0,
              ])
            }},
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Generation">
          <template #content>
            {{ workload ? workload.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.label')">
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

        <BaseListItemForDetail :title="$t('tip.rolling_update_policy')">
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

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$root.$t('resource.container')" />
      <DetailContainer
        :containers="
          workload
            ? workload.spec.template.spec.containers.concat(
                workload.spec.template.spec.initContainers
                  ? workload.spec.template.spec.initContainers.map((i) => {
                      return { ...i, showName: `${i.name} (init)` };
                    })
                  : [],
              )
            : []
        "
      />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.volume')" />
      <DetailVolume :volumes="workload ? workload.spec.template.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.env')" />
      <DetailEnv :containers="workload ? workload.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.condition')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Reason</th>
              <th class="text-left">{{ $t('tip.status') }}</th>
              <th class="text-left">{{ $root.$t('resource.type') }}</th>
              <th class="text-left">Message</th>
              <th class="text-left">{{ $t('tip.last_at') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in workload ? workload.status.conditions : []" :key="index">
              <td>{{ item.reason }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small> mdi-minus-circle </v-icon>
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
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import DetailContainer from '@/views/resource/components/common/DetailContainer';
  import DetailEnv from '@/views/resource/components/common/DetailEnv';
  import DetailVolume from '@/views/resource/components/common/DetailVolume';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
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
