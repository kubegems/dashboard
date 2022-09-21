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
  <BasePanel v-model="panel" icon="mdi-bell" :title="$t('table.log_rate')" @dispose="dispose">
    <template #action>
      <BaseDatetimePicker v-model="date" color="primary" :default-value="60" @change="onDatetimeChange(undefined)" />
    </template>
    <template #content>
      <div class="d-flex flex-column mt-0 mx-2">
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
          unit="lines/min"
        />
      </div>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getMetricsQueryrange } from '@/api';

  export default {
    name: 'LogRateChart',
    i18n: {
      messages: messages,
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
        date: [],
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
            this.logRate();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      async logRate() {
        let data = await getMetricsQueryrange(this.env.clusterName, this.env.namespace, {
          start: this.$moment(this.date[0]).utc().format(),
          end: this.$moment(this.date[1]).utc().format(),
          resource: 'log',
          rule: 'logCount',
          scope: 'containers',
        });
        this.data = data;
      },
      onDatetimeChange() {
        this.logRate();
      },
      dispose() {
        this.data = [];
        this.$emit('clear');
      },
    },
  };
</script>
