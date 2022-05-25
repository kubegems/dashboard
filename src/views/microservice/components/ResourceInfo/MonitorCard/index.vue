<template>
  <v-row>
    <v-col
      :cols="4"
      class="py-0"
    >
      <v-card
        class="mb-0 px-2 pt-1"
        height="100%"
      >
        <WorkloadInfo :item="workload" />
      </v-card>
    </v-col>
    <v-col
      :cols="2"
      class="py-0"
    >
      <v-card
        class="mb-0"
        height="265px"
      >
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__detail mx-3">请求量</h4>
          <div class="d-flex align-center mt-2">
            <div class="border-right px-3 py-2">
              <h6
                class="
                  font-weight-light
                  text-body-2
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                "
              >
                实时速率
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ requestsNow }}
              </span>
            </div>
            <div class="px-3 py-2">
              <h6
                class="
                  font-weight-light
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                  text-body-2
                "
              >
                过去24h
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ requestsSumOverTime }}
              </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="requests"
          title=""
          :metrics="requests"
          type=""
          mini
          :label-show="false"
          :extend-height="150"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        />
      </v-card>
    </v-col>
    <v-col
      :cols="2"
      class="py-0"
    >
      <v-card
        class="mb-0"
        height="265px"
      >
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__detail mx-3">响应时间</h4>
          <div class="d-flex align-center mt-2">
            <div class="border-right px-3 py-2">
              <h6
                class="
                  font-weight-light
                  text-body-2
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                "
              >
                p99
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ avgresponsetimeP99 }} ms
              </span>
            </div>
            <div class="px-3 py-2">
              <h6
                class="
                  font-weight-light
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                  text-body-2
                "
              >
                p95
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ avgresponsetimeP95 }} ms
              </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="avgresponsetime"
          title=""
          :metrics="avgresponsetime"
          type=""
          mini
          :label-show="false"
          :extend-height="150"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        />
      </v-card>
    </v-col>
    <v-col
      :cols="2"
      class="py-0"
    >
      <v-card
        class="mb-0"
        height="265px"
      >
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__detail mx-3">
            异常请求数
          </h4>
          <div class="d-flex align-center mt-2">
            <div class="border-right px-3 py-2">
              <h6
                class="
                  font-weight-light
                  text-body-2
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                "
              >
                实时
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ errrequestsSum }}
              </span>
            </div>
            <div class="px-3 py-2">
              <h6
                class="
                  font-weight-light
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                  text-body-2
                "
              >
                过去24h
              </h6>
              <span class="font-weight-medium text-body-2">{{
                errrequestsSumOverTime
              }}</span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="errrequests"
          title=""
          :metrics="errrequests"
          type=""
          mini
          :label-show="false"
          :extend-height="150"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        />
      </v-card>
    </v-col>
    <v-col
      :cols="2"
      class="py-0"
    >
      <v-card
        class="mb-0"
        height="265px"
      >
        <div class="pa-2">
          <h4 class="font-weight-regular text-title kubegems__detail mx-3">流量</h4>
          <div class="d-flex align-center mt-2">
            <div class="border-right px-3 py-2">
              <h6
                class="
                  font-weight-light
                  text-body-2
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                "
              >
                实时ingress
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ networkIngress }} Kbps
              </span>
            </div>
            <div class="px-3 py-2">
              <h6
                class="
                  font-weight-light
                  blue-grey--text
                  text--lighten-2
                  font-weight-regular
                  text-body-2
                "
              >
                实时egress
              </h6>
              <span class="font-weight-medium text-body-2">
                {{ networkEgress }} Kbps
              </span>
            </div>
          </div>
        </div>

        <BaseApexAreaChart
          id="network"
          title=""
          :metrics="network"
          type=""
          mini
          :label-show="false"
          :extend-height="150"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import WorkloadInfo from './WorkloadInfo'
import BasePermission from '@/mixins/permission'
import {
  ISTIO_WORKLOAD_QPS_PROMQL,
  ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL,
  ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL,
  ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL,
  ISTIO_WORKLOAD_ERR_QPS_PROMQL,
  ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL,
  ISTIO_EGRESS_NETWORK_PROMQL,
  ISTIO_INGRESS_NETWORK_PROMQL,
} from '@/utils/prometheus'

