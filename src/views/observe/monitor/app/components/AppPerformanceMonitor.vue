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
    :title="$t('tip.app_performance_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text">
        {{ item ? item.name : '' }}
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
        <v-card-text class="py-0">
          <BaseAreaChart :extend-height="280" label="operation" :metrics="latency" title="latency" type="timecost" />

          <BaseAreaChart
            :extend-height="280"
            label="operation"
            :metrics="requestRate"
            title="requestRate"
            type="percent"
          />

          <BaseAreaChart :extend-height="280" label="operation" :metrics="errorRate" title="errorRate" type="reqrate" />
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAppPerformanceDashboard } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppPerformanceMonitor',
    i18n: {
      messages: messages,
    },
    props: {
      cluster: {
        type: String,
        default: () => '',
      },
      env: {
        type: Object,
        default: () => null,
      },
      service: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        panel: false,
        latency: [],
        requestRate: [],
        errorRate: [],
        date: [],
        params: {
          start: '',
          end: '',
        },
        item: null,
        timeinterval: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
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
      open() {
        this.panel = true;
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
        this.appPerformanceDashboard();
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        if (this.item) this.loadMetrics();
      },
      init(item) {
        this.item = deepCopy(item);
        this.loadMetrics();
      },
      async appPerformanceDashboard(noprocess = false) {
        const data = await getAppPerformanceDashboard(this.cluster, this.env?.namespace, {
          service: this.service,
          ...this.params,
          noprocessing: noprocess,
        });

        if (data) {
          const latency = data.operationlatencyP95.find((o) => {
            return o.metric.operation === this.item.name;
          });
          if (latency) this.latency = [latency];

          const requestRate = data.operationRequestRate.find((o) => {
            return o.metric.operation === this.item.name;
          });
          if (requestRate) this.requestRate = [requestRate];

          const errorRate = data.operationErrorRate.find((o) => {
            return o.metric.operation === this.item.name;
          });
          if (errorRate) this.errorRate = [errorRate];
        }
      },
      dispose() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
    },
  };
</script>
