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
  <BasePanel
    v-model="panel"
    icon="mdi-chart-areaspline-variant"
    :title="$t('tip.container_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text">
        {{ promqlParams.pod }}
      </span>
    </template>
    <template #action>
      <v-flex>
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatetimePicker
            v-model="date"
            color="primary"
            :default-value="30"
            @change="onDatetimeChange(undefined)"
          />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} mt-4`" flat>
        <v-card-text class="py-0" :style="{ height: `${height}px`, overflowY: 'auto' }">
          <BaseApexAreaChart
            id="cpu"
            label="container"
            :metrics="cpu"
            :no-data-offset-y="-22"
            :title="$t('tip.used', [$root.$t('resource.cpu')])"
            type="cpu"
          />
          <BaseApexAreaChart
            id="memory"
            label="container"
            :metrics="memory"
            :no-data-offset-y="-22"
            :title="$t('tip.used', [$root.$t('resource.memory')])"
            type="memory"
          />
          <BaseApexAreaChart
            id="networkin"
            label="pod"
            :metrics="networkin"
            :no-data-offset-y="-22"
            :title="$t('tip.in_traffic')"
            type="network"
          />
          <BaseApexAreaChart
            id="networkout"
            label="pod"
            :metrics="networkout"
            :no-data-offset-y="-22"
            :title="$t('tip.out_traffic')"
            type="network"
          />
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import {
    POD_CPU_USAGE_BY_CONTAINER_PROMQL,
    POD_MEMORY_BY_CONTAINER_USAGE_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'LogPodMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      panel: false,
      cpu: [],
      memory: [],
      networkin: [],
      networkout: [],
      date: [],
      params: {
        start: '',
        end: '',
      },
      timeinterval: null,
      promqlParams: {
        cluster: '',
        namespace: '',
        pod: '',
        timestamp: '',
      },
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 17;
      },
    },
    watch: {
      promqlParams: {
        handler(newValue) {
          if (newValue && newValue?.cluster) {
            this.onDatetimeChange();
          }
        },
        deep: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(item) {
        this.promqlParams = deepCopy(item);
      },
      dispose() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
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
        const query = POD_CPU_USAGE_BY_CONTAINER_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.cpu = data;
      },
      async podMemoryUsage() {
        const query = POD_MEMORY_BY_CONTAINER_USAGE_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.memory = data;
      },
      async podNetworkIn() {
        const query = POD_NETWORK_IN_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.networkin = data;
      },
      async podNetworkOut() {
        const query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', this.promqlParams.pod).replaceAll(
          '$2',
          this.promqlParams.namespace,
        );
        const data = await this.m_permission_matrix(
          this.promqlParams.cluster,
          Object.assign(this.params, { query: query }),
        );
        if (data) this.networkout = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        if (this.params.timestamp) {
          const timestamp = parseInt(this.params.timestamp.substr(0, 13));
          if (this.$moment(timestamp).add(30, 'minutes') < new Date()) {
            this.params.start = this.$moment(timestamp).utc().add(-15, 'minutes').format();
            this.params.end = this.$moment(timestamp).utc().add(15, 'minutes').format();
          }
        }
        this.loadMetrics();
      },
    },
  };
</script>
