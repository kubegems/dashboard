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
  <v-card :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`" flat>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
            label="pod"
            :metrics="cpu"
            :title="$t('tip.used', [$root.$t('resource.cpu')])"
            type="cpu"
          />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
            label="pod"
            :metrics="memory"
            :title="$t('tip.used', [$root.$t('resource.memory')])"
            unit="B"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
            label="pod"
            :metrics="networkin"
            :title="$t('tip.in_traffic')"
            type="network"
          />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
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

  import messages from '../../../../i18n';
  import {
    POD_CPU_USAGE_PROMQL,
    POD_MEMORY_USAGE_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@/constants/prometheus';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'PodMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission],
    props: {
      date: {
        type: Array,
        default: () => [],
      },
      item: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    data() {
      return {
        cpu: [],
        memory: [],
        networkin: [],
        networkout: [],
        params: {
          start: '',
          end: '',
        },
        timeinterval: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      date: {
        handler(newValue) {
          if (newValue?.length === 2) {
            this.params.start = this.$moment(this.date[0]).utc().format();
            this.params.end = this.$moment(this.date[1]).utc().format();
            this.loadMetrics();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
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
        if (this.item) {
          const query = POD_CPU_USAGE_PROMQL.replaceAll('$1', this.item.stream?.pod).replaceAll(
            '$2',
            this.item.stream?.namespace,
          );
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.cpu = data;
        }
      },
      async podMemoryUsage() {
        if (this.item) {
          const query = POD_MEMORY_USAGE_PROMQL.replaceAll('$1', this.item.stream?.pod).replaceAll(
            '$2',
            this.item.stream?.namespace,
          );
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.memory = data;
        }
      },
      async podNetworkIn() {
        if (this.item) {
          const query = POD_NETWORK_IN_PROMQL.replaceAll('$1', this.item.stream?.pod).replaceAll(
            '$2',
            this.item.stream?.namespace,
          );
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.networkin = data;
        }
      },
      async podNetworkOut() {
        if (this.item) {
          const query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', this.item.stream?.pod).replaceAll(
            '$2',
            this.item.stream?.namespace,
          );
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.networkout = data;
        }
      },
    },
  };
</script>
