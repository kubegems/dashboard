<template>
  <v-row>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="40px" icon="clarity:network-globe-line" width="40px" />
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> 实时速率: {{ requestsNow ? requestsNow : 0 }} </v-flex>
              <v-flex class="text-body-2"> 过去24小时: {{ requestsSumOverTime ? requestsSumOverTime : 0 }} </v-flex>
              <h5 class="text-subtitle-2 font-weight-regular kubegems__text"> 总请求 </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="40px" icon="fluent:timer-16-regular" width="40px" />
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> p99: {{ avgresponsetimeP99 ? avgresponsetimeP99 : 0 }} ms </v-flex>
              <v-flex class="text-body-2"> p95: {{ avgresponsetimeP95 ? avgresponsetimeP95 : 0 }} ms </v-flex>
              <h5 class="text-subtitle-2 font-weight-regular kubegems__text"> 响应时间 </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="40px" icon="clarity:network-globe-outline-badged" width="40px" />
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> 实时: {{ errrequestsSum ? errrequestsSum : 0 }} </v-flex>
              <v-flex class="text-body-2">
                过去24小时:
                {{ errrequestsSumOverTime ? errrequestsSumOverTime : 0 }}
              </v-flex>
              <h5 class="text-subtitle-2 font-weight-regular kubegems__text"> 异常请求数 </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="40px" icon="carbon:content-delivery-network" width="40px" />
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> 入: {{ networkIngress ? networkIngress : 0 }} Kbps </v-flex>
              <v-flex class="text-body-2"> 出: {{ networkEgress ? networkEgress : 0 }} Kbps </v-flex>
              <h5 class="text-subtitle-2 font-weight-regular kubegems__text">流量</h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    ISTIO_EGRESS_NETWORK_PROMQL,
    ISTIO_INGRESS_NETWORK_PROMQL,
    ISTIO_WORKLOAD_ERR_QPS_PROMQL,
    ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL,
    ISTIO_WORKLOAD_QPS_PROMQL,
    ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL,
    ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL,
    ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'DeployCard',
    mixins: [BasePermission, BaseResource],
    props: {
      status: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        requestsNow: null,
        requestsSumOverTime: null,
        avgresponsetimeP99: null,
        avgresponsetimeP95: null,
        errrequestsSum: null,
        errrequestsSumOverTime: null,
        networkIngress: null,
        networkEgress: null,

        timeInterval: null,
      };
    },
    watch: {
      status() {
        if (!this.timeInterval) {
          this.loadMetrics();
          this.timeInterval = setInterval(() => {
            this.loadMetrics();
          }, 30000);
        }
      },
    },
    destroyed() {
      if (this.timeInterval) clearInterval(this.timeInterval);
    },
    methods: {
      loadMetrics() {
        this.istioWorkloadRequestCountNow(true);
        this.istioWorkloadRequestSumOverTime(true);

        this.istioWorkloadResponseDurationSecondsP99(true);
        this.istioWorkloadResponseDurationSecondsP95(true);

        this.istioWorkloadErrResponseSum(true);
        this.istioWorkloadErrResponseSumOverTime(true);

        this.istioWorkloadNetworkIngressSum(true);
        this.istioWorkloadNetworkEgressSum(true);
      },
      async istioWorkloadRequestCountNow(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_QPS_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.requestsNow = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1]).toFixed(2);
        });
      },
      async istioWorkloadRequestSumOverTime(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.requestsSumOverTime = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1]).toFixed(2);
        });
      },

      async istioWorkloadResponseDurationSecondsP99(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL.replaceAll(
            '$1',
            this.$route.params.name,
          ).replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.avgresponsetimeP99 = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1] * 1000).toFixed(2);
        });
      },
      async istioWorkloadResponseDurationSecondsP95(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL.replaceAll(
            '$1',
            this.$route.params.name,
          ).replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.avgresponsetimeP95 = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1] * 1000).toFixed(2);
        });
      },

      async istioWorkloadErrResponseSum(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_ERR_QPS_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.errrequestsSum = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1]).toFixed(2);
        });
      },
      async istioWorkloadErrResponseSumOverTime(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.errrequestsSumOverTime = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1]).toFixed(2);
        });
      },

      async istioWorkloadNetworkIngressSum(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_INGRESS_NETWORK_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.networkIngress = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1] / 1024).toFixed(2);
        });
      },
      async istioWorkloadNetworkEgressSum(noprocess = false) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: ISTIO_EGRESS_NETWORK_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
            '$2',
            this.$route.query.namespace,
          ),
          noprocessing: noprocess,
        });
        data.forEach((d) => {
          this.networkEgress = parseFloat(isNaN(d?.value[1]) ? 0 : d.value[1] / 1024).toFixed(2);
        });
      },
    },
  };
</script>
