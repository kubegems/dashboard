<template>
  <BasePanel v-model="panel" icon="fas fa-chart-line" title="容器监控" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text">
        {{ promqlParams.pod }}
      </span>
    </template>
    <template #action>
      <v-flex>
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatetimePicker
            v-model="date"
            color="primary"
            :default-value="30"
            @change="onDatetimeChange(undefined)"
          />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} mt-4`" flat>
        <v-card-text class="py-0" :style="{ height: `${height}px`, overflowY: 'auto' }">
          <BaseApexAreaChart
            id="cpu"
            label="container"
            :metrics="cpu"
            :no-data-offset-y="-22"
            title="CPU使用量"
            type="cpu"
          />
          <BaseApexAreaChart
            id="memory"
            label="container"
            :metrics="memory"
            :no-data-offset-y="-22"
            title="内存使用量"
            type="memory"
          />
          <BaseApexAreaChart
            id="networkin"
            label="pod"
            :metrics="networkin"
            :no-data-offset-y="-22"
            title="网络入口流量"
            type="network"
          />
          <BaseApexAreaChart
            id="networkout"
            label="pod"
            :metrics="networkout"
            :no-data-offset-y="-22"
            title="网络出口流量"
            type="network"
          />
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import {
    CONTAINER_CPU_USAGE_PROMQL,
    CONTAINER_MEMORY_USAGE_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'LogPodMonitor',
    mixins: [BasePermission, BaseResource],
    data: () => ({
      panel: false,
      cpu: [],
      memory: [],
      networkin: [],
      networkout: [],
      date: [],
      params: {
        start: '',
        end: '',
      },
      timeinterval: null,
      promqlParams: {
        cluster: '',
        namespace: '',
        pod: '',
        container: '',
      },
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 17;
      },
    },
    watch: {
      promqlParams: {
        handler(newValue) {
          if (newValue && newValue?.cluster) {
            this.onDatetimeChange();
          }
        },
        deep: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(item) {
        this.promqlParams = deepCopy(item);
      },
      dispose() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {
        this.podCPUUsage();
        this.podMemoryUsage();
        this.podNetworkIn();
        this.podNetworkOut();
      },
      async podCPUUsage() {
        const query = CONTAINER_CPU_USAGE_PROMQL.replaceAll('$1', this.promqlParams.container)
          .replaceAll('$2', this.promqlParams.pod)
          .replaceAll('$3', this.promqlParams.namespace);
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.cpu = data;
      },
      async podMemoryUsage() {
        const query = CONTAINER_MEMORY_USAGE_PROMQL.replaceAll('$1', this.promqlParams.container)
          .replaceAll('$2', this.promqlParams.pod)
          .replaceAll('$3', this.promqlParams.namespace);
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.memory = data;
      },
      async podNetworkIn() {
        const query = POD_NETWORK_IN_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.networkin = data;
      },
      async podNetworkOut() {
        const query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.networkout = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
