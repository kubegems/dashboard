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
  <v-card>
    <v-card-text>
      <v-data-table
        class="kubegems__table-row-pointer"
        :headers="headers"
        hide-default-footer
        item-key="metadata.resourceVersion"
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
        show-expand
        single-expand
        @click:row="onRowClick"
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="podDetail(item)">
            <v-flex class="float-left">
              {{ item.metadata.name }}
            </v-flex>
            <v-flex
              v-if="
                item &&
                item.spec.resources &&
                item.spec.resources.limits &&
                item.spec.resources.limits['limits.tencent.com/vcuda-core']
              "
              class="float-left ml-2"
            >
              <v-menu :close-delay="200" nudge-bottom="7px" open-on-hover top>
                <template #activator="{ on }">
                  <span v-on="on">
                    <BaseLogo icon-name="tke" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> tencent vcuda </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
            <v-flex
              v-if="
                item &&
                item.spec.resources &&
                item.spec.resources.limits &&
                item.spec.resources.limits['limits.nvidia.com/gpu']
              "
              class="float-left ml-2"
            >
              <v-menu :close-delay="200" nudge-bottom="7px" open-on-hover top>
                <template #activator="{ on }">
                  <span v-on="on">
                    <BaseLogo icon-name="nvidia" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> nvidia </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
            <div class="kubegems__clear-float" />
          </a>
        </template>
        <template #[`item.status`]="{ item, index }">
          <v-flex :id="`e${item.metadata.resourceVersion}`" />
          <EventTip :item="item" kind="Pod" :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)">
            <template #trigger>
              <span
                :class="`v-avatar mr-2 ${
                  ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(
                    m_resource_getPodStatus(item),
                  ) > -1
                    ? 'kubegems__waiting-flashing'
                    : ''
                }`"
                :style="{
                  height: '10px',
                  minWidth: '10px',
                  width: '10px',
                  backgroundColor: `${POD_STATUS_COLOR[m_resource_getPodStatus(item)] || '#ff5252'}`,
                }"
              />
              <span> {{ m_resource_getPodStatus(item) }}</span>
              <span>
                ({{
                  item.status && item.status.containerStatuses
                    ? item.status.containerStatuses.filter((c) => {
                        return c.ready;
                      }).length
                    : 0
                }}/{{ item.spec.containers.length }})
              </span>
            </template>
          </EventTip>
        </template>
        <template #[`item.ip`]="{ item }">
          {{ item.status.podIP }}
        </template>
        <template #[`item.restart`]="{ item }">
          {{ getRestart(item.status.containerStatuses) }}
        </template>
        <template #[`item.age`]="{ item, index }">
          <RealDatetimeTip
            :datetime="item.status.startTime"
            :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <span>
                {{ item.status.startTime ? $moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
              </span>
            </template>
          </RealDatetimeTip>
        </template>
        <template #[`item.cpu`]="{ item }">
          <v-flex class="text-subtitle-2">
            {{ item.LatestCpu ? item.LatestCpu : 0 }}
          </v-flex>
          <v-sparkline
            auto-draw
            :auto-draw-duration="200"
            auto-line-width
            color="rgba(29, 136, 229, 0.6)"
            fill
            :line-width="5"
            smooth
            type="trend"
            :value="item.CpuUsed ? item.CpuUsed : []"
          />
        </template>
        <template #[`item.memory`]="{ item }">
          <v-flex class="text-subtitle-2">
            {{ item.LatestMemory ? item.LatestMemory : 0 }}
          </v-flex>
          <v-sparkline
            auto-draw
            :auto-draw-duration="200"
            auto-line-width
            color="rgba(29, 136, 229, 0.6)"
            fill
            :line-width="5"
            smooth
            type="trend"
            :value="item.MemoryUsed ? item.MemoryUsed : []"
          />
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex
                  v-if="
                    m_permisson_resourceAllow && item.status.phase === 'Running' && !item.metadata.deletionTimestamp
                  "
                >
                  <v-btn color="primary" small text @click.stop="containerShell(item)">
                    {{ $t('operate.terminal') }}
                  </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    m_permisson_resourceAllow && item.status.phase === 'Running' && !item.metadata.deletionTimestamp
                  "
                >
                  <v-btn color="primary" small text @click.stop="containerDebug(item)"> Debug </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    (item.status.phase === 'Running' || item.status.phase === 'Succeeded') &&
                    !item.metadata.deletionTimestamp
                  "
                >
                  <v-btn color="primary" small text @click.stop="containerLog(item)"> {{ $t('operate.log') }} </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    (item.status.phase === 'Running' || item.status.phase === 'Succeeded') &&
                    !item.metadata.deletionTimestamp
                  "
                >
                  <v-btn color="error" small text @click.stop="removePod(item)">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    (item.status.phase !== 'Running' && item.status.phase !== 'Succeeded') ||
                    item.metadata.deletionTimestamp
                  "
                  class="pa-2"
                >
                  {{ $t('tip.no_operate') }}
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="my-2 py-2" :colspan="headers.length">
            <ContainerItems
              :container-statuses="item && item.status ? item.status.containerStatuses : []"
              :containers="item && item.spec.containers"
              :init-container-statuses="item && item.status ? item.status.initContainerStatuses : []"
              :init-containers="item && item.spec.initContainers"
              :item="item"
            />
          </td>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="podList"
      />

      <ContainerLog ref="containerLog" />
      <Terminal ref="terminal" />
    </v-card-text>
  </v-card>
</template>

<script>
  import { deletePod, getPodList } from '@kubegems/api/direct';
  import RealDatetimeTip from '@kubegems/components/logicComponents/RealDatetimeTip';
  import { POD_CPU_USAGE_PROMQL, POD_MEMORY_USAGE_PROMQL } from '@kubegems/libs/constants/prometheus';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { beautifyCpuUnit, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import BaseTable from '@kubegems/mixins/table';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import ContainerLog from './ContainerLog';
  import EventTip from './EventTip';
  import Terminal from './Terminal';
  import { convertResponse2Pagination } from '@/types/base';
  import ContainerItems from '@/views/resource/pod/components/ContainerItems';

  export default {
    name: 'PodList',
    i18n: {
      messages: messages,
    },
    components: {
      ContainerItems,
      ContainerLog,
      EventTip,
      RealDatetimeTip,
      Terminal,
    },
    mixins: [BasePermission, BaseResource, BaseTable],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      selector: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      this.POD_STATUS_COLOR = POD_STATUS_COLOR;

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
          noprocessing: true,
        },
      };
    },
    computed: {
      ...mapState(['MessageStreamWS', 'AdminViewport', 'Edge']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 250 },
          { text: this.$t('table.restart_count'), value: 'restart', align: 'start', sortable: false },
          { text: 'Age', value: 'age', align: 'start' },
          { text: 'Pod IP', value: 'ip', align: 'start', sortable: false },
          {
            text: this.$t('table.used', [this.$root.$t('resource.cpu')]),
            value: 'cpu',
            align: 'start',
            width: 150,
            sortable: false,
          },
          {
            text: this.$t('table.used', [this.$root.$t('resource.memory')]),
            value: 'memory',
            align: 'start',
            width: 150,
            sortable: false,
          },
          {
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          },
          { text: '', value: 'data-table-expand' },
        ];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: function (updatingPod) {
          if (!updatingPod) return;
          const pod = JSON.parse(updatingPod);
          if (pod.MessageType !== 'objectChanged') return;
          if (pod.EventKind === 'delete') {
            this.podList();
            return;
          }
          const index = this.items.findIndex((p) => {
            return (
              p.metadata.name === pod.Content.metadata.name && p.metadata.namespace === pod.Content.metadata.namespace
            );
          });
          if (index > -1) {
            this.$set(this.items, index, pod.Content);
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.podList();
        },
        deep: true,
      },
      item: {
        handler: function () {
          if (this.item) {
            this.podList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async podList() {
        const data = await getPodList(
          this.$route.query.cluster || this.ThisCluster,
          this.$route.query.namespace || '_all',
          Object.assign(
            this.selector,
            Object.assign(this.params, {
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          ),
        );
        const pagination = convertResponse2Pagination(data);
        this.items = pagination.items;
        this.pageCount = pagination.pageCount;
        this.params.page = pagination.page;
        this.podCPUUsage();
        this.podMemoryUsage();
        this.watchPodList();
      },
      watchPodList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchPodList = [];
        this.items.forEach((pod) => {
          watchPodList.push(`${pod.metadata.namespace}/${pod.metadata.name}`);
        });
        sub.content[this.ThisCluster] = { Pod: watchPodList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      async podCPUUsage() {
        const parallelPods = [];
        for (let index = 0; index < parseInt(this.items.length / 20) + 1; index++) {
          parallelPods.push(this.items.slice(index * 20, (index + 1) * 20));
        }
        parallelPods.forEach(async (pods) => {
          const query = POD_CPU_USAGE_PROMQL.replaceAll(
            '$1',
            pods
              .map((pod) => {
                return pod.metadata.name;
              })
              .join('|'),
          ).replaceAll(
            '$2',
            pods
              .map((pod) => {
                return pod.metadata.namespace;
              })
              .join('|'),
          );
          const data = await this.m_permission_matrix(this.$route.query.cluster || this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: true,
          });
          if (data) {
            data.forEach((d) => {
              const index = this.items.findIndex((p) => {
                return d.metric && p.metadata.name === d.metric.pod;
              });
              if (index > -1) {
                const CpuUsed = [];
                const latest = d.values.length > 0 ? parseFloat(d.values[d.values.length - 1][1]) : null;
                d.values.forEach((v) => {
                  CpuUsed.push(parseFloat(v[1]));
                });
                const item = this.items[index];
                item.LatestCpu = latest ? beautifyCpuUnit(latest) : 0;
                item.CpuUsed = CpuUsed;
                this.$set(this.items, index, item);
              }
            });
          }
        });
      },
      async podMemoryUsage() {
        const parallelPods = [];
        for (let index = 0; index < parseInt(this.items.length / 20) + 1; index++) {
          parallelPods.push(this.items.slice(index * 20, (index + 1) * 20));
        }
        parallelPods.forEach(async (pods) => {
          const query = POD_MEMORY_USAGE_PROMQL.replaceAll(
            '$1',
            pods
              .map((pod) => {
                return pod.metadata.name;
              })
              .join('|'),
          ).replaceAll(
            '$2',
            pods
              .map((pod) => {
                return pod.metadata.namespace;
              })
              .join('|'),
          );
          const data = await this.m_permission_matrix(this.$route.query.cluster || this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: true,
          });
          if (data) {
            data.forEach((d) => {
              const index = this.items.findIndex((p) => {
                return d.metric && p.metadata.name === d.metric.pod;
              });
              if (index > -1) {
                const MemoryUsed = [];
                const latest = d.values.length > 0 ? parseFloat(d.values[d.values.length - 1][1]) : null;
                d.values.forEach((v) => {
                  MemoryUsed.push(parseFloat(v[1]));
                });
                const item = this.items[index];
                item.LatestMemory = latest ? beautifyStorageUnit(latest) : 0;
                item.MemoryUsed = MemoryUsed;
                this.$set(this.items, index, item);
              }
            });
          }
        });
      },
      containerLog(item) {
        const itemCopy = {
          namespace: item.metadata.namespace,
          name: item.metadata.name,
          containers: item.spec.containers.concat(
            this.item.spec.initContainers
              ? this.item.spec.initContainers.map((i) => {
                  return { ...i, showName: `${i.name} (init)` };
                })
              : [],
          ),
        };
        let container = '';
        if (item.spec.containers && item.spec.containers.length > 0) {
          container = item.spec.containers[0].name;
        }
        this.$refs.containerLog.init(container, itemCopy, Boolean(this.Edge));
        this.$refs.containerLog.open();
      },
      containerDebug(item) {
        const itemCopy = {
          namespace: item.metadata.namespace,
          name: item.metadata.name,
          containers: item.spec.containers,
        };
        let container = '';
        if (item.spec.containers && item.spec.containers.length > 0) {
          container = item.spec.containers[0].name;
        }
        this.$refs.terminal.init(container, itemCopy, 'debug', Boolean(this.Edge));
        this.$refs.terminal.open();
      },
      containerShell(item) {
        const itemCopy = {
          namespace: item.metadata.namespace,
          name: item.metadata.name,
          containers: item.spec.containers,
        };
        let container = '';
        if (item.spec.containers && item.spec.containers.length > 0) {
          container = item.spec.containers[0].name;
        }
        this.$refs.terminal.init(container, itemCopy, 'shell', Boolean(this.Edge));
        this.$refs.terminal.open();
      },
      getRestart(containerStatuses) {
        let sum = 0;
        if (containerStatuses) {
          containerStatuses.forEach((con) => {
            sum += con.restartCount;
          });
        }
        return sum;
      },
      podDetail(item) {
        this.$router.push({
          name: 'pod-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
      removePod(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.pod')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.pod')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deletePod(
                this.$route.query.cluster || this.ThisCluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.podList();
            }
          },
        });
      },
    },
  };
</script>
