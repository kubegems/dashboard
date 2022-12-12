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
  <div :style="{ height: `${autoGrow ? height : extendHeight}px`, position: 'relative', width: '100%' }">
    <canvas :id="chartId" />
  </div>
</template>

<script>
  import Chart from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import moment from 'moment';

  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@/constants/chart';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'BaseTimelineChart',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      autoGrow: {
        type: Boolean,
        default: () => true,
      },
      color: {
        type: Array,
        default: () => [],
      },
      colorful: {
        type: Boolean,
        default: () => false,
      },
      duration: {
        type: Number,
        default: () => 0,
      },
      extendHeight: {
        type: Number,
        default: () => 280,
      },
      labels: {
        type: Array,
        default: () => [],
      },
      labelShow: {
        type: Boolean,
        default: () => true,
      },
      metrics: {
        type: Array,
        default: () => [],
      },
      title: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        chart: null,
        chartId: '',
        height: 100,
      };
    },
    watch: {
      metrics: {
        handler(newValue) {
          if (newValue && newValue?.length >= 0 && document.getElementById(this.chartId)) {
            this.height = 100 + 24 * newValue[0].data?.length;
            this.loadChart();
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (this.id) {
          this.chartId = this.id;
        } else {
          this.chartId = randomString(6);
        }
        const interval = setInterval(() => {
          if (document.getElementById(this.chartId)) {
            clearInterval(interval);
            this.height = 100 + 24 * this.metrics[0].data?.length;
            this.loadChart();
          }
        }, 300);
      });
    },
    methods: {
      loadChart() {
        if (!this.chart) {
          const ctx = document.getElementById(this.chartId).getContext('2d');
          this.chart = new Chart(ctx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
              labels: this.labels,
              datasets: this.loadDatasets(),
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  align: 'start',
                  display: true,
                  text: this.title,
                },
                legend: {
                  display: this.labelShow,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    boxHeight: 7,
                  },
                },
                tooltip: {
                  usePointStyle: true,
                  boxWidth: 8,
                  boxHeight: 8,
                  boxPadding: 4,
                  mode: 'index',
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${moment(tooltipItem.dataset.data[tooltipItem.dataIndex].x[0]).format(
                        'HH:mm:ss.SSS',
                      )} duration: ${(
                        tooltipItem.dataset.data[tooltipItem.dataIndex].x[1] -
                        tooltipItem.dataset.data[tooltipItem.dataIndex].x[0]
                      ).toFixed(3)} ms`;
                    },
                  },
                },
                datalabels: {
                  color: '#424242',
                  anchor: 'start',
                  align: (context) => {
                    return (context.dataset.data[context.dataIndex].x[0] - context.dataset.data[0].x[0]) /
                      this.duration <
                      0.3
                      ? 'right'
                      : 'left';
                  },
                  display: (context) => {
                    return context.dataset.data[context.dataIndex] !== null ? 'auto' : false;
                  },
                  formatter: (value) => {
                    return value.operation;
                  },
                },
              },
              radius: 0,
              borderWidth: 1,
              scales: {
                xAxis: {
                  min: this.metrics?.length > 0 ? this.metrics[0].data[0].x[0] : 0,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                  },
                  beginAtZero: false,
                  type: 'time',
                  time: {
                    displayFormats: {
                      millisecond: 'mm:ss.SSS',
                    },
                    unit: 'millisecond',
                    stepSize: this.getStepSize(),
                  },
                },
                yAxis: {
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 100,
                  },
                },
              },
            },
          });
        } else {
          this.chart.data = { datasets: this.loadDatasets() };
          this.chart.update('none');
        }
      },
      loadDatasets() {
        const datasets = this.metrics.map((m, index) => {
          return {
            label: m.label || '',
            data: m.data,
            borderColor:
              this.color.length > 0
                ? this.color[index % this.color.length]
                : this.colorful
                ? LINE_THEME_FUL_COLORS[index % 10]
                : LINE_THEME_COLORS[index % 12],
            backgroundColor:
              this.color.length > 0
                ? this.color[index % this.color.length]
                : this.colorful
                ? LINE_THEME_FUL_COLORS[index % 10]
                : LINE_THEME_COLORS[index % 12],
          };
        });
        return datasets;
      },
      getStepSize() {
        const range = this.duration;
        if (range < 100) {
          return 1;
        }
        if (range < 200) {
          return 2;
        }
        if (range < 300) {
          return 3;
        }
        if (range < 500) {
          return 5;
        }
        if (range < 1000) {
          return 10;
        }
        if (range < 5000) {
          return 50;
        }
        if (range < 10000) {
          return 100;
        }
        if (range < 100000) {
          return 1000;
        }
      },
    },
  };
</script>
