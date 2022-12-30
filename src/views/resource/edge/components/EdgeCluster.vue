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
  <div class="mt-3">
    <v-row>
      <v-col class="pb-2" cols="12" lg="4">
        <BasicMonitor :cluster="cluster" :has-etcd="false" :params="params" />
        <ResourceInfo :cluster="cluster" :quota="quota" :workload="workloadsStatistics" />
      </v-col>

      <v-col class="pb-2" cols="12" lg="8">
        <MetricMonitor :params="params" />
      </v-col>

      <v-col v-for="(key, index) in resources" :key="index" class="down-top-padding pt-1 pb-2" cols="2">
        <v-card>
          <v-card-text class="pa-5">
            <div class="d-flex align-center">
              <v-btn class="elevation-0" color="primary" dark fab small>
                <v-icon>{{ RESOURCE_ICON[key] }}</v-icon>
              </v-btn>
              <div class="ml-2 mr-1">
                <h2 class="text-h6"> {{ workloadsStatistics[key] }} </h2>
                <h4 class="font-weight-regular mt-1">
                  {{ i18n.t(`resource.${RESOURCE_EN[key]}`) }}
                </h4>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <ResourceChart :cluster="cluster" :quota="quota" :show-tenant="false" />
  </div>
</template>
<script lang="ts" setup>
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { useEdgeClusterConvertToCluster } from '@/composition/cluster';
  import { useRoute } from '@/composition/router';
  import { RESOURCE_CN, RESOURCE_EN, RESOURCE_ICON } from '@/constants/resource';
  import { useGlobalI18n } from '@/i18n';
  import { Cluster } from '@/types/cluster';
  import { EdgeCluster } from '@/types/edge_cluster';
  import BasicMonitor from '@/views/resource/cluster/components/BasicMonitor/index.vue';
  import MetricMonitor from '@/views/resource/cluster/components/MetricMonitor.vue';
  import ResourceChart from '@/views/resource/cluster/components/ResourceChart.vue';
  import ResourceInfo from '@/views/resource/cluster/components/ResourceInfo.vue';

  onMounted(() => {
    getCluster();
    getEdgeClusterStatistics();
  });

  const props = withDefaults(
    defineProps<{
      date?: string[];
    }>(),
    {
      date: undefined,
    },
  );

  let params = reactive({
    start: undefined,
    end: undefined,
  });

  watch(
    () => props.date,
    (newValue) => {
      if (newValue && newValue.length === 2) {
        params.start = newValue[0];
        params.end = newValue[1];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const route = useRoute();
  const i18n = useGlobalI18n();

  let workloadsStatistics = ref({});
  let quota = ref({
    capacity: {},
    tenantAllocated: {},
    used: {},
  });
  let cluster = reactive<Cluster>(new Cluster());

  const resources: ComputedRef<any> = computed(() => {
    return Object.keys(workloadsStatistics.value).filter((i) => {
      return RESOURCE_CN[i] !== undefined && RESOURCE_CN[i] !== i18n.t('resource.node');
    });
  });

  const getCluster = async (): Promise<void> => {
    const data: Cluster = await useEdgeClusterConvertToCluster(route.params.name);
    cluster = Object.assign(cluster, data);
  };

  const getEdgeClusterStatistics = async (): Promise<any> => {
    const data = await new EdgeCluster({ metadata: { name: route.params.name } }).getStatistics();
    workloadsStatistics.value = data.workloads;
    quota.value = data.resources;
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
