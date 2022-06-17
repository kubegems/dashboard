<template>
  <VueApexCharts
    ref="vueApexCharts"
    :type="chartType"
    :width="`${width}%`"
    :height="height"
    :options="getOptions(title, id)"
    :series="series"
  ></VueApexCharts>
</template>

<script>
  import { mapState } from 'vuex';
  import VueApexCharts from 'vue-apexcharts';
  import moment from 'moment';

  export default {
    name: 'BaseApexAreaChart',
    components: {
      VueApexCharts,
    },
    props: {
      chartType: {
        type: String,
        default: () => 'area',
      },
      extendHeight: {
        type: Number,
        default: () => 280,
      },
      id: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => null,
      },
      labelShow: {
        type: Boolean,
        default: () => true,
      },
      metrics: {
        type: Array,
        default: () => [],
      },
      mini: {
        type: Boolean,
        default: () => false,
      },
      noDataOffsetY: {
        type: Number,
        default: () => -17,
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
        type: Number,
        default: () => 100,
      },
    },
    data: () => ({
      series: [],
      timeinterval: null,
      height: 250,
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
      },
    }),
    computed: {
      ...mapState(['Plugins']),
    },
    watch: {
      metrics: {
        handler(newValue) {
          if (newValue && newValue?.length > 0) {
            this.loadData();
          }
        },
        deep: true,
        immediate: true,
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
      getMetricName(metricAndValues, index) {
        if (metricAndValues.metric) {
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
        return this.$route.params.name || `数据${index + 1}`;
      },
      async loadData() {
        let series = [];
        series = series.concat(
          this.metrics.map((metricAndValues, index) => {
            return {
              name: this.getMetricName(metricAndValues, index),
              data: metricAndValues.values,
            };
          }),
        );
        const timeout = setTimeout(() => {
          if (this.$refs.vueApexCharts) {
            this.$refs.vueApexCharts.updateSeries(series, false, true);
            if (!this.labelShow) {
              return;
            }
            const chartDiv = document.getElementById(`apexcharts${this.id}`);
            if (chartDiv) {
              const legends = chartDiv.getElementsByClassName('apexcharts-legend');
              if (legends) {
                const legend = legends[0];
                const height = parseInt(
                  window.getComputedStyle(legend).getPropertyValue('height').replaceAll('px', ''),
                );
                if (height / 18 > 1) {
                  this.height = this.extendHeight + height - 18;
                  const t = setTimeout(() => {
                    if (this.$refs.vueApexCharts) this.$refs.vueApexCharts.updateSeries(series, false, true);
                    clearTimeout(t);
                  }, 100);
                } else if (height === 0) {
                  this.height = this.extendHeight - 18;
                  const t = setTimeout(() => {
                    if (this.$refs.vueApexCharts) this.$refs.vueApexCharts.updateSeries(series, false, true);
                    clearTimeout(t);
                  }, 100);
                }
              }
            }
          }
          clearTimeout(timeout);
        }, 200);
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
          case '%':
            return { scaleNum: `${value.toFixed(2)} ${unitType}`, unitType: null, newValue: value };
            break;
          default:
            if (this.unit) {
              unitType = this.getType();
              if (unitType) {
                return this.unitBase(scaleNum, unitType, value);
              } else {
                return {
                  scaleNum: `${value.toFixed(2)} ${this.unit}`,
                  unitType: null,
                  newValue: value,
                };
              }
            }
            return { scaleNum: `${value.toFixed(2)} ${unitType}`, unitType: null, newValue: value };
        }
        if (this.unit) {
          const d = this.allUnit[unitType].findIndex((u) => {
            return u.toLocaleLowerCase() === this.unit.toLocaleLowerCase();
          });
          if (unitType === 'duration') {
            if (d < 3) {
              value = value * Math.pow(1000, d);
            } else if (index < 5) {
              value = value * Math.pow(1000, d) * Math.pow(1000, d - 3);
            } else if (index < 6) {
              value = value * Math.pow(1000, d) * Math.pow(1000, d - 3) * Math.pow(24, d - 5);
            } else {
              value = value * Math.pow(1000, d) * Math.pow(1000, d - 3) * Math.pow(24, d - 5) * Math.pow(7, d - 6);
            }
          } else if (unitType === 'short') {
            value = value * Math.pow(scaleNum, 3);
          } else {
            value = value * Math.pow(scaleNum, d);
          }
        }
        return { scaleNum: scaleNum, unitType: unitType, newValue: value };
      },
      beautifyUnit(num, sclaeNum, units = [], unitType = '', decimal = 1) {
        let result = num;
        for (const index in units) {
          if (Math.abs(result) < sclaeNum) {
            if (unitType === 'percent') {
              return `${result.toFixed(decimal)} %`;
            }
            return `${result.toFixed(decimal)} ${units[index]}`;
          }
          result /= sclaeNum;
        }
        if (unitType === 'percent') {
          return `${result.toFixed(decimal)} %`;
        }
        return `${result.toFixed(decimal)} Yi`;
      },
      beautifyDurationUnit(num, decimal = 1) {
        let result = num;
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

          if (Math.abs(result) < sclaeNum) {
            return `${result.toFixed(decimal)} ${units[index]}`;
          }
          result /= sclaeNum;
        }
        return `${result.toFixed(decimal)} Yi`;
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
          return this.beautifyDurationUnit(value, 1);
        } else {
          return this.beautifyUnit(value, scaleNum, this.allUnit[unitType], unitType, 1);
        }
      },
      getOptions(title, id) {
        return {
          colors: this.$LINE_THEME_COLORS,
          chart: {
            toolbar: {
              show: false,
            },
            id: id,
            animations: {
              animateGradually: {
                enabled: false,
                delay: 0,
              },
              dynamicAnimation: {
                speed: 50,
              },
            },
          },
          title: {
            text: title || '',
            margin: 5,
            offsetY: 5,
            style: {
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#757575',
            },
          },
          xaxis: {
            type: 'datetime',
            labels: {
              show: !this.mini,
              datetimeUTC: false,
              formatter: function (value, timestamp) {
                return moment(new Date(timestamp * 1000)).format('LTS');
              },
              style: {
                cssClass: 'grey--text lighten-2--text fill-color',
              },
              rotate: -30,
              rotateAlways: true,
            },
            tooltip: {
              enabled: false,
            },
            tickAmount: 10,
          },
          yaxis: {
            show: !this.mini,
            labels: {
              formatter: (value) => {
                return this.formatter(value);
              },
            },
            tickAmount: 5,
            forceNiceScale: true,
          },
          stroke: {
            curve: 'smooth',
            width: 1,
          },
          fill: {
            type: 'solid',
            opacity: 0.7,
          },
          grid: {
            show: !this.mini,
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
                return this.formatter(value);
              },
            },
          },
          legend: {
            show: this.labelShow,
            showForSingleSeries: true,
            showForNullSeries: false,
          },
          noData: {
            text: this.Plugins['monitoring'] ? '暂无数据' : '插件monitoring未启用',
            offsetY: this.noDataOffsetY,
            style: {
              fontSize: '13px',
            },
          },
        };
      },
    },
  };
</script>
