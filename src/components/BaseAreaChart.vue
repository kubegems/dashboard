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
  <div :style="{ height: `${extendHeight}px`, position: 'relative', width: width }">
    <canvas v-if="mustCheckPremission" :id="chartId" />
    <div v-else class="text-center kubegems__full-center text-caption">
      {{ $root.$t('plugin.missing', ['monitoring']) }}
    </div>
  </div>
</template>

<script>
  import Chart from 'chart.js/auto';
  import { mapState } from 'vuex';
  import 'chartjs-adapter-moment';

  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@/constants/chart';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'BaseAreaChart',
    props: {
      animation: {
        type: Boolean,
        default: () => true,
      },
      beginAtZero: {
        type: Boolean,
        default: () => false,
      },
      chartType: {
        type: String,
        default: () => 'area',
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
      globalPluginsCheck: {
        type: Boolean,
        default: () => true,
      },
      id: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => null,
      },
      labels: {
        type: Array,
        default: () => [],
      },
      labelShow: {
        type: Boolean,
        default: () => true,
      },
      legendAlign: {
        type: String,
        default: () => 'center',
      },
      metrics: {
        type: Array,
        default: () => [],
      },
      precision: {
        type: Number,
        default: () => 2,
      },
      sample: {
        type: Boolean,
        default: () => false,
      },
      singleTooptip: {
        type: Boolean,
        default: () => false,
      },
      timeDisplay: {
        type: String,
        default: () => 'HH:mm:ss',
      },
      title: {
        type: String,
        default: () => null,
      },
      type: {
        type: String,
        default: () => null,
      },
      unit: {
        type: String,
        default: () => null,
      },
      width: {
        type: String,
        default: () => '100%',
      },
    },
    data() {
      return {
        chart: null,
        allUnit: {
          short: ['n', 'u', 'm', '', 'K', 'Mil', 'Bil', 'Tri'],
          bytes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
          'bytes/sec': ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'],
          duration: ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'],
          percent: ['0-100', '0.0-1.0'],

          cpu: ['n', 'u', 'm', 'core', 'k'],
          memory: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
          storage: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
          network: ['bps', 'Kbps', 'Mbps', 'Gbps'],
          timecost: ['us', 'ms', 's'],
          reqrate: ['req/s'],
          count: ['', 'k', 'm'],
        },
        chartId: '',
        legendIndexs: [],
      };
    },
    computed: {
      ...mapState(['Plugins']),
      mustCheckPremission() {
        return (this.Plugins && this.Plugins['monitoring']) || !this.Plugins || !this.globalPluginsCheck;
      },
    },
    watch: {
      metrics: {
        handler(newValue) {
          if (newValue && newValue?.length >= 0 && document.getElementById(this.chartId)) {
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
        if (!this.mustCheckPremission) return;
        if (!this.chart) {
          const ctx = document.getElementById(this.chartId).getContext('2d');
          this.chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: this.labels,
              datasets: this.loadDatasets(),
            },
            options: {
              animation: this.animation,
              spanGaps: true,
              datasets: {
                line: {
                  pointRadius: 0,
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  align: 'start',
                  display: true,
                  text: this.title,
                },
                legend: {
                  display: this.labelShow && !this.sample,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    boxHeight: 7,
                  },
                  align: this.legendAlign,
                  onClick: (e, legendItem, legend) => {
                    const ci = legend.chart;
                    const index = legendItem.datasetIndex;
                    const legendIndex = this.legendIndexs.indexOf(index);
                    if (legendIndex > -1) {
                      this.legendIndexs.splice(legendIndex, 1);
                    } else {
                      this.legendIndexs.push(index);
                    }

                    const showAll = this.legendIndexs.length === 0;

                    legend.legendItems.forEach((item) => {
                      const i = item.datasetIndex;
                      if (showAll) {
                        ci.show(i);
                        item.hidden = false;
                      } else {
                        if (this.legendIndexs.indexOf(i) > -1) {
                          ci.show(i);
                          item.hidden = false;
                        } else {
                          ci.hide(i);
                          item.hidden = true;
                        }
                      }
                    });
                  },
                },
                tooltip: {
                  enabled: !this.singleTooptip,
                  usePointStyle: true,
                  boxWidth: 8,
                  boxHeight: 8,
                  boxPadding: 4,
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${tooltipItem.dataset.label} : ${this.formatter(
                        tooltipItem.dataset.data[tooltipItem.dataIndex].y,
                      )}`;
                    },
                  },
                  external: this.singleTooptip ? this.externalTooltipHandler : null,
                  mode: this.singleTooptip ? 'nearest' : 'index',
                },
              },
              radius: 0,
              borderWidth: this.chartType === 'line' ? 2 : 1,
              interaction: {
                intersect: false,
                mode: 'index',
              },
              scales: {
                y: {
                  display: !this.sample,
                  grid: {
                    borderDash: [8, 8, 8],
                    drawBorder: false,
                  },
                  ticks: {
                    callback: (value) => {
                      return this.formatter(value);
                    },
                    maxTicksLimit: 8,
                  },
                  beginAtZero: this.beginAtZero,
                  min: this.type === 'percent' || ['0-100', '0.0-1.0'].indexOf(this.unit) > -1 ? 0 : null,
                },
                x: {
                  display: !this.sample,
                  grid: {
                    display: false,
                  },
                  type: 'timeseries',
                  time: {
                    unit: 'second',
                    displayFormats: {
                      second: this.timeDisplay,
                    },
                    tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
                    stepSize: 200,
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
      getOrCreateTooltip(chart, tooltip) {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        const width = chart.width;
        const x = tooltip.caretX;

        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
          tooltipEl.style.borderRadius = '8px';
          tooltipEl.style.color = 'white';
          tooltipEl.style.opacity = 1;
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.transform = `translate(-${(x / width) * 100}%, 0)`;
          tooltipEl.style.transition = 'all .1s ease';
          tooltipEl.style.fontSize = '12px';
          tooltipEl.style.zIndex = '15';
          tooltipEl.style.minWidth = '300px';
          // tooltipEl.style.maxWidth = '400px';

          const table = document.createElement('table');
          table.style.margin = '0px';
          table.style.width = '100%';

          tooltipEl.appendChild(table);
          chart.canvas.parentNode.appendChild(tooltipEl);
        } else {
          tooltipEl.style.transform = `translate(-${(x / width) * 100}%, 0)`;
        }

        return tooltipEl;
      },

      externalTooltipHandler(context) {
        // Tooltip Element
        const { chart, tooltip } = context;
        const tooltipEl = this.getOrCreateTooltip(chart, tooltip);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        // Set Text
        if (tooltip.body) {
          const bodyLines = tooltip.body.map((b) => b.lines);

          const tableBody = document.createElement('tbody');
          bodyLines.forEach((body, i) => {
            const bodySlice = body[0].split(':');
            const numberic = bodySlice[bodySlice.length - 1].trim();
            const colors = tooltip.labelColors[i];

            const datasetIndex = tooltip.dataPoints[0].datasetIndex;
            const metric = this.metrics[datasetIndex].metric;
            const key = this.metrics[datasetIndex].key;

            const divPoint = document.createElement('div');
            divPoint.style.background = colors.backgroundColor;
            divPoint.style.borderColor = colors.borderColor;
            divPoint.style.borderWidth = '2px';
            divPoint.style.marginRight = '10px';
            divPoint.style.height = '12px';
            divPoint.style.width = '12px';
            divPoint.style.display = 'inline-block';
            divPoint.style.borderRadius = '12px';
            divPoint.style.float = 'left';
            divPoint.style.marginTop = '4px';

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;

            const divTitle = document.createElement('div');
            if (key) {
              divTitle.innerText = `${key}-${tooltip.title[0]}`;
            } else {
              divTitle.innerText = tooltip.title[0];
            }
            divTitle.style.float = 'left';

            const divNumberic = document.createElement('div');
            divNumberic.innerText = numberic;
            divNumberic.style.float = 'right';

            const divClear = document.createElement('div');
            divClear.style.clear = 'both';

            td.appendChild(divPoint);
            td.appendChild(divTitle);
            td.appendChild(divNumberic);
            td.appendChild(divClear);

            Object.keys(metric).forEach((label) => {
              const div = document.createElement('div');
              const divLeft = document.createElement('div');
              divLeft.innerText = `${label} :`;
              divLeft.style.float = 'left';
              const divRight = document.createElement('div');
              divRight.innerText = `${metric[label]}`;
              divRight.style.float = 'left';
              divRight.style.wordBreak = 'break-all';
              const divClear = document.createElement('div');
              divClear.style.clear = 'both';
              div.appendChild(divLeft);
              div.appendChild(divRight);
              div.appendChild(divClear);
              td.appendChild(div);
            });

            tr.appendChild(td);
            tableBody.appendChild(tr);
          });

          const tableRoot = tooltipEl.querySelector('table');

          // Remove old children
          while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
          }

          // Add new children
          tableRoot.appendChild(tableBody);
        }

        const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.font = tooltip.options.bodyFont.string;
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
      },

      getMetricName(metricAndValues, index) {
        if (metricAndValues.metric) {
          if (this.label === 'all') {
            return `{${Object.keys(metricAndValues.metric).map((k) => {
              return `${k}=${metricAndValues.metric[k]}`;
            })}}`;
          }
          if (metricAndValues.metric[this.label]) {
            return metricAndValues.metric[this.label];
          }
          if (metricAndValues.metric['container']) {
            return metricAndValues.metric['container'];
          }
          if (Object.values(metricAndValues.metric).length > 0) {
            return Object.values(metricAndValues.metric)[0];
          }
        }
        return this.$route.params.name || `${this.$root.$t('data.data')}${index + 1}`;
      },
      loadDatasets() {
        const datasets = this.metrics.map((m, index) => {
          return {
            label: this.getMetricName(m, index),
            data: m.values.map((v) => {
              return { x: this.$moment(new Date(v[0] * 1000)), y: v[1] };
            }),
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
            fill: this.chartType === 'area',
            cubicInterpolationMode: 'default',
            tension: 0.3,
          };
        });

        return datasets;
      },
      getType() {
        if (this.unit === 'short') {
          return 'short';
        }
        return Object.keys(this.allUnit).find((u) => {
          const inUnit = this.allUnit[u].some((n) => {
            return n.toLocaleLowerCase() === this.unit.toLocaleLowerCase();
          });
          return inUnit;
        });
      },
      unitBase(scaleNum, unitType, value) {
        switch (unitType) {
          case 'memory':
          case 'storage':
          case 'network':
          case 'bytes':
          case 'bytes/sec':
            scaleNum = 1024;
            break;
          case 'cpu':
          case 'timecost':
          case 'short':
            scaleNum = 1000;
            break;
          case 'seconds':
            scaleNum = 60;
            break;
          case 'percent':
            scaleNum = 100;
            break;
          case 'reqrate':
            break;
          case 'duration':
            break;
          case '%':
            return {
              scaleNum: `${parseFloat(value).toFixed(this.precision)} ${unitType}`,
              unitType: null,
              newValue: value,
            };
            break;
          default:
            if (this.unit) {
              unitType = this.getType();
              if (unitType) {
                return this.unitBase(scaleNum, unitType, value);
              } else {
                return {
                  scaleNum: `${parseFloat(value).toFixed(this.precision)} ${this.unit}`,
                  unitType: null,
                  newValue: value,
                };
              }
            }
            return {
              scaleNum: `${parseFloat(value).toFixed(this.precision)} ${unitType}`,
              unitType: null,
              newValue: value,
            };
        }
        if (this.unit) {
          const d = this.allUnit[unitType].findIndex((u) => {
            return u.toLocaleLowerCase() === this.unit.toLocaleLowerCase();
          });

          if (unitType === 'duration') {
            if (d <= 3) {
              value = value * Math.pow(1000, d);
            } else if (d <= 5) {
              value = value * Math.pow(1000, 3) * Math.pow(60, d - 3);
            } else if (d <= 6) {
              value = value * Math.pow(1000, 3) * Math.pow(60, 2) * Math.pow(24, d - 5);
            } else {
              value = value * Math.pow(1000, 3) * Math.pow(60, 2) * Math.pow(24, 1) * Math.pow(7, d - 6);
            }
          } else if (unitType === 'short') {
            value = value * Math.pow(scaleNum, 3);
          } else {
            value = value * Math.pow(scaleNum, d);
          }
        }
        return { scaleNum: scaleNum, unitType: unitType, newValue: value };
      },
      beautifyUnit(num, sclaeNum, units = [], unitType = '') {
        let result = parseFloat(num);
        for (const index in units) {
          if (Math.abs(result) <= sclaeNum || parseInt(index) === parseInt(units.length - 1)) {
            if (unitType === 'percent') {
              // 特殊处理
              if (result > 1 && result < 1.001) {
                return `${(result * 100).toFixed(this.precision)} %`;
              } else {
                return `${result.toFixed(this.precision)} %`;
              }
            }
            return `${result.toFixed(this.precision)} ${units[index]}`;
          }
          result /= sclaeNum;
        }
        if (unitType === 'percent') {
          return `${result.toFixed(this.precision)} %`;
        }
        return `${result.toFixed(this.precision)} Yi`;
      },
      beautifyDurationUnit(num) {
        let result = parseFloat(num);
        const units = ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'];
        let sclaeNum = 1000;
        for (const index in units) {
          if (index < 3) {
            sclaeNum = 1000;
          } else if (index < 5) {
            sclaeNum = 60;
          } else if (index < 6) {
            sclaeNum = 24;
          } else {
            sclaeNum = 7;
          }
          if (Math.abs(result) <= sclaeNum || parseInt(index) === parseInt(units.length - 1)) {
            return `${result.toFixed(this.precision)} ${units[index]}`;
          }
          result /= sclaeNum;
        }
        return `${result.toFixed(this.precision)} Yi`;
      },
      formatter(value) {
        if (value === 0) return '0';
        if (isNaN(value)) return '0';
        if (!value) return '';
        const { scaleNum, unitType, newValue } = this.unitBase(0, this.type, value);
        value = newValue;
        if (!unitType) {
          return scaleNum;
        }
        if (unitType === 'duration') {
          return this.beautifyDurationUnit(value, 2);
        } else {
          return this.beautifyUnit(value, scaleNum, this.allUnit[unitType], unitType, 2);
        }
      },
    },
  };
</script>
