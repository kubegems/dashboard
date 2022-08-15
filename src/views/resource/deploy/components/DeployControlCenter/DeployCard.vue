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
  <v-row>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>mdi-camera-timer</v-icon>
            </v-btn>
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> {{ $t('tip.realtime_rate') }} : {{ requestsNow ? requestsNow : 0 }} </v-flex>
              <v-flex class="text-body-2">
                {{ $t('tip.last_24_hours') }} : {{ requestsSumOverTime ? requestsSumOverTime : 0 }}
              </v-flex>
              <h5 class="text-subtitle-2 kubegems__text mt-2"> {{ $t('tip.total_request') }} </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>mdi-clock</v-icon>
            </v-btn>
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> p99 : {{ avgresponsetimeP99 ? avgresponsetimeP99 : 0 }} ms </v-flex>
              <v-flex class="text-body-2"> p95 : {{ avgresponsetimeP95 ? avgresponsetimeP95 : 0 }} ms </v-flex>
              <h5 class="text-subtitle-2 kubegems__text mt-2"> {{ $t('tip.response_time') }} </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>mdi-alarm-panel-outline</v-icon>
            </v-btn>
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2">
                {{ $t('tip.realtime') }} : {{ errrequestsSum ? errrequestsSum : 0 }}
              </v-flex>
              <v-flex class="text-body-2">
                {{ $t('tip.last_24_hours') }} :
                {{ errrequestsSumOverTime ? errrequestsSumOverTime : 0 }}
              </v-flex>
              <h5 class="text-subtitle-2 kubegems__text mt-2"> {{ $t('tip.error_request_count') }} </h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pt-0" cols="3">
      <v-card flat height="100%">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>mdi-earth</v-icon>
            </v-btn>
            <div class="ml-2 mr-1">
              <v-flex class="text-body-2"> {{ $t('tip.in') }} : {{ networkIngress ? networkIngress : 0 }} Kbps </v-flex>
              <v-flex class="text-body-2"> {{ $t('tip.out') }} : {{ networkEgress ? networkEgress : 0 }} Kbps </v-flex>
              <h5 class="text-subtitle-2 kubegems__text mt-2">{{ $t('tip.traffic') }}</h5>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import messages from '../../i18n';
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
    i18n: {
      messages: messages,
    },
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
