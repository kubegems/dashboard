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
  <v-sheet class="overflow" max-height="400px">
    <BaseListItemForDetail v-if="$route.query.type !== 'DaemonSet'" :mt="0" :title="$t('tip.replicas')">
      <template #content>
        {{ $t('tip.replicas_updated', [item && item.status.updatedReplicas ? item.status.updatedReplicas : 0]) }},
        {{ $t('tip.replicas_ready', [item && item.status.readyReplicas ? item.status.readyReplicas : 0]) }},
        {{
          $t('tip.replicas_available', [
            item && (item.status.availableReplicas || item.status.currentReplicas)
              ? $route.query.type === 'Deployment'
                ? item.status.availableReplicas
                : item.status.currentReplicas
              : 0,
          ])
        }},
        {{
          $t('tip.replicas_unavailable', [
            item && (item.status.availableReplicas || item.status.currentReplicas)
              ? item.status.replicas -
                ($route.query.type === 'Deployment' ? item.status.availableReplicas : item.status.currentReplicas)
              : 0,
          ])
        }}
      </template>
    </BaseListItemForDetail>

    <BaseListItemForDetail :mt="0" :title="$t('table.label')">
      <template #content>
        <BaseCollapseChips v-if="item" id="w_label" :chips="item.metadata.labels || {}" icon="mdi-label" single-line />
      </template>
    </BaseListItemForDetail>

    <BaseListItemForDetail :mt="0" :title="$root.$t('resource.pod')">
      <template #content>
        <v-menu
          bottom
          :close-delay="200"
          max-width="200px"
          nudge-bottom="5px"
          offset-y
          open-on-hover
          origin="top center"
          right
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <span v-on="on">
              <span
                :class="`v-avatar mr-2 ${
                  m_resource_getWorkloadStatus($route.query.type, item) === 'pending'
                    ? 'kubegems__waiting-flashing'
                    : ''
                }`"
                :style="{
                  height: '10px',
                  minWidth: '10px',
                  width: '10px',
                  backgroundColor: `${$WORKLOAD_STATUS_COLOR[m_resource_getWorkloadStatus($route.query.type, item)]}`,
                }"
              />
              <span>
                {{ m_resource_getWorkloadStatus($route.query.type, item) === 'ready' ? 'Ready' : 'Pending' }}
              </span>
              <span>
                ({{ item ? item.status.availableReplicas || item.status.readyReplicas || 0 : 0 }}/{{
                  item ? item.spec.replicas : 0
                }})
              </span>
            </span>
          </template>

          <v-card flat>
            <v-flex class="text-body-2 text-center primary white--text py-2">
              <v-icon color="white" left small> mdi-cube </v-icon>
              <span>{{ $root.$t('resource.pod') }}</span>
            </v-flex>
            <v-list class="pa-0 kubegems__tip" dense>
              <v-list-item v-if="podItems.length > 0">
                <v-list-item-content>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> {{ $root.$t('resource.pod') }} </v-list-item-title>
                      <v-list-item-content
                        v-for="(pod, index) in podItems"
                        :key="index"
                        class="text-caption kubegems__text kubegems__break-all"
                      >
                        <span class="text-caption">
                          {{ $root.$t('resource.pod') }}{{ index + 1 }}：{{ pod.metadata.name }}
                        </span>
                        <span class="text-caption">
                          {{ $t('tip.status') }} :
                          <span
                            :class="`v-avatar mr-1 ${
                              ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(
                                m_resource_getPodStatus(pod),
                              ) > -1
                                ? 'kubegems__waiting-flashing'
                                : ''
                            } text-body-2`"
                            :style="{
                              height: '10px',
                              minWidth: '10px',
                              width: '10px',
                              backgroundColor: `${$POD_STATUS_COLOR[m_resource_getPodStatus(pod)] || '#ff5252'}`,
                            }"
                          />
                          {{ m_resource_getPodStatus(pod) }}
                        </span>
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-content>
              </v-list-item>
              <v-flex v-if="podItems.length === 0" class="text-caption text-center py-3">
                {{ $root.$t('data.no_data') }}
              </v-flex>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </BaseListItemForDetail>
  </v-sheet>
</template>

<script>
  import messages from '../../i18n';
  import { getPodList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'WorkloadInfo',
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
        podItems: [],
      };
    },
    watch: {
      item() {
        this.podList();
      },
    },
    methods: {
      async podList() {
        const data = await getPodList(
          this.$route.query.cluster,
          this.item.metadata.namespace,
          Object.assign({
            size: 1000,
            topkind: this.$route.query.type,
            topname: this.item.metadata.name,
            noprocessing: true,
          }),
        );
        this.podItems = data.List;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .label-swap {
    word-break: break-word;
    white-space: inherit;
    height: auto;
  }

  .overflow {
    overflow: auto;
  }

  .cell-btn {
    display: inline-flex;
  }
</style>
