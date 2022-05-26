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
import { mapState } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'

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
    id: {
      type: String,
      default: () => '',
    },
    extendHeight: {
      type: Number,
      default: () => 280,
    },
    width: {
      type: Number,
      default: () => 100,
    },
    metrics: {
      type: Array,
      default: () => [],
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
    label: {
      type: String,
      default: () => null,
    },
    labelShow: {
      type: Boolean,
      default: () => true,
    },
    mini: {
      type: Boolean,
      default: () => false,
    },
    noDataOffsetY: {
      type: Number,
      default: () => -17,
    },
  },
  data: () => ({
    series: [],
    timeinterval: null,
    height: 250,
    allUnit: {
      cpu: ['n', 'u', 'm', 'core', 'k'],
      cpucore: ['ncore', 'ucore', 'mcore', 'core', 'kcore'],
      memory: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
      storage: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'],
      network: ['bps', 'Kbps', 'Mbps', 'Gbps'],
      seconds: ['s', 'm', 'h'],
      timecost: ['us', 'ms', 's'],
      connrate: ['conn/s', 'kconn/s', 'mconn/s'],
      msgrate: ['msg/s', 'kmsg/s', 'mmsg/s'],
      bytes: ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'rb', 'zb'],
      bitrate: ['bit/s', 'kbit/s', 'mbit/s', 'gbit/s'],
      trace: ['us', 'ms', 's'],
    },
  }),
  computed: {
    ...mapState(['Plugins']),
  },
  watch: {
    metrics: {
      handler() {
        this.loadData()
      },
      deep: true,
    },
    extendHeight: {
      handler() {
        this.height = this.extendHeight
      },
      immediate: true,
    },
  },
  destroyed() {
    if (this.timeinterval) clearInterval(this.timeinterval)
  },
  methods: {
    async loadData() {
      let series = []
      series = series.concat(
        this.metrics.map((metricAndValues) => {
          return {
            name:
              metricAndValues.metric &&
              JSON.stringify(metricAndValues.metric) !== '{}'
                ? this.label
                  ? metricAndValues.metric[this.label]
                  : Object.values(metricAndValues.metric)[0]
                : this.$route.params.name,
            data: metricAndValues.values,
          }
        }),
      )
      const timeout = setTimeout(() => {
        if (this.$refs.vueApexCharts) {
          this.$refs.vueApexCharts.updateSeries(series, false, true)
          if(!this.labelShow) {
            return
          }
          const chartDiv = document.getElementById(`apexcharts${this.id}`)
          if (chartDiv) {
            const legends = chartDiv.getElementsByClassName('apexcharts-legend')
            if (legends) {
              const legend = legends[0]
              const height = parseInt(
                window
                  .getComputedStyle(legend)
                  .getPropertyValue('height')
                  .replaceAll('px', ''),
              )
              if (height / 18 > 1) {
                this.height = this.extendHeight + height - 18
                const t = setTimeout(() => {
                  if (this.$refs.vueApexCharts)
                    this.$refs.vueApexCharts.updateSeries(
                      series,
                      false,
                      true,
                    )
                  clearTimeout(t)
                }, 100)
              } else if (height === 0) {
                this.height = this.extendHeight - 18
                const t = setTimeout(() => {
                  if (this.$refs.vueApexCharts)
                    this.$refs.vueApexCharts.updateSeries(
                      series,
                      false,
                      true,
                    )
                  clearTimeout(t)
                }, 100)
              }
            }
          }
        }
        clearTimeout(timeout)
      }, 200)
    },
    getType() {
      return Object.keys(this.allUnit).find(u => {
        const inUnit = this.allUnit[u].some(n => {
          return n.toLocaleLowerCase() === this.unit
        })
        return inUnit
      })
    },
    unitBase(scaleNum, unitType, value) {
      switch (unitType) {
        case 'memory':
        case 'storage':
        case 'network':
        case 'bytes':
        case 'bitrate':
          scaleNum = 1024
          break
        case 'connrate':
        case 'msgrate':
        case 'cpu':
        case 'timecost':
        case 'cpucore':
          scaleNum = 1000
          break
        case 'seconds':
          scaleNum = 60
          break
        case '%':
          return `${value.toFixed(2)} %`
          break
        default:
          if(this.unit) {
            unitType = this.getType()
            if (unitType) {
              return this.unitBase(scaleNum, unitType, value)
            } else {
              return { scaleNum: `${value.toFixed(2)} ${this.unit}`, unitType: null }
            }
          }
          return { scaleNum: `${value.toFixed(2)} ${unitType}`, unitType: null }
      }
      return { scaleNum: scaleNum, unitType: unitType }
    },
    formatter(value) {
      if (value === 0) return '0'
      if (isNaN(value)) return '0'
      if (!value) return ''
      const { scaleNum, unitType } = this.unitBase(0, this.type, value)
      if(!unitType) { return scaleNum }
      if (value / Math.pow(scaleNum, 3) >= 1) {
        return `${(value / Math.pow(scaleNum, 3)).toFixed(2)} ${
          this.allUnit[unitType][3]
        }`
      } else if (value / Math.pow(scaleNum, 2) >= 1) {
        return `${(value / Math.pow(scaleNum, 2)).toFixed(2)} ${
          this.allUnit[unitType][2]
        }`
      } else if (value / scaleNum >= 1) {
        return `${(value / scaleNum).toFixed(2)} ${this.allUnit[unitType][1]}`
      } else {
        return `${value.toFixed(2)} ${this.allUnit[unitType][0]}`
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
            },
          },
        },
        title: {
          text: title,
          margin: 5,
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
              return moment(new Date(timestamp * 1000)).format('LTS')
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
              return this.formatter(value)
            },
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
              return this.formatter(value)
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
      }
    },
  },
}
</script>
