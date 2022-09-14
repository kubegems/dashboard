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
  <div :style="{ height: `${extendHeight}px`, position: 'relative', width: '100%' }">
    <canvas :id="id" />
  </div>
</template>

<script>
  import Chart from 'chart.js/auto';

  export default {
    name: 'BaseBarChart',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      color: {
        type: Array,
        default: () => [],
      },
      colorful: {
        type: Boolean,
        default: () => false,
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
      };
    },
    watch: {
      metrics: {
        handler(newValue) {
          if (newValue) {
            if (!this.chart) {
              const ctx = document.getElementById(this.id).getContext('2d');
              this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: this.labels,
                  datasets: this.loadDatasets(),
                },
                options: {
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
                    },
                  },
                  radius: 0,
                  borderWidth: 1,
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                  scales: {
                    xAxis: {
                      grid: {
                        display: false,
                      },
                    },
                    yAxis: {
                      grid: {
                        borderDash: [8, 8, 8],
                        drawBorder: false,
                      },
                      ticks: {
                        maxTicksLimit: 8,
                      },
                    },
                  },
                },
              });
            } else {
              this.chart.data = { datasets: this.loadDatasets() };
              this.chart.update('none');
            }
          }
        },
        deep: true,
      },
    },
    methods: {
      loadDatasets() {
        const datasets = this.metrics.map((m, index) => {
          return {
            label: m.label || '',
            data: m.data,
            borderColor:
              this.color.length > 0
                ? this.color[index % this.color.length]
                : this.colorful
                ? this.$LINE_THEME_FUL_COLORS[index % 10]
                : this.$LINE_THEME_COLORS[index % 12],
            backgroundColor:
              this.color.length > 0
                ? this.color[index % this.color.length]
                : this.colorful
                ? this.$LINE_THEME_FUL_COLORS[index % 10]
                : this.$LINE_THEME_COLORS[index % 12],
          };
        });

        return datasets;
      },
    },
  };
</script>
