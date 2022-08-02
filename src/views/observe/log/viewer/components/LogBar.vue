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
  <v-flex :class="`pa-0 clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
    <VueApexCharts class="px-0" height="180" :options="chartOptions" :series="series" type="bar" width="100%" />
  </v-flex>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import { THEME_COLORS } from '@/utils/chart';

  export default {
    name: 'LogBar',
    components: {
      VueApexCharts,
    },
    props: {
      chart: {
        type: Object,
        default: () => {
          return {
            'xAxis-data': [],
            'yAxis-data': {
              info: [],
              debug: [],
              error: [],
              warn: [],
              unknown: [],
            },
          };
        },
      },
    },
    computed: {
      ...mapState(['Scale']),
      series() {
        return [
          {
            name: 'Info',
            data: this.chart ? this.chart['yAxis-data'].info : [],
          },
          {
            name: 'Debug',
            data: this.chart ? this.chart['yAxis-data'].debug : [],
          },
          {
            name: 'Warn',
            data: this.chart ? this.chart['yAxis-data'].warn : [],
          },
          {
            name: 'Error',
            data: this.chart ? this.chart['yAxis-data'].error : [],
          },
          {
            name: 'Unknown',
            data: this.chart ? this.chart['yAxis-data'].unknown : [],
          },
        ];
      },
      chartOptions() {
        return {
          colors: THEME_COLORS,
          chart: {
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
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
            width: 2,
          },
          xaxis: {
            categories: this.chart ? this.chart['xAxis-data'] : [],
            labels: {
              style: {
                cssClass: 'grey--text lighten-2--text fill-color',
              },
            },
          },
          yaxis: {},
          grid: {
            show: true,
            borderColor: 'rgba(0, 0, 0, .3)',
            strokeDashArray: 3,
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
          },
          tooltip: {
            theme: 'dark',
            y: {
              formatter: function (val) {
                return val;
              },
            },
          },
        };
      },
    },
  };
</script>
