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
  <BasePanel v-model="panel" icon="mdi-speedometer" :title="$t('table.error_log_count')" @dispose="dispose">
    <template #action>
      <Duration v-model="duration" reverse />
    </template>
    <template #content>
      <div class="d-flex flex-column mt-3 mx-2">
        <BaseAreaChart
          chart-type="line"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="chartHeight"
          :global-plugins-check="false"
          label="pod"
          :metrics="data"
          :precision="0"
          single-tooptip
          title=""
          type=""
          unit="lines"
        />
      </div>
    </template>
  </BasePanel>
</template>

<script>
  import { getMetricsQueryrange } from '@kubegems/api/direct';
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import Duration from './Duration';

  export default {
    name: 'ErrorLogRateChart',
    i18n: {
      messages: messages,
    },
    components: {
      Duration,
    },
    props: {
      env: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        panel: false,
        data: [],
        duration: '1h',
      };
    },
    computed: {
      ...mapState(['Scale']),
      chartHeight() {
        return (window.innerHeight - 64) / 2 + (this.data.length / 2) * 20;
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.errorLogRate();
          }
        },
        deep: true,
        immediate: true,
      },
      duration: {
        handler(newValue) {
          if (newValue) {
            this.errorLogRate();
          }
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      getParams() {
        if (this.duration === '30s') {
          return { offset: -20, dur: 'seconds' };
        }
        if (this.duration === '5m') {
          return { offset: -5, dur: 'minutes' };
        }
        if (this.duration === '1h') {
          return { offset: -1, dur: 'hours' };
        }
        if (this.duration === '1d') {
          return { offset: -1, dur: 'days' };
        }
        if (this.duration === '1w') {
          return { offset: -1, dur: 'weeks' };
        }
      },
      async errorLogRate() {
        const { offset, dur } = this.getParams();
        let data = await getMetricsQueryrange(this.env.clusterName, this.env.namespace, {
          expr: `sum(gems_loki_error_logs_count_last_1m{namespace="${this.env.namespace}"})by(container)`,
          start: this.$moment().utc().add(offset, dur).format(),
          end: this.$moment().utc().format(),
        });
        this.data = data;
      },
      dispose() {
        this.data = [];
        this.$emit('clear');
      },
    },
  };
</script>
