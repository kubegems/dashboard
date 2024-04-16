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
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.node_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="metadata.name"
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="nodeDetail(item)">
            <v-flex class="float-left">
              <BaseCopyItem :item="item.metadata.name" :max-width="nodeNameWidth - 30" />
            </v-flex>
            <div class="float-left">
              <v-icon class="mx-1" color="primary">{{ getOSIcon(item) }}</v-icon>
            </div>
            <v-flex
              v-if="
                (item.metadata.labels &&
                  item.metadata.labels['tencent.com/vcuda'] &&
                  item.metadata.labels['tencent.com/vcuda'] === 'true') ||
                (item.metadata.labels['nvidia.com/gpu'] && item.metadata.labels['nvidia.com/gpu'] === 'true')
              "
              class="float-left"
            >
              <GpuTip :allocated="false" :item="item" :top="2" />
            </v-flex>

            <div class="kubegems__clear-float" />
          </a>
        </template>
        <template #[`item.status`]="{ item }">
          <v-avatar
            class="mr-2"
            size="10"
            :style="`background-color: ${
              getStatus(item.status.conditions).join(',') === 'Ready'
                ? config.theme.THEME_COLOR.success
                : getStatus(item.status.conditions).join(',') === 'Unknown'
                ? config.theme.THEME_COLOR_EXTEND.grey
                : config.theme.THEME_COLOR_EXTEND.error
            };`"
          >
            <span class="white--text text-h5" />
          </v-avatar>
          {{ getStatus(item.status ? item.status.conditions : null).join(',') }}
        </template>
        <template #[`item.ip`]="{ item }">
          {{ item.status.addresses[0].address }}
        </template>
        <template #[`item.pod`]="{ item }">
          {{ item.podcount ? item.podcount : 0 }}
          / {{ item.status.capacity.pods }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.podPercentage)"
            height="15"
            :value="item.podPercentage"
          >
            <span class="white--text"> {{ item.podPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.load`]="{ item }">
          <v-sheet :class="`text-subtitle-2 ${getLoadColor(item)} rounded text-center py-2 kubegems__text`">
            {{ item.load ? item.load : 0 }}
          </v-sheet>
        </template>
        <template #[`item.cpu`]="{ item }">
          {{ item.cpu }}
          /
          {{ item.status.capacity.cpu }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.cpuPercentage)"
            height="15"
            :value="item.cpuPercentage"
          >
            <span class="white--text"> {{ item.cpuPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.memory`]="{ item }">
          {{ item.memory }}
          Gi / {{ sizeOfStorage(item.status.capacity.memory).toFixed(1) }}
          Gi
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.memoryPercentage)"
            height="15"
            :value="item.memoryPercentage"
          >
            <span class="white--text"> {{ item.memoryPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.createAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
        <template #[`item.taint`]="{ item }">
          <BaseCollapseChips
            :chips="getDistinctTaints(item.spec.taints) || {}"
            :collapse="taintWidth"
            icon="mdi-label-variant"
            :show-length="0"
            single-line
          />
        </template>
        <template #[`item.role`]="{ item }">
          <span
            v-if="
              item.metadata.labels[`node-role.kubernetes.io/master`] === '' ||
              item.metadata.labels[`kubernetes.io/role`] === 'master' ||
              item.metadata.labels[`node-role.kubernetes.io/control-plane`] === ''
            "
          >
            Master
          </span>
          <span v-else>Worker</span>
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
                <v-flex v-if="Plugins && (Plugins['tke-gpu-manager'] || Plugins['nvidia-device-plugin'])">
                  <v-btn color="primary" small text @click="gpuSchedule(item)">
                    {{ $t('operate.gpu_schedule') }}
                  </v-btn>
                </v-flex>
                <v-flex v-if="item.spec.unschedulable">
                  <v-btn color="primary" small text @click="allowSchedule(item)">
                    {{ $t('operate.allow_schedule') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="error" small text @click="stopSchedule(item)">
                    {{ $t('operate.stop_schedule') }}
                  </v-btn>
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
        @loaddata="nodeList"
      />
    </v-card>

    <GpuScheduleForm ref="gpuScheduleForm" @refresh="nodeList" />
  </v-container>
</template>

<script>
  import { getNodeList, patchCordonNode } from '@kubegems/api/direct';
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import config from '@kubegems/libs/constants/global';
  import {
    NODE_ALL_CPU_USAGE_PROMQL,
    NODE_ALL_MEMORY_USAGE_PROMQL,
    NODE_LOAD_PROMQL,
    NODE_POD_RUNNING_COUNT_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { convertStrToNum, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import BaseFilter from '@kubegems/mixins/base_filter';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import GpuScheduleForm from './components/GpuScheduleForm';
  import messages from './i18n';
  import GpuTip from '@/views/resource/components/common/GpuTip';

  export default {
    name: 'Node',
    i18n: {
      messages: messages,
    },
    components: {
      GpuScheduleForm,
      GpuTip,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data() {
      this.config = config;

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },

        interval: null,
        nodeNameWidth: 0,
        tickNodeNameNum: 0,
        taintWidth: 0,
        tickTaintNum: 0,
      };
    },
    computed: {
      ...mapState(['JWT', 'Plugins', 'Edge']),
      filters() {
        return [{ text: this.$t('filter.node_name'), value: 'search', items: [] }];
      },
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start', class: 'node__name' },
          { text: 'IP', value: 'ip', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 120 },
          { text: this.$t('table.role'), value: 'role', align: 'start' },
          { text: this.$t('table.taint'), value: 'taint', align: 'start', class: 'table__taint' },
          { text: this.$t('table.load'), value: 'load', align: 'start', width: 80 },
          { text: this.$root.$t('resource.cpu'), value: 'cpu', align: 'start', width: 150 },
          { text: this.$root.$t('resource.memory'), value: 'memory', align: 'start', width: 150 },
          { text: this.$root.$t('resource.pod'), value: 'pod', align: 'start', width: 150 },
          { text: this.$t('table.join_at'), value: 'createAt', align: 'start', width: 165 },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.dynamicNodeNameWidth();
        this.dynamicTaintWidth();
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_cluster'),
            color: 'warning',
          });
          return;
        }
        Object.assign(Object.assign(this.params, { noprocessing: false }), convertStrToNum(this.$route.query));
        this.nodeList();
      });
    },
    destroyed() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
    methods: {
      dynamicNodeNameWidth() {
        const interval = setInterval(() => {
          const w = document.querySelector('.node__name')?.clientWidth || undefined;
          if (w) {
            this.nodeNameWidth = w;
          }
          this.tickNodeNameNum += 1;
          if (this.tickNodeNameNum >= 10) {
            clearInterval(interval);
          }
        }, 100);
      },
      dynamicTaintWidth() {
        const interval = setInterval(() => {
          const w = document.querySelector('.table__taint')?.clientWidth || undefined;
          if (w) {
            this.taintWidth = w;
          }
          this.tickTaintNum += 1;
          if (this.tickTaintNum >= 10) {
            clearInterval(interval);
          }
        }, 100);
      },
      loadMetrics() {
        if (this.Edge && !this.Plugins['monitoring']) return;
        this.nodeCPUUsage(true);
        this.nodeMemoryUsage(true);
        this.nodeLoad5(true);
        this.nodePodCount(true);
        this.nodeGPUUsage();
        if (this.interval) {
          clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
          this.loadMetrics();
        }, 1000 * 60);
      },
      async nodeList(noprocess = false) {
        const data = await getNodeList(this.ThisCluster, Object.assign(this.params, { noprocessing: noprocess }));
        const pagination = convertResponse2Pagination(data);
        this.items = pagination.items;
        this.pageCount = pagination.pageCount;
        this.params.page = pagination.page;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.loadMetrics();
      },
      async nodeLoad5(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: NODE_LOAD_PROMQL.replaceAll('%', ''),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          const index = this.items.findIndex((node) => {
            return d.metric.node === node.metadata.name;
          });
          if (index > -1) {
            const item = this.items[index];
            item.load = parseFloat(d?.value[1]).toFixed(1);
            this.$set(this.items, index, item);
          }
        });
      },
      async nodeCPUUsage(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: NODE_ALL_CPU_USAGE_PROMQL.replaceAll('%', ''),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          const index = this.items.findIndex((node) => {
            return d.metric.node === node.metadata.name;
          });
          if (index > -1) {
            const item = this.items[index];
            item.cpu = ((parseFloat(d?.value[1]) * item.status.capacity.cpu) / 100).toFixed(1);
            item.cpuPercentage = parseFloat(d?.value[1]).toFixed(1);
            this.$set(this.items, index, item);
          }
        });
      },
      async nodeMemoryUsage(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: NODE_ALL_MEMORY_USAGE_PROMQL.replaceAll('%', ''),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          const index = this.items.findIndex((node) => {
            return d.metric.node === node.metadata.name;
          });
          if (index > -1) {
            const item = this.items[index];
            item.memory = (
              (parseFloat(d?.value[1]) * sizeOfStorage(item.status.capacity.memory, 'Ki')) /
              1024 /
              1024 /
              100
            ).toFixed(1);
            item.memoryPercentage = parseFloat(d?.value[1]).toFixed(1);
            this.$set(this.items, index, item);
          }
        });
      },
      nodeGPUUsage() {
        this.items.forEach((item, index) => {
          if (
            item?.metadata?.labels['tencent.com/vcuda'] === 'true' ||
            item?.metadata?.labels['nvidia.com/gpu'] === 'true'
          ) {
            item.TkeGpu = item.status.capacity['tencent.com/vcuda-core'];
            item.TkeMemory = item.status.capacity['tencent.com/vcuda-memory'];
            item.NvidiaGpu = item.status.capacity['nvidia.com/gpu'];
            this.$set(this.items, index, item);
          }
        });
      },
      async nodePodCount(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: NODE_POD_RUNNING_COUNT_PROMQL.replaceAll('%', ''),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          const index = this.items.findIndex((node) => {
            return d.metric.node === node.metadata.name;
          });
          if (index > -1) {
            const item = this.items[index];
            item.podcount = parseInt(d?.value[1]);
            item.podPercentage = ((parseInt(d?.value[1]) / item.status.capacity.pods) * 100).toFixed(1);
            this.$set(this.items, index, item);
          }
        });
      },
      nodeDetail(item) {
        this.$router.push({
          name: 'node-detail',
          params: Object.assign(this.$route.params, { name: item.metadata.name }),
        });
      },
      stopSchedule(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.stop_schedule'),
          content: {
            text: `${this.$t('operate.stop_schedule')} ${item.metadata.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
              Unschedulable: true,
            });
            this.nodeList();
          },
        });
      },
      allowSchedule(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.allow_schedule'),
          content: {
            text: `${this.$t('operate.allow_schedule')} ${item.metadata.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
              Unschedulable: false,
            });
            this.nodeList();
          },
        });
      },
      getStatus(conditions) {
        const tmpConditions = [];
        if (conditions && conditions.length === 0) return ['Unknown'];
        conditions.forEach((con) => {
          if (con.type === 'Ready') {
            if (con.status === 'True') {
              tmpConditions.push(con.type);
              return tmpConditions;
            } else if (con.status === 'Unknown') {
              tmpConditions.push('Unknown');
            } else {
              tmpConditions.push('NotReady');
            }
          } else {
            if (con.status === 'True') {
              tmpConditions.push(con.type);
            }
          }
        });

        if (tmpConditions.length > 1 && tmpConditions.indexOf('Ready') > -1) {
          const index = tmpConditions.indexOf('Ready');
          tmpConditions.splice(index, 1);
        }

        return tmpConditions;
      },
      getDistinctTaints(taints) {
        if (taints === undefined) return {};
        const t = {};
        taints.forEach((taint) => {
          if (t[taint.key]) {
            t[`${taint.key} `] = taint.effect;
          } else {
            t[taint.key] = taint.effect;
          }
        });
        return t;
      },
      getLoadColor(item) {
        const cpu = parseFloat(item.status.capacity.cpu);
        if (item.load > cpu) {
          return 'red lighten-3';
        }
        return 'green lighten-4';
      },
      gpuSchedule(item) {
        this.$refs.gpuScheduleForm.init(item);
        this.$refs.gpuScheduleForm.open();
      },
      sizeOfStorage: sizeOfStorage,
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getColor(percentage) {
        return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
      },
      getOSIcon(item) {
        const os = item?.status?.nodeInfo?.osImage?.toLocaleLowerCase();
        if (os.indexOf('ubuntu') > -1) return 'mdi-ubuntu';
        if (os.indexOf('debian') > -1) return 'mdi-debian';
        if (os.indexOf('windows') > -1) return 'mdi-microsoft-windows';
        if (os.indexOf('centos') > -1) return 'mdi-centos';
        if (os.indexOf('redhat') > -1) return 'mdi-redhat';
      },
    },
  };
</script>
