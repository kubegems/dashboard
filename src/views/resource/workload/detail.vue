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
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-subtitle-2 mx-2">
            {{ $root.$t('resource.cpu') }} : {{ cpu.val }}
            <v-menu id="cpu" :close-delay="200" nudge-right="25px" nudge-top="-5px" open-on-hover top>
              <template #activator="{ on }">
                <v-icon v-if="cpu.trend === 'up'" color="error" v-on="on"> mdi-trending-up </v-icon>
                <v-icon v-else-if="cpu.trend === 'down'" color="success" v-on="on"> mdi-trending-down </v-icon>
                <v-icon v-else-if="cpu.trend === 'neutral'" color="primary" v-on="on"> mdi-trending-neutral </v-icon>
              </template>
              <v-card>
                <v-card-text class="pa-2 text-caption"> {{ $t('tip.cpu_30_interval') }} </v-card-text>
              </v-card>
            </v-menu>
          </span>
          <span class="text-subtitle-2 mx-2">
            {{ $root.$t('resource.memory') }} : {{ memory.val }}
            <v-menu id="memory" :close-delay="200" nudge-right="25px" nudge-top="-5px" open-on-hover top>
              <template #activator="{ on }">
                <v-icon v-if="memory.trend === 'up'" color="error" v-on="on"> mdi-trending-up </v-icon>
                <v-icon v-else-if="memory.trend === 'down'" color="success" v-on="on"> mdi-trending-down </v-icon>
                <v-icon v-else-if="memory.trend === 'neutral'" color="primary" v-on="on"> mdi-trending-neutral </v-icon>
              </template>
              <v-card>
                <v-card-text class="pa-2 text-caption"> {{ $t('tip.memory_30_interval') }} </v-card-text>
              </v-card>
            </v-menu>
          </span>
          <template
            v-if="
              workload && workload.metadata.annotations && !workload.metadata.annotations[`application.kubegems.io/ref`]
            "
          >
            <v-btn
              v-if="$route.query.type !== 'DaemonSet' && m_permisson_resourceAllow"
              class="primary--text"
              small
              text
              @click="scaleReplicas"
            >
              <v-icon left small> mdi-arrow-up-down-bold </v-icon>
              {{ $t('operate.scale_replicas') }}
            </v-btn>
            <v-btn v-if="m_permisson_resourceAllow" class="primary--text" small text @click="rollingback">
              <v-icon left small> mdi-redo-variant </v-icon>
              {{ $t('operate.rollback') }}
            </v-btn>
            <v-btn
              v-if="$route.query.type !== 'DaemonSet' && m_permisson_resourceAllow"
              class="primary--text"
              small
              text
              @click="hpaStrategy"
            >
              <v-icon left small> mdi-cogs </v-icon>
              {{ $t('tip.auto_scale_policy') }}
            </v-btn>
          </template>
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateWorkload"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeWorkload"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="workload" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="workload"
          :selector="{
            topkind: $route.query.type,
            topname: workload ? workload.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ScaleReplicas ref="scaleReplicas" :item="workload" :kind="$route.query.type" @refresh="workloadDetail" />
    <HPAStrategy ref="hpaStrategy" :item="workload" />
    <Rollingback ref="rollingback" :item="workload" @refresh="workloadDetail" />
    <ResourceYaml ref="resourceYaml" :item="workload" />
    <UpdateWorkload ref="updateWorkload" @refresh="workloadDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import HPAStrategy from './components/HPAStrategy';
  import ResourceInfo from './components/ResourceInfo';
  import Rollingback from './components/Rollingback';
  import ScaleReplicas from './components/ScaleReplicas';
  import UpdateWorkload from './components/UpdateWorkload';
  import WorkloadMonitor from './components/WorkloadMonitor';
  import messages from './i18n';
  import {
    deleteDaemonSet,
    deleteDeployment,
    deleteStatefulSet,
    getDaemonSetDetail,
    getDeploymentDetail,
    getStatefulSetDetail,
  } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';
  import { WORKLOAD_CPU_USAGE_PROMQL, WORKLOAD_MEMORY_USAGE_PROMQL } from '@/utils/prometheus';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'WorkloadDetail',
    i18n: {
      messages: messages,
    },
    components: {
      BasicResourceInfo,
      EventList,
      HPAStrategy,
      Metadata,
      PodList,
      ResourceInfo,
      ResourceYaml,
      Rollingback,
      ScaleReplicas,
      UpdateWorkload,
      WorkloadMonitor,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      workload: null,
      tab: 0,
      cpu: { val: 0, trend: '' },
      memory: { val: 0, trend: '' },
      cpuInterval: null,
      memoryInterval: null,
    }),
    computed: {
      ...mapState(['JWT', 'MessageStreamWS']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$root.$t('tab.pod'), value: 'PodList' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
          { text: this.$root.$t('tab.monitor'), value: 'WorkloadMonitor' },
        ];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: function (updatingWorkload) {
          if (!updatingWorkload) return;
          const workload = JSON.parse(updatingWorkload);
          if (workload.MessageType !== 'objectChanged') return;
          if (workload.Content && this.workload && workload.Content.metadata.name === this.workload.metadata.name) {
            if (workload.EventKind === 'delete') {
              this.$router.push({ name: 'workload-list', params: this.$route.params });
            } else {
              this.workload = workload.Content;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      if (this.cpuInterval) {
        clearInterval(this.cpuInterval);
      }
      if (this.memoryInterval) {
        clearInterval(this.memoryInterval);
      }
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.workloadDetail();
        });
      }
    },
    methods: {
      async workloadDetail() {
        let data = {};
        if (this.$route.query.type === 'DaemonSet') {
          data = await getDaemonSetDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        } else if (this.$route.query.type === 'Deployment') {
          data = await getDeploymentDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        } else if (this.$route.query.type === 'StatefulSet') {
          data = await getStatefulSetDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        }
        this.workload = data;
        this.cpuUsed(false);
        this.memoryUsed(false);
        this.cpuInterval = setInterval(() => {
          this.cpuUsed();
        }, 1000 * 30);
        this.memoryInterval = setInterval(() => {
          this.memoryUsed();
        }, 1000 * 30);
        this.watchWorkload();
      },
      watchWorkload() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchWorkloadList = [];
        watchWorkloadList.push(`${this.workload.metadata.namespace}/${this.workload.metadata.name}`);
        sub.content[this.ThisCluster] = {};
        sub.content[this.ThisCluster][this.$route.query.type] = watchWorkloadList;
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      async cpuUsed(trend = true) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: WORKLOAD_CPU_USAGE_PROMQL.replaceAll('$1', `${this.workload.metadata.namespace}`).replaceAll(
            '$2',
            `${this.$route.query.type}:${this.workload.metadata.name}`,
          ),
          noprocessing: true,
        });
        if (data && data.length > 0) {
          if (trend) {
            const oldval = sizeOfCpu(this.cpu.val, 'n');
            const newval = data[0].value[1] * 1000000;
            if (newval > oldval) {
              this.cpu.trend = 'up';
            } else if (newval < oldval) {
              this.cpu.trend = 'down';
            } else {
              this.cpu.trend = 'neutral';
            }
          }
          this.cpu.val = beautifyCpuUnit(data[0].value[1] * 1000000);
        }
      },
      async memoryUsed(trend = true) {
        const data = await this.m_permission_vector(this.ThisCluster, {
          query: WORKLOAD_MEMORY_USAGE_PROMQL.replaceAll('$1', `${this.workload.metadata.namespace}`).replaceAll(
            '$2',
            `${this.$route.query.type}:${this.workload.metadata.name}`,
          ),
          noprocessing: true,
        });
        if (data && data.length > 0) {
          if (trend) {
            const oldval = sizeOfStorage(this.memory.val, 'B');
            const newval = data[0].value[1] * 1024 * 1024;
            if (newval > oldval) {
              this.memory.trend = 'up';
            } else if (newval < oldval) {
              this.memory.trend = 'down';
            } else {
              this.memory.trend = 'neutral';
            }
          }
          this.memory.val = beautifyStorageUnit(data[0].value[1] * 1024 * 1024);
        }
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      scaleReplicas() {
        this.$refs.scaleReplicas.open();
      },
      rollingback() {
        this.$refs.rollingback.init();
        this.$refs.rollingback.open();
      },
      hpaStrategy() {
        this.$refs.hpaStrategy.init();
        this.$refs.hpaStrategy.open();
      },
      updateWorkload() {
        this.$refs.updateWorkload.init(this.workload, this.$route.query.type);
        this.$refs.updateWorkload.open();
      },
      removeWorkload() {
        const item = this.workload;
        if (this.$route.query.type === 'DaemonSet') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.daemonset')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.daemonset')])} ${item.metadata.name}`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              await deleteDaemonSet(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
              this.$router.push({ name: 'workload-list', params: this.$route.params });
            },
          });
        } else if (this.$route.query.type === 'StatefulSet') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.statefulset')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.statefulset')])} ${
                item.metadata.name
              }`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              await deleteStatefulSet(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
              this.$router.push({ name: 'workload-list', params: this.$route.params });
            },
          });
        } else if (this.$route.query.type === 'Deployment') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.deployment')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.deployment')])} ${
                item.metadata.name
              }`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              await deleteDeployment(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
              this.$router.push({ name: 'workload-list', params: this.$route.params });
            },
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  #cpu {
    display: inline-block !important;
  }

  #memory {
    display: inline-block !important;
  }
</style>
