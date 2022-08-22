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
        <BaseListItemForDetail :mt="0" :title="$t('tip.related_service')">
          <template #content>
            {{
              serviceMonitor && serviceMonitor.metadata && serviceMonitor.metadata.labels
                ? serviceMonitor.metadata.labels['svc']
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.task_label')">
          <template #content>
            {{ serviceMonitor ? serviceMonitor.spec.jobLabel : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Generation">
          <template #content>
            {{ serviceMonitor ? serviceMonitor.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.match_label')">
          <template #content>
            <BaseCollapseChips
              v-if="serviceMonitor && serviceMonitor.spec.selector"
              id="r_label"
              :chips="serviceMonitor.spec.selector.matchLabels || {}"
              icon="mdi-label"
              single-line
            />
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.match_namespace')">
          <template #content>
            <BaseCollapseChips
              v-if="serviceMonitor && serviceMonitor.spec.namespaceSelector"
              id="r_match_label"
              :chips="serviceMonitor.spec.namespaceSelector.matchNames || {}"
              icon="mdi-label"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="端点" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ $t('table.port') }}</th>
              <th class="text-left">{{ $t('table.path') }}</th>
              <th class="text-left">{{ $t('table.timeout') }}</th>
              <th class="text-left">{{ $t('table.interval') }}</th>
              <th class="text-left">{{ $t('table.metric_first') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in serviceMonitor ? serviceMonitor.spec.endpoints : []" :key="index">
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  <span v-if="item.port">{{ item.port }}</span>
                  <span v-else-if="item.targetPort">{{ item.targetPort }}</span>
                </v-chip>
              </td>
              <td>{{ item.path }}</td>
              <td>{{ item.scrapeTimeout }}</td>
              <td>{{ item.interval }}</td>
              <td>
                <span v-if="item.honorLabels">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small> mdi-minus-circle</v-icon>
                </span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import messages from '../../../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
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
        serviceMonitor: null,
      };
    },
    watch: {
      item() {
        this.serviceMonitor = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.serviceMonitor = deepCopy(this.item);
    },
  };
</script>
