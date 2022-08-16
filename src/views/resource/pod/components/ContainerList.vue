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
  <v-sheet class="pa-4 rounded">
    <v-data-table
      v-if="item && item.status && item.status.containerStatuses"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="containerStatusesCopy"
      :no-data-text="$root.$t('data.no_data')"
    >
      <template #[`item.name`]="{ item }">
        {{ item.name }}
      </template>
      <template #[`item.image`]="{ item }">
        {{ item.image }}
      </template>
      <template #[`item.restartCount`]="{ item }">
        {{ item.restartCount }}
      </template>
      <template #[`item.status`]="{ item }">
        <span
          :class="`v-avatar mr-2 ${getContainerStatus(item) === 'Waiting' ? 'kubegems__waiting-flashing' : ''}`"
          :style="{
            height: '10px',
            minWidth: '10px',
            width: '10px',
            backgroundColor: `${$CONTAINER_STATUS_COLOR[getContainerStatus(item)]}`,
          }"
        />
        <span v-if="item.state.running"> Running </span>
        <span v-else-if="item.state.terminated"> Terminated({{ item.state.terminated.reason }}) </span>
        <span v-else-if="item.state.waiting"> Waiting({{ item.state.waiting.reason }}) </span>
      </template>
      <template #[`item.age`]="{ item }">
        <span v-if="item.state.running">
          {{
            item.state.running.startedAt ? $moment(item.state.running.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : ''
          }}
        </span>
        <span v-else-if="item.state.terminated">
          {{
            item.state.terminated.startedAt
              ? $moment(item.state.terminated.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
              : ''
          }}
        </span>
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
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex v-if="m_permisson_resourceAllow && item.state.running !== undefined">
                <v-btn color="primary" small text @click="containerShell(item.name)">
                  {{ $t('operate.terminal') }}
                </v-btn>
              </v-flex>
              <v-flex v-if="m_permisson_resourceAllow && item.state.running !== undefined">
                <v-btn color="primary" small text @click="containerDebug(item.name)"> Debug </v-btn>
              </v-flex>
              <v-flex v-if="item.state.running !== undefined || status === 'Succeeded' || item.state.waiting">
                <v-btn color="primary" small text @click="containerLog(item.name)"> {{ $t('operate.log') }} </v-btn>
              </v-flex>
              <v-flex
                v-if="item.state.running === undefined && status !== 'Succeeded' && item.state.waiting === undefined"
                class="pa-2"
              >
                {{ $t('tip.no_operate') }}
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>
    <v-data-table
      v-else
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="item ? item.spec.containers : []"
      :no-data-text="$root.$t('data.no_data')"
    >
      <template #[`item.name`]="{ item }">
        {{ item.name }}
      </template>
      <template #[`item.image`]="{ item }">
        {{ item.image }}
      </template>
      <template #[`item.restartCount`]> -- </template>
      <template #[`item.status`]>
        <span
          :class="`v-avatar mr-2`"
          :style="{
            height: '10px',
            minWidth: '10px',
            width: '10px',
            backgroundColor: `${$CONTAINER_STATUS_COLOR[getContainerStatus(item)]}`,
          }"
        />
        Failed
      </template>
      <template #[`item.age`]>
        <span>
          {{ $moment(item.metadata.creationTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}
        </span>
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
    </v-data-table>

    <ContainerLog ref="containerLog" />
    <Terminal ref="terminal" />
  </v-sheet>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, deepCopy } from '@/utils/helpers';
  import { CONTAINER_CPU_USAGE_PROMQL, CONTAINER_MEMORY_USAGE_PROMQL } from '@/utils/prometheus';
  import ContainerLog from '@/views/resource/components/common/ContainerLog';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'ContainerList',
    i18n: {
      messages: messages,
    },
    components: {
      ContainerLog,
      Terminal,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      status: '',
      containerStatusesCopy: [],
    }),
    computed: {
      ...mapState(['AdminViewport']),
      headers() {
        return [
          { text: this.$t('table.container_name'), value: 'name', align: 'start' },
          { text: this.$t('table.image'), value: 'image', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 250 },
          { text: 'Age', value: 'age', align: 'start' },
          { text: this.$t('table.restart_count'), value: 'restartCount', align: 'start' },
          { text: this.$t('table.used', [this.$root.$t('resource.cpu')]), value: 'cpu', align: 'start', width: 130 },
          {
            text: this.$t('table.used', [this.$root.$t('resource.memory')]),
            value: 'memory',
            align: 'start',
            width: 130,
          },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    watch: {
      item: {
        handler: function () {
          this.loaddata(false);
        },
        deep: true,
      },
    },
    mounted() {
      this.loaddata(true);
    },
    methods: {
      loaddata(mounted = false) {
        if (this.item && this.item.status && this.item.status.containerStatuses) {
          this.containerStatusesCopy = deepCopy(this.item.status.containerStatuses);
          this.item.spec.containers.forEach((c) => {
            const index = this.containerStatusesCopy.findIndex((s) => {
              return s.name === c.name;
            });
            if (index > -1) {
              const container = this.containerStatusesCopy[index];
              container.image = c.image;
              this.$set(this.containerStatusesCopy, index, container);
            }
          });
        }
        if (!this.item || mounted) {
          this.containerCPUUsage();
          this.containerMemoryUsage();
        }
        this.status =
          this.item && this.item.metadata
            ? this.item.metadata.deletionTimestamp
              ? 'Terminating'
              : this.item.status.phase
            : '';
      },
      async containerCPUUsage() {
        const CpuUsed = {};
        const CpuLatest = {};
        const containers = [];
        if (this.item && this.item.status && this.item.status.containerStatuses) {
          this.containerStatusesCopy.forEach((container) => {
            CpuUsed[container.name] = [];
            CpuLatest[container.name] = 0;
            containers.push(container.name);
          });
          const query = CONTAINER_CPU_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          const data = await this.m_permission_matrix(this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: true,
          });
          if (data) {
            data.forEach((d) => {
              const cpuUsed = [];
              const latest = d.values.length > 0 ? parseFloat(d.values[d.values.length - 1][1]) : null;
              d.values.forEach((v) => {
                cpuUsed.push(parseFloat(v[1]));
              });
              CpuLatest[d.metric.container] = latest ? beautifyCpuUnit(latest) : 0;
              CpuUsed[d.metric.container] = cpuUsed;
            });
            this.containerStatusesCopy.forEach((c, index) => {
              c.CpuUsed = CpuUsed[c.name];
              c.LatestCpu = CpuLatest[c.name];
              this.$set(this.containerStatusesCopy, index, c);
            });
          }
        }
      },
      async containerMemoryUsage() {
        const MemoryUsed = {};
        const MemoryLatest = {};
        const containers = [];
        if (this.item && this.item.status && this.item.status.containerStatuses) {
          this.containerStatusesCopy.forEach((container) => {
            MemoryUsed[container.name] = [];
            MemoryLatest[container.name] = 0;
            containers.push(container.name);
          });
          const query = CONTAINER_MEMORY_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          const data = await this.m_permission_matrix(this.ThisCluster, {
            query: query,
            start: this.$moment(new Date(new Date().setMinutes(new Date().getMinutes() - 15)))
              .utc()
              .format(),
            end: this.$moment(new Date()).utc().format(),
            noprocessing: true,
          });
          if (data) {
            data.forEach((d) => {
              const memoryUsed = [];
              const latest = d.values.length > 0 ? parseFloat(d.values[d.values.length - 1][1]) : null;
              d.values.forEach((v) => {
                memoryUsed.push(parseFloat(v[1]));
              });
              MemoryLatest[d.metric.container] = latest ? beautifyStorageUnit(latest) : 0;
              MemoryUsed[d.metric.container] = memoryUsed;
            });
            this.containerStatusesCopy.forEach((c, index) => {
              c.MemoryUsed = MemoryUsed[c.name];
              c.LatestMemory = MemoryLatest[c.name];
              this.$set(this.containerStatusesCopy, index, c);
            });
          }
        }
      },
      containerLog(container) {
        const item = {
          namespace: this.item.metadata.namespace,
          name: this.item.metadata.name,
          containers: this.item.spec.containers.concat(
            this.item.spec.initContainers
              ? this.item.spec.initContainers.map((i) => {
                  return { ...i, showName: `${i.name} (init)` };
                })
              : [],
          ),
        };
        this.$refs.containerLog.init(container, item);
        this.$refs.containerLog.open();
      },
      containerShell(container) {
        const item = {
          namespace: this.item.metadata.namespace,
          name: this.item.metadata.name,
          containers: this.item.spec.containers,
        };
        this.$refs.terminal.init(container, item, 'shell');
        this.$refs.terminal.open();
      },
      containerDebug(container) {
        const item = {
          namespace: this.item.metadata.namespace,
          name: this.item.metadata.name,
          containers: this.item.spec.containers,
        };
        this.$refs.terminal.init(container, item, 'debug');
        this.$refs.terminal.open();
      },
      getContainerStatus(item) {
        if (item.state) {
          if (item.state.running) return 'Running';
          if (item.state.terminated) return 'Terminated';
          if (item.state.waiting) return 'Waiting';
        } else return 'Failed';
      },
    },
  };
</script>
