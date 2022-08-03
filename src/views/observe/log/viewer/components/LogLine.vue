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
    <VueApexCharts
      class="px-2"
      height="300"
      :options="chartOptions.options"
      :series="chartOptions.series"
      type="area"
      width="100%"
    />
    <div class="py-3 px-2">
      <div
        v-for="(val, index) in chart ? chart['table-data'] : []"
        :key="index"
        class="ma-1 pa-1"
        :style="`border-left: 3px solid ${$LINE_THEME_COLORS[index % 11]};font-size: 0.85rem;`"
      >
        <span class="pl-2">
          {{ index }}
        </span>
        {{ val }}
      </div>
    </div>
  </v-flex>
</template>

<script>
  import moment from 'moment';
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  export default {
    name: 'LogLine',
    components: {
      VueApexCharts,
    },
    props: {
      chart: {
        type: Object,
        default: () => {
          return {
            'xAxis-data': [],
            'yAxis-data': {},
          };
        },
      },
    },
    computed: {
      ...mapState(['Scale']),
      chartOptions() {
        const series = [];
        for (const key in this.chart ? this.chart['yAxis-data'] : {}) {
          series.push({
            name: key,
            data: this.chart['yAxis-data'][key],
          });
        }
        const options = {
          colors: this.$LINE_THEME_COLORS,
          chart: {
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
          xaxis: {
            categories: this.chart
              ? this.chart['xAxis-data'].map((d) => {
                  return moment(new Date(parseInt(`${d}000`))).format('MM-DD HH:mm:ss');
                })
              : [],
            labels: {
              style: {
                cssClass: 'grey--text lighten-2--text fill-color',
              },
            },
          },
          yaxis: {
            labels: {
              formatter: (val) => {
                return parseInt(val);
              },
            },
          },
          stroke: {
            curve: 'smooth',
            width: 2,
          },
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
          dataLabels: {
            enabled: false,
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
        return { options, series };
      },
    },
  };
</script>
