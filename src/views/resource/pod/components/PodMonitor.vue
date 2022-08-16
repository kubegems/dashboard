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
  <v-card>
    <v-card-title class="py-1">
      <v-flex>
        <v-flex class="float-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
          </v-sheet>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="cpu"
            label="container"
            :metrics="cpu"
            :title="$t('table.used', [$root.$t('resource.cpu')])"
            type="cpu"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            label="container"
            :metrics="memory"
            :title="$t('table.used', [$root.$t('resource.memory')])"
            type="memory"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkin"
            label="pod"
            :metrics="networkin"
            :title="$t('tip.in_traffic')"
            type="network"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkout"
            label="pod"
            :metrics="networkout"
            :title="$t('tip.out_traffic')"
            type="network"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    CONTAINER_CPU_USAGE_PROMQL,
    CONTAINER_MEMORY_USAGE_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'PodMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      cpu: [],
      memory: [],
      networkin: [],
      networkout: [],
      date: [],
      params: {
        start: '',
        end: '',
        noprocessing: true,
      },
      timeinterval: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.loadMetrics();
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.onDatetimeChange();
      });
    },
    methods: {
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {
        this.podCPUUsage();
        this.podMemoryUsage();
        this.podNetworkIn();
        this.podNetworkOut();
      },
      async podCPUUsage() {
        const containers = [];
        if (this.item) {
          this.item.spec.containers.forEach((container) => {
            containers.push(container.name);
          });
          const query = CONTAINER_CPU_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.cpu = data;
        }
      },
      async podMemoryUsage() {
        const containers = [];
        if (this.item) {
          this.item.spec.containers.forEach((container) => {
            containers.push(container.name);
          });
          const query = CONTAINER_MEMORY_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.memory = data;
        }
      },
      async podNetworkIn() {
        if (this.item) {
          const query = POD_NETWORK_IN_PROMQL.replaceAll('$1', this.item.metadata.name).replaceAll(
            '$2',
            this.item.metadata.namespace,
          );
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.networkin = data;
        }
      },
      async podNetworkOut() {
        if (this.item) {
          const query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', this.item.metadata.name).replaceAll(
            '$2',
            this.item.metadata.namespace,
          );
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.networkout = data;
        }
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
