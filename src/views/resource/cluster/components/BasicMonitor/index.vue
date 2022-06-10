<template>
  <v-card flat height="45%" class="rounded-b-0">
    <v-card-text class="primary pa-0" style="height: 100%">
      <div class="d-flex">
        <div class="d-flex space-and-grow">
          <div>
            <h1 class="white--text text-h4 mt-4">
              <BaseLogo :icon-name="cluster ? cluster.Vendor : ''" :width="60" class="mx-3" />
            </h1>
          </div>
          <div class="ml-4 mt-2" style="flex-grow: 2">
            <h3 class="card-text-h4 white--text text-h5 font-weight-regular">
              {{ cluster && cluster.ClusterName ? cluster.ClusterName : '' }}
            </h3>
            <h6 class="card-subtitle white--text text-subtitle-1 font-weight-regular mb-2">
              {{ cluster && cluster.Version ? cluster.Version : '' }}
            </h6>
            <span class="texture-left pa-1 text-caption">证书有效期:</span>
            <span class="texture-right pa-1 text-caption">{{
              certInfo && certInfo.ExpiredAt ? $moment(certInfo.ExpiredAt).format('YYYY/MM/DD h:mm') : ''
            }}</span>
          </div>
          <div :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`" style="flex-grow: 2">
            <SampleAreaChart
              class="pa-4 float-right"
              :extend-height="100"
              :width="65"
              title="API请求成功率"
              :metrics="apiServerSuccessRate"
              type=""
            />
          </div>
        </div>
        <div class="d-flex justify-space-between px-4 fix">
          <div class="d-flex">
            <h4 class="white--text text-body-2 text-nowrap mr-1">ETCD</h4>
            <v-icon v-if="componentStatus.ETCD && componentStatus.ETCD.IsHealthy" color="success" small>
              mdi-heart-pulse
            </v-icon>
            <Tips
              v-else
              title="原因"
              :item="componentStatus.ETCD && componentStatus.ETCD.Reasons ? componentStatus.ETCD.Reasons : ['未知']"
            >
              <template #default="scopeData">
                <v-icon class="mt-1" color="error" small v-on="scopeData.on"> mdi-heart-broken </v-icon>
              </template>
            </Tips>
          </div>
          <div class="d-flex">
            <h4 class="white--text text-body-2 text-nowrap mr-1"> Schedule </h4>
            <v-icon v-if="componentStatus.Scheduler && componentStatus.Scheduler.IsHealthy" color="success" small>
              mdi-heart-pulse
            </v-icon>
            <Tips
              v-else
              title="原因"
              :item="
                componentStatus.Scheduler && componentStatus.Scheduler.Reasons
                  ? componentStatus.Scheduler.Reasons
                  : ['未知']
              "
            >
              <template #default="scopeData">
                <v-icon class="mt-1" color="error" small v-on="scopeData.on"> mdi-heart-broken </v-icon>
              </template>
            </Tips>
          </div>
          <div class="d-flex">
            <h4 class="white--text text-body-2 text-nowrap mr-1"> APIServer </h4>
            <v-icon v-if="componentStatus.APIServer && componentStatus.APIServer.IsHealthy" color="success" small>
              mdi-heart-pulse
            </v-icon>
            <Tips
              v-else
              title="原因"
              :item="
                componentStatus.APIServer && componentStatus.APIServer.Reasons
                  ? componentStatus.APIServer.Reasons
                  : ['未知']
              "
            >
              <template #default="scopeData">
                <v-icon class="mt-1" color="error" small v-on="scopeData.on"> mdi-heart-broken </v-icon>
              </template>
            </Tips>
          </div>
          <div class="d-flex">
            <h4 class="white--text text-body-2 text-nowrap mr-1"> ControllerManager </h4>
            <v-icon
              v-if="componentStatus.ControllerManager && componentStatus.ControllerManager.IsHealthy"
              color="success"
              small
            >
              mdi-heart-pulse
            </v-icon>
            <Tips
              v-else
              title="原因"
              :item="
                componentStatus.ControllerManager && componentStatus.ControllerManager.Reasons
                  ? componentStatus.ControllerManager.Reasons
                  : ['未知']
              "
            >
              <template #default="scopeData">
                <v-icon class="mt-1" color="error" small v-on="scopeData.on"> mdi-heart-broken </v-icon>
              </template>
            </Tips>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { getClusterComponentStatus, getClusterCertInfo } from '@/api';
  import Tips from './Tips';
  import SampleAreaChart from './SampleAreaChart';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';
  import { CLUSTER_API_SERVER_SUCCESS_RATE_PROMQL } from '@/utils/prometheus';

  export default {
    name: 'BasicMonitor',
    components: {
      Tips,
      SampleAreaChart,
    },
    mixins: [BaseResource, BasePermission],

    props: {
      cluster: {
        type: Object,
        default: () => null,
      },
      params: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      timeinterval: null,
      apiServerSuccessRate: [],
      componentStatus: {},
      certInfo: {},
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Cluster']),
    },
    watch: {
      params: {
        handler: function () {
          this.loadMetrics();
        },
        deep: true,
      },
    },
    mounted() {
      this.clusterComponentStatus();
      this.clusterCertInfo();
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      async clusterComponentStatus() {
        this.componentStatus = await getClusterComponentStatus(this.$route.params.name, {
          noprocessing: true,
        });
      },
      async clusterCertInfo() {
        this.certInfo = await getClusterCertInfo(this.$route.params.name, 'apiserver', {
          noprocessing: true,
        });
      },
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.loadData();
        }, 1000 * 300);
      },
      async loadData() {
        this.clusterApiServerSuccessRate();
      },
      async clusterApiServerSuccessRate() {
        const data = await this.m_permission_matrix(
          this.$route.params.name,
          Object.assign(this.params, {
            noprocessing: true,
            query: escape(CLUSTER_API_SERVER_SUCCESS_RATE_PROMQL),
          }),
        );
        this.apiServerSuccessRate = data;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fix {
    position: absolute;
    bottom: 5px;
    width: 100%;
  }
  .space-and-grow {
    justify-content: space-around;
    flex-grow: 1;
  }
  .texture-left {
    color: white;
    background-color: rgb(2, 196, 221);
  }
  .texture-right {
    color: white;
    background-color: rgb(0, 187, 212);
  }
</style>
