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
  <BaseBarChart
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :color="['var(--success-color)', 'var(--warning-color)']"
    height="290px"
    :metrics="series"
  />
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';

  export default {
    name: 'MessageBarChart',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Array,
        default: () => [],
      },
      date: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        series: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            const timeArray = this.generateDateArray();
            this.loadSeries(newValue, timeArray);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      generateDateArray() {
        const timeStep = (this.date[1] - this.date[0]) / 10;
        return '0123456789'
          .split('')
          .concat([10])
          .map((s) => {
            return this.date[0] + timeStep * s;
          });
      },
      loadSeries(data, timeArray) {
        const metrics = [];
        const types = ['Normal', 'Warning'];
        types.forEach((severity) => {
          metrics.push({
            metric: { name: severity },
            values: timeArray.map((d) => {
              return [d, 0];
            }),
          });
        });
        data.forEach((d) => {
          const time = Date.parse(this.$moment(d.stream.lastTimestamp));
          const index = timeArray.findIndex((t) => {
            return t >= time;
          });
          if (index > -1) {
            if (d.stream.type === 'Normal') {
              metrics[0].values[index][1] += 1;
            } else if (d.stream.type === 'Warning') {
              metrics[1].values[index][1] += 1;
            }
          }
        });
        this.series = metrics.map((metricAndValues) => {
          return {
            label:
              metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
                ? this.label
                  ? metricAndValues.metric[this.label]
                  : Object.values(metricAndValues.metric)[0]
                : this.$route.params.name,
            data: metricAndValues.values.map((v) => {
              return { x: this.$moment(new Date(v[0])).format('LTS'), y: v[1] };
            }),
          };
        });
      },
    },
  };
</script>
