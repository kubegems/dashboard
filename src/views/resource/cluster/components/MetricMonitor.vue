<template>
  <v-card class="pa-2 ma-0" flat>
    <v-tabs v-model="tab" fixed-tabs :height="30" @change="onTabChange">
      <v-tab
        v-for="(item, index) in tabItems"
        :key="index"
        class="v-tab"
        :reverse-transition="false"
        :transition="false"
      >
        {{ item.text }}
      </v-tab>
    </v-tabs>

    <BaseApexAreaChart
      :id="`api${tab}`"
      :key="key"
      :ref="`tab${tab}`"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      :extend-height="280"
      :label="tabItems[tab].label"
      :metrics="tabItems[tab].chart"
      :no-data-offset-y="-24"
      title=""
      :type="tabItems[tab].type"
    />
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    CLUSTER_ETCD_RT_PROMQL,
    CLUSTER_API_SERVER_RT_PROMQL,
    CLUSTER_API_SERVER_QPS_PROMQL,
    CLUSTER_ETCD_QPS_PROMQL,
    CLUSTER_CPU_USAGE_PROMQL,
    CLUSTER_MEMORY_USAGE_PROMQL,
    CLUSTER_DISK_USAGE_PROMQL,
    CLUSTER_POD_RUNNING_COUNT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'MetricMonitor',
    mixins: [BasePermission, BaseResource],
    props: {
      params: {
        type: Object,
        default: () => {},
      },
    },

    data: () => ({
      tab: 0,
      tabItems: [
        {
          text: 'ETCD耗时',
          type: 'timecost',
          label: 'operation',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterEtcdRT(timeParam);
          },
        },
        {
          text: 'ETCD QPS',
          type: '',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterEtcdQps(timeParam);
          },
        },
        {
          text: 'APIServer耗时',
          type: 'timecost',
          label: 'verb',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterApiServerRT(timeParam);
          },
        },
        {
          text: 'APIServerQPS',
          type: '',
          label: 'name',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterApiServerQps(timeParam);
          },
        },
        {
          text: '集群CPU',
          chart: [],
          type: 'cpu',
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterCPUUsage(timeParam);
          },
        },
        {
          text: '集群内存',
          type: 'memory',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterMemoryUsage(timeParam);
          },
        },
        {
          text: '集群存储',
          type: 'storage',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterDiskSize(timeParam);
          },
        },
        {
          text: '集群容器组',
          type: '',
          chart: [],
          callBack: (thisInstance, timeParam) => {
            thisInstance.clusterPodUsage(timeParam);
          },
        },
      ],
      count: 0,
      key: 0,
      timeinterval: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      params: {
        handler: function () {
          this.loadMetrics();
        },
        deep: true,
        immediate: false,
      },
    },
    destroyed() {
      if (this.timeinterval) clearTimeout(this.timeinterval);
    },
    methods: {
      async loadMetrics(clearSeries = false) {
        if (this.timeinterval) clearInterval(this.timeinterval);
        if (clearSeries) this.count -= 1;
        const timeParam = this.updateTime();
        this.loadData(clearSeries, timeParam);
        this.timeinterval = setInterval(() => {
          const timeParam = this.updateTime();
          this.loadData(false, timeParam);
        }, 1000 * 60);
      },
      onTabChange() {
        this.loadMetrics(true);
      },
      updateTime() {
        this.count += 1;
        return {
          start: this.$moment(this.params.start)
            .utc()
            .add(60 * this.count, 'seconds')
            .format(),
          end: this.$moment(this.params.end)
            .utc()
            .add(60 * this.count, 'seconds')
            .format(),
        };
      },
      loadData(clearSeries, timeParam) {
        if (clearSeries) {
          this.key += 1;
        }
        this.tabItems[this.tab].callBack(this, timeParam);
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterEtcdRT(timeParam) {
        const query = CLUSTER_ETCD_RT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterApiServerRT(timeParam) {
        const query = CLUSTER_API_SERVER_RT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          data.forEach((d) => {
            d.values.forEach((v) => {
              if (v[1] === 'NaN') {
                v[1] = 0;
              }
            });
          });
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterApiServerQps(timeParam) {
        const data1 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '2.*')),
            noprocessing: true,
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = 'ApiServerQPS2XX';
        const data2 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '4.*')),
            noprocessing: true,
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = 'ApiServerQPS4XX';
        const data3 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '5.*')),
            noprocessing: true,
          }),
        );
        if (data3?.length > 0) data3[0].metric['name'] = 'ApiServerQPS5XX';

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        if (data3) data = data.concat(data3);
        this.tabItems[this.tab].chart = data;
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterEtcdQps(timeParam) {
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(CLUSTER_ETCD_QPS_PROMQL),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterCPUUsage(timeParam) {
        const query = CLUSTER_CPU_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterMemoryUsage(timeParam) {
        const query = CLUSTER_MEMORY_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterDiskSize(timeParam) {
        const query = CLUSTER_DISK_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async clusterPodUsage(timeParam) {
        const query = CLUSTER_POD_RUNNING_COUNT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: escape(query),
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-tab {
    padding: 0 6px;
  }
</style>
