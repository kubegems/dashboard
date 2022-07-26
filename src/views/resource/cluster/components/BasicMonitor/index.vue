<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-card class="rounded-b-0" flat height="45%">
    <v-card-text class="primary pa-0" style="height: 100%">
      <div class="d-flex">
        <div class="d-flex space-and-grow">
          <div>
            <h1 class="white--text text-h4 mt-4">
              <BaseLogo class="mx-3" :icon-name="cluster ? cluster.Vendor : ''" :width="60" />
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
              :metrics="apiServerSuccessRate"
              title="API请求成功率"
              type=""
              :width="65"
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
              :item="componentStatus.ETCD && componentStatus.ETCD.Reasons ? componentStatus.ETCD.Reasons : ['未知']"
              title="原因"
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
              :item="
                componentStatus.Scheduler && componentStatus.Scheduler.Reasons
                  ? componentStatus.Scheduler.Reasons
                  : ['未知']
              "
              title="原因"
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
              :item="
                componentStatus.APIServer && componentStatus.APIServer.Reasons
                  ? componentStatus.APIServer.Reasons
                  : ['未知']
              "
              title="原因"
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
              :item="
                componentStatus.ControllerManager && componentStatus.ControllerManager.Reasons
                  ? componentStatus.ControllerManager.Reasons
                  : ['未知']
              "
              title="原因"
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

  import SampleAreaChart from './SampleAreaChart';
  import Tips from './Tips';
  import { getClusterCertInfo, getClusterComponentStatus } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { CLUSTER_API_SERVER_SUCCESS_RATE_PROMQL } from '@/utils/prometheus';

  export default {
    name: 'BasicMonitor',
    components: {
      SampleAreaChart,
      Tips,
    },
    mixins: [BasePermission, BaseResource],

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
