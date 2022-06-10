<template>
  <v-card>
    <v-card-title class="pt-2 pb-0">
      <v-flex>
        <v-flex class="float-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker
              v-model="date"
              :default-value="30"
              @change="onDatetimeChange(undefined)"
            />
          </v-sheet>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="outqps"
            title="出口流量qps"
            :metrics="qpsMetrics"
            label="destination_workload"
            type=""
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="outTime"
            title="出口流量响应时间"
            :metrics="responseDurationMetrics"
            label="destination_workload"
            type="timecost"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="in80Qps"
            title="80端口入口流量qps"
            :metrics="downstream80QpsMetrics"
            label="pod"
            type=""
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="in80Time"
            title="80端口入口流量响应时间"
            :metrics="downstream80ResponseDurationMetrics"
            label="pod"
            type="timecost"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="in443Qps"
            title="443端口入口流量qps"
            :metrics="downstream443QpsMetrics"
            label="pod"
            type=""
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="in443Time"
            title="443端口入口流量响应时间"
            :metrics="downstream443ResponseDurationMetrics"
            label="pod"
            type="timecost"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import {
  ISTIO_INGRESS_GATEWAY_QPS_PROMQL,
  ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_QPS_PROMQL,
  ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_QPS_PROMQL,
  ISTIO_INGRESS_GATEWAY_REPONSE_DURATION_PROMQL,
  ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_RESPONSE_DURATION_PROMQL,
  ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_RESPONSE_DURATION_PROMQL,
} from '@/utils/prometheus'
import { SERVICE_GATEWAY_NS } from '@/utils/namespace'

export default {
  name: 'GatewayMonitor',
  mixins: [BaseResource, BasePermission],
  props: {
    gateway: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    qpsMetrics: [],
    downstream80QpsMetrics: [],
    downstream443QpsMetrics: [],
    responseDurationMetrics: [],
    downstream80ResponseDurationMetrics: [],
    downstream443ResponseDurationMetrics: [],
    timeinterval: null,
    date: [],
    params: {
      start: '',
      end: '',
    },
  }),
  computed: {
    ...mapState(['Scale']),
  },
  watch: {
    gateway() {
      this.loadMetrics()
    },
  },
  destroyed() {
    if (this.timeinterval) clearInterval(this.timeinterval)
  },
  mounted() {
    this.$nextTick(() => {
      this.onDatetimeChange()
    })
  },
  methods: {
    async loadMetrics() {
      if (this.timeinterval) clearInterval(this.timeinterval)
      this.loadData()
      this.timeinterval = setInterval(() => {
        this.params.start = this.$moment(this.params.start)
          .utc()
          .add(30, 'seconds')
          .format()
        this.params.end = this.$moment(this.params.end)
          .utc()
          .add(30, 'seconds')
          .format()
        this.loadData()
      }, 1000 * 30)
    },
    async loadData() {
      this.ingressGatewayQPS()
      this.ingressGatewayDownstream80QPS()
      this.ingressGatewayDownstream443QPS()
      this.ingressGatewayResponseDuration()
      this.ingressGatewayDownstream80ResponseDuration()
      this.ingressGatewayDownstream443ResponseDuration()
    },
    async ingressGatewayQPS() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_QPS_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.qpsMetrics = data
    },
    async ingressGatewayDownstream80QPS() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_QPS_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.downstream80QpsMetrics = data
    },
    async ingressGatewayDownstream443QPS() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_QPS_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.downstream443QpsMetrics = data
    },
    async ingressGatewayResponseDuration() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_REPONSE_DURATION_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.responseDurationMetrics = data
    },
    async ingressGatewayDownstream80ResponseDuration() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_RESPONSE_DURATION_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.downstream80ResponseDurationMetrics = data
    },
    async ingressGatewayDownstream443ResponseDuration() {
      const data = await this.m_permission_matrix(
        this.$route.query.cluster,
        Object.assign(this.params, {
          query: ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_RESPONSE_DURATION_PROMQL
            .replaceAll('$1', SERVICE_GATEWAY_NS)
            .replaceAll('$2', this.gateway ? this.gateway.Name : ''),
          noprocessing: true,
        }),
      )
      if (data) this.downstream443ResponseDurationMetrics = data
    },
    onDatetimeChange() {
      this.params.start = this.$moment(this.date[0]).utc().format()
      this.params.end = this.$moment(this.date[1]).utc().format()
      this.loadMetrics()
    },
  },
}
</script>
