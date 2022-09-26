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
    <canvas :id="chartId" @mouseout="clear" />
  </div>
</template>

<script>
  import Chart from 'chart.js/auto';
  import DoughnutLabel from 'chartjs-plugin-doughnutlabel-v3';

  import { randomString } from '@/utils/helpers';

  export default {
    name: 'BaseRadialBarChart',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      cutout: {
        type: Number,
        default: () => 80,
      },
      defaultVal: {
        type: Number,
        default: () => 0,
      },
      extendHeight: {
        type: Number,
        default: () => 150,
      },
      labels: {
        type: Array,
        default: () => [],
      },
      metrics: {
        type: Array,
        default: () => [],
      },
      title: {
        type: String,
        default: () => '',
      },
      tooltipExternal: {
        type: Boolean,
        default: () => false,
      },
      total: {
        type: Number,
        default: () => 0,
      },
      unit: {
        type: String,
        default: () => '',
      },
      val: {
        type: Number,
        default: () => 0,
      },
    },
    data() {
      return {
        chart: null,
        chartId: '',
        colorful: ['#00BCD4', '#1e88e5', '#fb8c00'],
        triggerVal: 0,
      };
    },
    watch: {
      metrics: {
        handler(newValue) {
          if (newValue) {
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
            plugins: [DoughnutLabel],
            type: 'doughnut',
            data: {
              labels: this.labels,
              datasets: this.loadDatasets(),
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                doughnutLabel: {
                  labels: [
                    {
                      text: this.title,
                      color: '#00BCD4',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                    },
                    {
                      text: this.formatter,
                      color: 'black',
                      font: {
                        size: 13,
                        lineHeight: 1.5,
                      },
                    },
                  ],
                },
                legend: {
                  display: false,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    boxHeight: 7,
                  },
                },
                tooltip: {
                  enabled: false,
                  usePointStyle: true,
                  boxWidth: 8,
                  boxHeight: 8,
                  boxPadding: 4,
                  external: this.tooltipExternal
                    ? (context) => {
                        const { tooltip } = context;
                        this.triggerVal = (tooltip.dataPoints[0].dataset.data[0] / 100) * this.total;
                      }
                    : null,
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
            data: m,
            backgroundColor: [this.colorful[index % 3], '#f4f4f4'],
            cutout: `${this.cutout}%`,
          };
        });

        return datasets;
      },
      formatter() {
        if (this.defaultVal && this.triggerVal === 0) {
          return `${this.defaultVal.toFixed(1)} ${this.unit}`;
        }

        let tl = parseFloat(this.total).toFixed(1);
        if (parseInt(tl) === parseFloat(tl)) {
          tl = parseInt(tl);
        }

        if (this.val) {
          if (this.val === 0) {
            return `0 / ${tl} ${this.unit}`;
          }
        } else {
          if (this.triggerVal === 0) {
            return `0 / ${tl} ${this.unit}`;
          }
        }

        let used = this.val ? parseFloat(this.val).toFixed(2) : this.triggerVal.toFixed(2);
        if (parseInt(used) === parseFloat(used)) {
          used = parseInt(used);
        }

        return `${used} / ${tl} ${this.unit}`;
      },
      clear() {
        this.triggerVal = 0;
      },
    },
  };
</script>
