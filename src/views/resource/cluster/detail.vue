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
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn color="primary" small text @click="overScaleResource">
            <v-icon left small> mdi-scale </v-icon>
            {{ $t('tip.resource_oversold') }}
          </v-btn>
          <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text @click="kuberCtl"> Kubectl </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="updateCluster"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex v-if="cluster && !cluster.Primary">
                  <v-btn color="error" small text @click="removeCluster"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row>
      <v-col class="pb-2" cols="12" lg="4">
        <BasicMonitor :cluster="cluster" :params="params" />
        <ResourceInfo :cluster="cluster" :quota="quota" :workload="workload" />
      </v-col>

      <v-col class="pb-2" cols="12" lg="8">
        <MetricMonitor :params="params" />
      </v-col>

      <v-col v-for="(key, index) in resources" :key="index" class="down-top-padding pt-1 pb-2" cols="2">
        <v-card>
          <v-card-text class="pa-5">
            <div class="d-flex align-center">
              <v-btn class="elevation-0" color="primary" dark fab small>
                <v-icon>{{ $RESOURCE_ICON[key] }}</v-icon>
              </v-btn>
              <div class="ml-2 mr-1">
                <h2 class="text-h6"> {{ workload[key] }} </h2>
                <h4 class="font-weight-regular mt-1">
                  {{ $root.$t(`resource.${$RESOURCE_EN[key]}`) }}
                </h4>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <ResourceChart :cluster="cluster" :quota="quota" />
    <Terminal ref="terminal" />
    <UpdateCluster ref="updateCluster" @refresh="clusterDetail" />
    <OverScaleResource ref="overScaleResource" @refresh="clusterDetail" />
  </v-container>
</template>
<script>
  import { mapGetters, mapState } from 'vuex';

  import BasicMonitor from './components/BasicMonitor';
  import MetricMonitor from './components/MetricMonitor';
  import OverScaleResource from './components/OverScaleResource';
  import ResourceChart from './components/ResourceChart';
  import ResourceInfo from './components/ResourceInfo';
  import UpdateCluster from './components/UpdateCluster';
  import messages from './i18n';
  import { deleteCluster, getClusterDetail, getClusterQuota } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { CLUSTER_POD_CAPACITY_PROMQL } from '@/utils/prometheus';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'ClusterDetail',
    i18n: {
      messages: messages,
    },
    components: {
      BasicMonitor,
      MetricMonitor,
      OverScaleResource,
      ResourceChart,
      ResourceInfo,
      Terminal,
      UpdateCluster,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    data: () => ({
      cluster: null,
      quota: null,
      workload: null,
      resources: [],
      date: [],
      params: {
        start: '',
        end: '',
      },
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Cluster']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.clusterDetail();
          this.onDatetimeChange();
        });
      }
    },
    methods: {
      async clusterDetail() {
        const data = await getClusterDetail(this.$route.query.id, {
          noprocessing: true,
        });
        this.cluster = data;
        if (!this.cluster.OversoldConfig) {
          this.cluster.OversoldConfig = {
            cpu: 1,
            memory: 1,
            storage: 1,
          };
        }
        await this.$store.dispatch('UPDATE_CLUSTER_DATA');
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.$router.replace({
          params: { cluster: data.ClusterName },
          query: {
            ...this.$route.query,
          },
        });
        this.clusterQuota();
        this.$store.commit('SET_LATEST_CLUSTER', { cluster: data.ClusterName });
      },
      async clusterQuota() {
        const data = await getClusterQuota(this.cluster.ID, {
          noprocessing: false,
        });
        const query = CLUSTER_POD_CAPACITY_PROMQL;
        const pods = await this.m_permission_vector(this.cluster.ClusterName, {
          query: query,
          noprocessing: true,
        });
        if (data.resources) {
          data.resources.capacity.pods = pods ? (pods && pods.length ? parseInt(pods[0]?.value[1] || 0) : 0) : 0;
          data.resources.used.pods = data.workloads.pods;

          this.quota = data.resources;
          this.workload = data.workloads;
          this.resources = Object.keys(this.workload).filter((i) => {
            return this.$RESOURCE_CN[i] !== undefined && this.$RESOURCE_CN[i] !== this.$root.$t('resource.node');
          });
        }
      },
      kuberCtl() {
        this.$refs.terminal.init(null, this.cluster, 'kubectl');
        this.$refs.terminal.open();
      },
      updateCluster() {
        this.$refs.updateCluster.init(this.cluster);
        this.$refs.updateCluster.open();
      },
      removeCluster() {
        const item = this.cluster;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.cluster')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.cluster')])} ${item.ClusterName}`,
            type: 'delete',
            name: item.ClusterName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteCluster(param.item.ID);
            this.$store.commit('CLEAR_CLUSTER');
            this.$store.dispatch('UPDATE_CLUSTER_DATA');
            this.$router.push({ name: 'cluster-center' });
          },
        });
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
      },
      overScaleResource() {
        this.$refs.overScaleResource.init(this.cluster);
        this.$refs.overScaleResource.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .icon--large {
    width: 40px;
    height: 40px;
  }
  .down-top-padding {
    :first-of-type {
      padding-top: 0;
      padding-bottom: 0;
      padding-left: 20;
    }
  }
  .cluster__resource__div {
    max-height: 44px;
    overflow: hidden;
    background: none;
    border: none;
  }
</style>
