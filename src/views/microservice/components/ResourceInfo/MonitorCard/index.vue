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
    <v-col class="py-0" :cols="4">
      <v-card class="mb-0 px-2 pt-1" flat height="100%">
        <WorkloadInfo :item="workload" />
      </v-card>
    </v-col>
    <v-col class="py-0" :cols="2">
      <v-card class="mb-0" flat height="265px">
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__text mx-3">{{ $t('tip.request_count') }}</h4>
          <div class="d-flex align-center mt-2">
            <v-btn class="elevation-0 ml-4" color="primary" dark fab small>
              <v-icon>mdi-camera-timer</v-icon>
            </v-btn>
            <div class="border-right px-3 py-2">
              <h6 class="font-weight-light text-body-2 blue-grey--text text--lighten-2 font-weight-regular">
                {{ $t('tip.realtime_rate') }}
              </h6>
              <span class="font-weight-medium text-caption">
                {{ requestsNow }}
              </span>
            </div>
            <div class="px-3 py-2">
              <h6 class="font-weight-light blue-grey--text text--lighten-2 font-weight-regular text-body-2">
                {{ $t('tip.last_24_hours') }}
              </h6>
              <span class="font-weight-medium text-caption">
                {{ requestsSumOverTime }}
              </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="requests"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :extend-height="150"
          :label-show="false"
          :metrics="requests"
          mini
          title=""
          type=""
        />
      </v-card>
    </v-col>
    <v-col class="py-0" :cols="2">
      <v-card class="mb-0" flat height="265px">
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__text mx-3">{{ $t('tip.response_time') }}</h4>
          <div class="d-flex align-center mt-2">
            <v-btn class="elevation-0 ml-4" color="primary" dark fab small>
              <v-icon>mdi-clock</v-icon>
            </v-btn>
            <div class="border-right px-3 py-2">
              <h6 class="font-weight-light text-body-2 blue-grey--text text--lighten-2 font-weight-regular"> p99 </h6>
              <span class="font-weight-medium text-caption"> {{ avgresponsetimeP99 }} ms </span>
            </div>
            <div class="px-3 py-2">
              <h6 class="font-weight-light blue-grey--text text--lighten-2 font-weight-regular text-body-2"> p95 </h6>
              <span class="font-weight-medium text-caption"> {{ avgresponsetimeP95 }} ms </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="avgresponsetime"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :extend-height="150"
          :label-show="false"
          :metrics="avgresponsetime"
          mini
          title=""
          type=""
        />
      </v-card>
    </v-col>
    <v-col class="py-0" :cols="2">
      <v-card class="mb-0" flat height="265px">
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__text mx-3"> {{ $t('tip.error_request') }} </h4>
          <div class="d-flex align-center mt-2">
            <v-btn class="elevation-0 ml-4" color="primary" dark fab small>
              <v-icon>mdi-alarm-panel-outline</v-icon>
            </v-btn>
            <div class="border-right px-3 py-2">
              <h6 class="font-weight-light text-body-2 blue-grey--text text--lighten-2 font-weight-regular">
                {{ $t('tip.realtime') }}
              </h6>
              <span class="font-weight-medium text-caption">
                {{ errrequestsSum }}
              </span>
            </div>
            <div class="px-3 py-2">
              <h6 class="font-weight-light blue-grey--text text--lighten-2 font-weight-regular text-body-2">
                {{ $t('tip.last_24_hours') }}
              </h6>
              <span class="font-weight-medium text-caption">{{ errrequestsSumOverTime }}</span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="errrequests"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :extend-height="150"
          :label-show="false"
          :metrics="errrequests"
          mini
          title=""
          type=""
        />
      </v-card>
    </v-col>
    <v-col class="py-0" :cols="2">
      <v-card class="mb-0" flat height="265px">
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__text mx-3">{{ $t('tip.traffic') }}</h4>
          <div class="d-flex align-center mt-2">
            <v-btn class="elevation-0 ml-4" color="primary" dark fab small>
              <v-icon>mdi-earth</v-icon>
            </v-btn>
            <div class="border-right px-3 py-2">
              <h6 class="font-weight-light text-body-2 blue-grey--text text--lighten-2 font-weight-regular">
                ingress
              </h6>
              <span class="font-weight-medium text-caption"> {{ networkIngress }} Kbps </span>
            </div>
            <div class="px-3 py-2">
              <h6 class="font-weight-light blue-grey--text text--lighten-2 font-weight-regular text-body-2">
                egress
              </h6>
              <span class="font-weight-medium text-caption"> {{ networkEgress }} Kbps </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="network"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :extend-height="150"
          :label-show="false"
          :metrics="network"
          mini
          title=""
          type=""
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import WorkloadInfo from './WorkloadInfo';
  import BasePermission from '@/mixins/permission';
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
    name: 'MonitorCard',
    i18n: {
      messages: messages,
    },
    components: {
      WorkloadInfo,
    },
    mixins: [BasePermission],
    data() {
      return {
        requests: [],
        requestsNow: 0,
        requestsSumOverTime: 0,
        avgresponsetime: [],
        avgresponsetimeP95: 0,
        avgresponsetimeP99: 0,
        errrequests: [],
        errrequestsSum: 0,
        errrequestsSumOverTime: 0,
        network: [],
        networkIngress: 0,
        networkEgress: 0,
        params: {
          start: '',
          end: '',
        },
        workload: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    methods: {
      init(workload) {
        this.workload = workload;
        this.loadMetrics();
      },
      loadMetrics() {
        this.params.start = this.$moment().utc().add(-2, 'hours').format();
        this.params.end = this.$moment().utc().format();
        this.istioWorkloadRequestCount(true);
        this.istioWorkloadRequestCountNow(true);
        this.istioWorkloadRequestSumOverTime(true);

        this.istioWorkloadResponseDurationSeconds(true);
        this.istioWorkloadResponseDurationSecondsP99(true);
        this.istioWorkloadResponseDurationSecondsP95(true);

        this.istioWorkloadErrResponseCount(true);
        this.istioWorkloadErrResponseSum(true);
        this.istioWorkloadErrResponseSumOverTime(true);

        this.istioWorkloadNetwork(true);
        this.istioWorkloadNetworkIngressSum(true);
        this.istioWorkloadNetworkEgressSum(true);
      },
      async istioWorkloadRequestCount(noprocess = false) {
        const data = await this.m_permission_matrix(
          this.$route.query.cluster,
          Object.assign(this.params, {
            query: ISTIO_WORKLOAD_QPS_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
              '$2',
              this.$route.query.namespace,
            ),
            noprocessing: noprocess,
          }),
        );
        if (data) {
          if (data && data.length > 0) data[0].metric['name'] = this.$t('tip.request_count');
          this.requests = data;
        }
      },
      async istioWorkloadRequestCountNow(noprocess = false) {
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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

      async istioWorkloadResponseDurationSeconds(noprocess = false) {
        const data = await this.m_permission_matrix(
          this.$route.query.cluster,
          Object.assign(this.params, {
            query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL.replaceAll(
              '$1',
              this.$route.params.name,
            ).replaceAll('$2', this.$route.query.namespace),
            noprocessing: noprocess,
          }),
        );
        if (data) {
          if (data && data.length > 0) data[0].metric['name'] = this.$t('tip.response_time');
          this.avgresponsetime = data;
        }
      },
      async istioWorkloadResponseDurationSecondsP95(noprocess = false) {
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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
      async istioWorkloadResponseDurationSecondsP99(noprocess = false) {
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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

      async istioWorkloadErrResponseCount(noprocess = false) {
        const data = await this.m_permission_matrix(
          this.$route.query.cluster,
          Object.assign(this.params, {
            query: ISTIO_WORKLOAD_ERR_QPS_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
              '$2',
              this.$route.query.namespace,
            ),
            noprocessing: noprocess,
          }),
        );
        if (data) {
          if (data && data.length > 0) data[0].metric['name'] = this.$t('tip.error_request');
          this.errrequests = data;
        }
      },
      async istioWorkloadErrResponseSum(noprocess = false) {
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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

      async istioWorkloadNetwork(noprocess = false) {
        const data1 = await this.m_permission_matrix(
          this.$route.query.cluster,
          Object.assign(this.params, {
            query: ISTIO_INGRESS_NETWORK_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
              '$2',
              this.$route.query.namespace,
            ),
            noprocessing: noprocess,
          }),
        );
        if (data1 && data1.length > 0) data1[0].metric['name'] = `ingress${this.$t('tip.traffic')}`;
        const data2 = await this.m_permission_matrix(
          this.$route.query.cluster,
          Object.assign(this.params, {
            query: ISTIO_EGRESS_NETWORK_PROMQL.replaceAll('$1', this.$route.params.name).replaceAll(
              '$2',
              this.$route.query.namespace,
            ),
            noprocessing: noprocess,
          }),
        );
        if (data2 && data2.length > 0) data2[0].metric['name'] = `egress${this.$t('tip.traffic')}`;

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        this.network = data;
      },
      async istioWorkloadNetworkIngressSum(noprocess = false) {
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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
        const data = await this.m_permission_vector(this.$route.query.cluster, {
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