export default {
  name: 'MonitorCard',
  components: { WorkloadInfo },
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
    }
  },
  computed: {
    ...mapState(['Scale']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(workload) {
      this.workload = workload
      this.loadMetrics()
    },
    loadMetrics() {
      this.params.start = this.$moment().utc().add(-2, 'hours').format()
      this.params.end = this.$moment().utc().format()
      this.istioWorkloadRequestCount(true)
      this.istioWorkloadRequestCountNow(true)
      this.istioWorkloadRequestSumOverTime(true)

      this.istioWorkloadResponseDurationSeconds(true)
      this.istioWorkloadResponseDurationSecondsP99(true)
      this.istioWorkloadResponseDurationSecondsP95(true)

      this.istioWorkloadErrResponseCount(true)
      this.istioWorkloadErrResponseSum(true)
      this.istioWorkloadErrResponseSumOverTime(true)

      this.istioWorkloadNetwork(true)
      this.istioWorkloadNetworkIngressSum(true)
      this.istioWorkloadNetworkEgressSum(true)
    },
    async istioWorkloadRequestCount(noprocess = false) {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_WORKLOAD_QPS_PROMQL
            .replaceAll('$1', this.$route.params.name)
            .replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        }),
      )
      if (data) {
        if (data && data.length > 0) data[0].metric['name'] = '请求量'
        this.requests = data
      }
    },
    async istioWorkloadRequestCountNow(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_QPS_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.requestsNow = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1],
        ).toFixed(2)
      })
    },
    async istioWorkloadRequestSumOverTime(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.requestsSumOverTime = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1],
        ).toFixed(2)
      })
    },

    async istioWorkloadResponseDurationSeconds(noprocess = false) {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL
            .replaceAll('$1', this.$route.params.name)
            .replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        }),
      )
      if (data) {
        if (data && data.length > 0) data[0].metric['name'] = '平均响应时间'
        this.avgresponsetime = data
      }
    },
    async istioWorkloadResponseDurationSecondsP95(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.avgresponsetimeP95 = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1] * 1000,
        ).toFixed(2)
      })
    },
    async istioWorkloadResponseDurationSecondsP99(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.avgresponsetimeP99 = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1] * 1000,
        ).toFixed(2)
      })
    },

    async istioWorkloadErrResponseCount(noprocess = false) {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_WORKLOAD_ERR_QPS_PROMQL
            .replaceAll('$1', this.$route.params.name)
            .replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        }),
      )
      if (data) {
        if (data && data.length > 0) data[0].metric['name'] = '异常请求数'
        this.errrequests = data
      }
    },
    async istioWorkloadErrResponseSum(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_ERR_QPS_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.errrequestsSum = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1],
        ).toFixed(2)
      })
    },
    async istioWorkloadErrResponseSumOverTime(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.errrequestsSumOverTime = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1],
        ).toFixed(2)
      })
    },

    async istioWorkloadNetwork(noprocess = false) {
      const data1 = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_NETWORK_PROMQL
            .replaceAll('$1', this.$route.params.name)
            .replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        }),
      )
      if (data1 && data1.length > 0) data1[0].metric['name'] = 'ingress流量'
      const data2 = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_EGRESS_NETWORK_PROMQL
            .replaceAll('$1', this.$route.params.name)
            .replaceAll('$2', this.$route.query.namespace),
          noprocessing: noprocess,
        }),
      )
      if (data2 && data2.length > 0) data2[0].metric['name'] = 'egress流量'

      let data = []
      if (data1) data = data.concat(data1)
      if (data2) data = data.concat(data2)
      this.network = data
    },
    async istioWorkloadNetworkIngressSum(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_INGRESS_NETWORK_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.networkIngress = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1] / 1024,
        ).toFixed(2)
      })
    },
    async istioWorkloadNetworkEgressSum(noprocess = false) {
      const data = await this.m_permission_vector(this.$route.query.cluster, {
        query: ISTIO_EGRESS_NETWORK_PROMQL
          .replaceAll('$1', this.$route.params.name)
          .replaceAll('$2', this.$route.query.namespace),
        noprocessing: noprocess,
      })
      data.forEach((d) => {
        this.networkEgress = parseFloat(
          isNaN(d?.value[1]) ? 0 : d.value[1] / 1024,
        ).toFixed(2)
      })
    },
  },
}
</script>
