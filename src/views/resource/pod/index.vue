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
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '容器组名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveResource('容器组', 'Pod', podList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除容器组
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4 kubegems__table-row-pointer"
        :headers="headers"
        hide-default-footer
        item-key="metadata.uid"
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-expand
        show-select
        single-expand
        @click:row="onRowClick"
        @toggle-select-all="m_table_onResourceToggleSelect"
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
            color="primary"
            hide-details
            @change="m_table_onResourceChange($event, item, index)"
            @click.stop
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2" @click.stop="podDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
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
                :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                  $POD_STATUS_COLOR[m_resource_getPodStatus(item)] || '#ff5252'
                };`"
              />
              <span>
                {{ m_resource_getPodStatus(item) }}
              </span>
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
        <template #[`item.nip`]="{ item }">
          {{ item.status.hostIP }}
        </template>
        <template #[`item.container`]="{ item }">
          {{ item.spec.containers.length }}
        </template>
        <template #[`item.restart`]="{ item }">
          {{ getRestart(item.status.containerStatuses) }}
        </template>
        <template #[`item.age`]="{ item }">
          {{ item.status.startTime ? $moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
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
        <template #expanded-item="{ headers, item }">
          <td class="my-2 py-2" :colspan="headers.length">
            <ContainerItems
              :container-statuses="item && item.status ? item.status.containerStatuses : []"
              :containers="item && item.spec.containers"
              :item="item"
            />
          </td>
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" small text @click.stop="removePod(item)"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
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
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ContainerItems from './components/ContainerItems';
  import { deletePod, getPodList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { beautifyCpuUnit, beautifyStorageUnit } from '@/utils/helpers';
  import { stringifySelector } from '@/utils/k8s_selector';
  import { POD_CPU_USAGE_PROMQL, POD_MEMORY_USAGE_PROMQL } from '@/utils/prometheus';
  import EventTip from '@/views/resource/components/common/EventTip';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'Pod',
    components: {
      ContainerItems,
      EventTip,
      NamespaceFilter,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '容器组名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS', 'Plugins']),
      ...mapGetters(['Environment']),
      headers() {
        const items = [
          { text: '容器组', value: 'name', align: 'start', width: 358 },
          { text: '状态', value: 'status', align: 'start', width: 250 },
          { text: '容器数', value: 'container', align: 'start', sortable: false },
          { text: '重启次数', value: 'restart', align: 'start', sortable: false },
          {
            text: 'CPU使用量',
            value: 'cpu',
            align: 'start',
            width: 150,
            sortable: false,
          },
          {
            text: '内存使用量',
            value: 'memory',
            align: 'start',
            width: 150,
            sortable: false,
          },
          { text: 'Age', value: 'age', align: 'start' },
          { text: 'Pod IP', value: 'ip', align: 'start', sortable: false },
          { text: 'Node IP', value: 'nip', align: 'start', sortable: false },
        ];
        if (this.m_permisson_resourceAllow) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        if (this.AdminViewport) {
          items.splice(1, 0, {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
            width: 120,
          });
        } else {
          items[0].width = 478;
        }
        items.push({ text: '', value: 'data-table-expand' });
        return items;
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.podList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingPod) {
          if (!updatingPod) return;
          const pod = JSON.parse(updatingPod);
          if (pod.MessageType !== 'objectChanged') return;
          if (pod.EventKind === 'delete') {
            this.m_table_generateParams();
            this.podList(true);
            return;
          }
          if (pod.EventKind === 'add' && this.params.page === 1 && pod.InvolvedObject.Kind === 'Pod') {
            if (this.AdminViewport || pod.InvolvedObject.NamespacedName.indexOf(this.Environment().Namespace) === 0) {
              this.m_table_generateParams();
              this.podList(true);
              return;
            }
          }
          const index = this.items.findIndex((p) => {
            return (
              pod.Content.metadata &&
              p.metadata.name === pod.Content.metadata.name &&
              p.metadata.namespace === pod.Content.metadata.namespace
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
          this.podList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: `请创建或选择集群`,
              color: 'warning',
            });
            return;
          }
          this.m_table_generateParams();
          this.podList();
          this.generateFilters();
        });
      }
    },
    methods: {
      generateFilters() {
        const allStatus = ['Terminating', 'Running', 'Pending', 'CrashLoopBackOff', 'Error'].map((s) => {
          return {
            text: s,
            value: stringifySelector({
              matchLabels: {
                phase: s,
              },
            }),
            parent: 'fieldSelector',
          };
        });
        this.filters.push({
          text: '状态',
          value: 'fieldSelector',
          items: allStatus,
        });
      },
      async podList(noprocess = false) {
        const data = await getPodList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.podCPUUsage(true);
        this.podMemoryUsage(true);
        this.watchPodList();
        this.m_table_generateSelectResource();
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
      async podCPUUsage(noprocess = false) {
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
          const data = await this.m_permission_matrix(this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: noprocess,
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
      async podMemoryUsage(noprocess = false) {
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
          const data = await this.m_permission_matrix(this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: noprocess,
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
      removePod(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除容器组`,
          content: {
            text: `删除容器组 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deletePod(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.podList();
            }
          },
        });
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
    },
  };
</script>
