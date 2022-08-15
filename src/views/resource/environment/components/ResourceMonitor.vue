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
  <v-card class="mt-3" flat>
    <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.resource_monitor')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
        </v-sheet>
      </template>
    </BaseSubTitle>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="cpu"
            label="environment"
            :label-show="false"
            :metrics="cpu"
            :title="$t('tip.cpu_used')"
            type="cpu"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            label="environment"
            :label-show="false"
            :metrics="memory"
            :title="$t('tip.memory_used')"
            type="memory"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkin"
            label="environment"
            :label-show="false"
            :metrics="networkin"
            :title="$t('tip.ingress')"
            type="network"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="networkout"
            label="environment"
            :label-show="false"
            :metrics="networkout"
            :title="$t('tip.egress')"
            type="network"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    ENVIRONMENT_CPU_USAGE_PROMQL,
    ENVIRONMENT_MEMORY_USAGE_PROMQL,
    ENVIRONMENT_NETWORK_IN_PROMQL,
    ENVIRONMENT_NETWORK_OUT_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'ResourceMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      ready: {
        type: Boolean,
        default: () => false,
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
      },
      timeinterval: null,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Environment', 'Project']),
    },
    watch: {
      ready() {
        if (this.ready) {
          this.loadMetrics();
        }
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
        this.environmentCPUUsage();
        this.environmentMemoryUsage();
        this.environmentNetworkIn();
        this.environmentNetworkOut();
      },
      async environmentCPUUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_CPU_USAGE_PROMQL.replaceAll('$1', this.Environment().EnvironmentName),
            noprocessing: true,
          }),
        );
        if (data) this.cpu = data;
      },
      async environmentMemoryUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_MEMORY_USAGE_PROMQL.replaceAll('$1', this.Environment().EnvironmentName),
            noprocessing: true,
          }),
        );
        if (data) this.memory = data;
      },
      async environmentNetworkIn() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_NETWORK_IN_PROMQL.replaceAll('$1', this.Environment().EnvironmentName),
            noprocessing: true,
          }),
        );
        if (data) this.networkin = data;
      },
      async environmentNetworkOut() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: ENVIRONMENT_NETWORK_OUT_PROMQL.replaceAll('$1', this.Environment().EnvironmentName),
            noprocessing: true,
          }),
        );
        if (data) this.networkout = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        if (this.ready) {
          this.loadMetrics();
        }
      },
    },
  };
</script>
