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

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    CLUSTER_API_SERVER_QPS_PROMQL,
    CLUSTER_API_SERVER_RT_PROMQL,
    CLUSTER_CPU_USAGE_PROMQL,
    CLUSTER_DISK_USAGE_PROMQL,
    CLUSTER_ETCD_QPS_PROMQL,
    CLUSTER_ETCD_RT_PROMQL,
    CLUSTER_MEMORY_USAGE_PROMQL,
    CLUSTER_POD_RUNNING_COUNT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'MetricMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      params: {
        type: Object,
        default: () => {},
      },
    },

    data: () => ({
      tab: 0,
      count: 0,
      key: 0,
      timeinterval: null,
    }),
    computed: {
      ...mapState(['Scale']),
      tabItems() {
        return [
          {
            text: this.$t('tab.etcd_timeout'),
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
            text: this.$t('tab.apiserver_timeout'),
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
            text: this.$t('tab.cluster_cpu'),
            chart: [],
            type: 'cpu',
            callBack: (thisInstance, timeParam) => {
              thisInstance.clusterCPUUsage(timeParam);
            },
          },
          {
            text: this.$t('tab.cluster_memory'),
            type: 'memory',
            chart: [],
            callBack: (thisInstance, timeParam) => {
              thisInstance.clusterMemoryUsage(timeParam);
            },
          },
          {
            text: this.$t('tab.cluster_storage'),
            type: 'storage',
            chart: [],
            callBack: (thisInstance, timeParam) => {
              thisInstance.clusterDiskSize(timeParam);
            },
          },
          {
            text: this.$t('tab.cluster_pod'),
            type: '',
            chart: [],
            callBack: (thisInstance, timeParam) => {
              thisInstance.clusterPodUsage(timeParam);
            },
          },
        ];
      },
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
      async clusterEtcdRT(timeParam) {
        const query = CLUSTER_ETCD_RT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
        }
      },
      async clusterApiServerRT(timeParam) {
        const query = CLUSTER_API_SERVER_RT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
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
          this.$forceUpdate();
        }
      },
      async clusterApiServerQps(timeParam) {
        const data1 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '2.*'),
            noprocessing: true,
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = 'ApiServerQPS2XX';
        const data2 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '4.*'),
            noprocessing: true,
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = 'ApiServerQPS4XX';
        const data3 = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: CLUSTER_API_SERVER_QPS_PROMQL.replaceAll('$1', '5.*'),
            noprocessing: true,
          }),
        );
        if (data3?.length > 0) data3[0].metric['name'] = 'ApiServerQPS5XX';

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        if (data3) data = data.concat(data3);
        this.tabItems[this.tab].chart = data;
        this.$forceUpdate();
      },
      async clusterEtcdQps(timeParam) {
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: CLUSTER_ETCD_QPS_PROMQL,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
        }
      },
      async clusterCPUUsage(timeParam) {
        const query = CLUSTER_CPU_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
        }
      },
      async clusterMemoryUsage(timeParam) {
        const query = CLUSTER_MEMORY_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
        }
      },
      async clusterDiskSize(timeParam) {
        const query = CLUSTER_DISK_USAGE_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
        }
      },
      async clusterPodUsage(timeParam) {
        const query = CLUSTER_POD_RUNNING_COUNT_PROMQL;
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(timeParam, {
            query: query,
            noprocessing: true,
          }),
        );
        if (data) {
          this.tabItems[this.tab].chart = data;
          this.$forceUpdate();
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
