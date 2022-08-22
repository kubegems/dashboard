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
    ref="vueApexCharts"
    :height="height"
    :options="getOptions()"
    :series="series"
    type="bar"
    width="100%"
  />
</template>

<script>
  import moment from 'moment';
  import VueApexCharts from 'vue-apexcharts';

  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'AlertBarChart',
    components: {
      VueApexCharts,
    },
    props: {
      extendHeight: {
        type: Number,
        default: () => 250,
      },
      label: {
        type: String,
        default: () => null,
      },
      metrics: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      series: [],
      timeinterval: null,
      height: 250,
    }),
    watch: {
      metrics: {
        handler() {
          this.loadData();
        },
        deep: true,
      },
      extendHeight: {
        handler() {
          this.height = this.extendHeight;
        },
        immediate: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      async loadData() {
        let series = [];
        series = series.concat(
          this.metrics.map((metricAndValues) => {
            return {
              name:
                metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
                  ? this.label
                    ? metricAndValues.metric[this.label]
                    : Object.values(metricAndValues.metric)[0]
                  : this.$route.params.name,
              data: metricAndValues.values,
            };
          }),
        );
        const timeout = setTimeout(() => {
          if (this.$refs.vueApexCharts) {
            this.$refs.vueApexCharts.updateSeries(series, false, true);
          }
          clearTimeout(timeout);
        }, 200);
      },
      getOptions() {
        return {
          colors: ['#ff5252', '#673ab7'],
          chart: {
            toolbar: {
              show: false,
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
              rotate: -50,
              rotateAlways: true,
            },
            tooltip: {
              enabled: false,
            },
            tickAmount: 10,
          },
          yaxis: {
            labels: {
              formatter: (value) => toFixed(value),
            },
            tickAmount: 5,
            forceNiceScale: true,
          },
          stroke: {
            curve: 'smooth',
            width: 0,
          },
          fill: {
            type: 'solid',
            opacity: 0.7,
          },
          grid: {
            show: true,
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
          dataLabels: {
            enabled: false,
          },
          tooltip: {
            theme: 'dark',
            y: {
              formatter: (value) => {
                return value;
              },
            },
          },
          legend: {
            showForSingleSeries: true,
            showForNullSeries: false,
          },
          noData: {
            text: this.$root.$t('data.no_data'),
            offsetY: -30,
            style: {
              fontSize: '13px',
            },
          },
        };
      },
    },
  };
</script>
