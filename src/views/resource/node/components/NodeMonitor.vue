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
    <v-card-title class="py-4">
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
          <BaseApexAreaChart id="load" label="name" :metrics="load" :title="$t('tip.load')" type="" />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart id="cpu" label="node" :metrics="cpu" :title="$t('tip.cpu_rate')" type="%" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart id="memory" label="node" :metrics="memory" :title="$t('tip.memory_rate')" type="%" />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart id="network" label="name" :metrics="network" :title="$t('tip.network')" type="network" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="disk"
            label="device"
            :metrics="disk"
            :title="$t('tip.remain_storage')"
            type="storage"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart id="diskiops" label="name" :metrics="diskiops" :title="$t('tip.disk_iops')" type="" />
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
    NODE_CPU_USAGE_PROMQL,
    NODE_DISK_AVAILABLE_SIZE_PROMQL,
    NODE_DISK_READ_IOPS_PROMQL,
    NODE_DISK_WRITE_IOPS_PROMQL,
    NODE_LOAD15_PROMQL,
    NODE_LOAD1_PROMQL,
    NODE_LOAD5_PROMQL,
    NODE_MEMORY_USAGE_PROMQL,
    NODE_NETWORK_IN_PROMQL,
    NODE_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'NodeMonitor',
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
      load: [],
      cpu: [],
      memory: [],
      network: [],
      disk: [],
      diskiops: [],
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
        this.nodeLoadRange();
        this.nodeCPUUsage();
        this.nodeMemoryUsage();
        this.nodeNetworkUsage();
        this.nodeDiskSize();
        this.nodeDiskIOPS();
      },
      async nodeLoadRange() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_LOAD1_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.load_1');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_LOAD5_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.load_5');
        const data3 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_LOAD15_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data3?.length > 0) data3[0].metric['name'] = this.$t('tip.load_15');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        if (data3) data = data.concat(data3);
        this.load = data;
      },
      async nodeCPUUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_CPU_USAGE_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data) this.cpu = data;
      },
      async nodeMemoryUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_MEMORY_USAGE_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data) this.memory = data;
      },
      async nodeNetworkUsage() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_NETWORK_IN_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.in_traffc');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_NETWORK_OUT_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.out_traffc');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        this.network = data;
      },
      async nodeDiskSize() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_DISK_AVAILABLE_SIZE_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data) this.disk = data;
      },
      async nodeDiskIOPS() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_DISK_WRITE_IOPS_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.write_iops');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: NODE_DISK_READ_IOPS_PROMQL.replaceAll('$1', this.item.metadata.name),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.read_iops');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        this.diskiops = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
