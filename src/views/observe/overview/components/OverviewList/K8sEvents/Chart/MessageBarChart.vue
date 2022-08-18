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
  <VueApexCharts
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :height="height"
    :options="options"
    :series="series"
    type="bar"
    :width="width"
  />
</template>

<script>
  import moment from 'moment';
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'MessageBarChart',
    i18n: {
      messages: messages,
    },
    components: {
      VueApexCharts,
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
      this.options = {
        colors: ['#26C6DA', '#FB8C00'],
        chart: {
          type: 'bar',
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
          animations: {
            animateGradually: {
              enabled: false,
              delay: 0,
            },
          },
        },
        title: {
          text: this.$t('table.message'),
          align: 'left',
          margin: 5,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#757575',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
          width: 0,
        },
        grid: {
          borderColor: 'rgba(0, 0, 0, .3)',
          strokeDashArray: 5,
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        legend: {
          show: true,
        },
        yaxis: {
          labels: {
            formatter: (v) => toFixed(v, 3),
          },
        },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
            formatter: function (value, timestamp) {
              return moment(new Date(timestamp)).format('LTS');
            },
            style: {
              cssClass: 'grey--text lighten-2--text fill-color',
            },
            rotate: -55,
            rotateAlways: true,
          },
          tooltip: {
            enabled: false,
          },
          tickAmount: 10,
        },
        tooltip: {
          theme: 'dark',
        },
        noData: {
          text: this.$root.$t('data.no_data'),
          offsetY: -28,
          style: {
            fontSize: '13px',
          },
        },
      };
      return {
        width: '100%',
        height: '350px',
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
            name:
              metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
                ? this.label
                  ? metricAndValues.metric[this.label]
                  : Object.values(metricAndValues.metric)[0]
                : this.$route.params.name,
            data: metricAndValues.values,
          };
        });
      },
    },
  };
</script>
