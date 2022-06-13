<template>
  <BasePanel v-model="panel" icon="fas fa-chart-line" title="租户集群资源监控" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text">
        {{ item ? item.TenantName : '' }}
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
        <v-card-text class="py-0">
          <BaseApexAreaChart id="cpu" :extend-height="280" label="tenant" :metrics="cpu" title="CPU使用量" type="cpu" />

          <BaseApexAreaChart
            id="memory"
            :extend-height="280"
            label="tenant"
            :metrics="memory"
            title="内存使用量"
            type="memory"
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
  import { TENANT_CPU_USAGE_PROMQL, TENANT_MEMORY_USAGE_PROMQL } from '@/utils/prometheus';

  export default {
    name: 'TenantMonitor',
    mixins: [BasePermission, BaseResource],
    data: () => ({
      panel: false,
      cpu: [],
      memory: [],
      date: [],
      params: {
        start: '',
        end: '',
      },
      item: null,
      timeinterval: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.loadMetrics();
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.onDatetimeChange();
      });
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.panel = true;
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
        this.tenantCPUUsage();
        this.tenantMemoryUsage();
      },
      async tenantCPUUsage() {
        const query = TENANT_CPU_USAGE_PROMQL.replaceAll('$1', this.item.Tenant.TenantName);
        const data = await this.m_permission_matrix(
          this.item.Cluster.ClusterName,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.cpu = data;
      },
      async tenantMemoryUsage() {
        const query = TENANT_MEMORY_USAGE_PROMQL.replaceAll('$1', this.item.Tenant.TenantName);
        const data = await this.m_permission_matrix(
          this.item.Cluster.ClusterName,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.memory = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        if (this.item) this.loadMetrics();
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(item) {
        this.item = deepCopy(item);
      },
      dispose() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
    },
  };
</script>
