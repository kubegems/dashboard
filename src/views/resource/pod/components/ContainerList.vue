<template>
  <v-sheet class="pa-4 rounded">
    <v-data-table
      v-if="item && item.status && item.status.containerStatuses"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="containerStatusesCopy"
      no-data-text="暂无数据"
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
              <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex v-if="m_permisson_resourceAllow && item.state.running !== undefined">
                <v-btn color="primary" small text @click="containerShell(item.name)"> 终端 </v-btn>
              </v-flex>
              <v-flex v-if="m_permisson_resourceAllow && item.state.running !== undefined">
                <v-btn color="primary" small text @click="containerDebug(item.name)"> Debug </v-btn>
              </v-flex>
              <v-flex v-if="item.state.running !== undefined || status === 'Succeeded' || item.state.waiting">
                <v-btn color="primary" small text @click="containerLog(item.name)"> 日志 </v-btn>
              </v-flex>
              <v-flex
                v-if="item.state.running === undefined && status !== 'Succeeded' && item.state.waiting === undefined"
                class="pa-2"
              >
                不可操作
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
      no-data-text="暂无数据"
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

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, deepCopy } from '@/utils/helpers';
  import { CONTAINER_CPU_USAGE_PROMQL, CONTAINER_MEMORY_USAGE_PROMQL } from '@/utils/prometheus';
  import ContainerLog from '@/views/resource/components/common/ContainerLog';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'ContainerList',
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
      headers: [
        { text: '容器名', value: 'name', align: 'start' },
        { text: '镜像', value: 'image', align: 'start' },
        { text: '状态', value: 'status', align: 'start', width: 250 },
        { text: 'Age', value: 'age', align: 'start' },
        { text: 'Restarts', value: 'restartCount', align: 'start' },
        { text: 'CPU使用量', value: 'cpu', align: 'start', width: 130 },
        { text: '内存使用量', value: 'memory', align: 'start', width: 130 },
        { text: '操作', value: 'action', align: 'center', width: 20 },
      ],
      status: '',
      containerStatusesCopy: [],
    }),
    computed: {
      ...mapState(['AdminViewport']),
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
            this.item.spec.initContainers.map((i) => {
              return { ...i, showName: `${i.name} (init)` };
            }) || [],
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
