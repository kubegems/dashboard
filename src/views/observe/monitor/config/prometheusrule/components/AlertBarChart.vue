<template>
  <VueApexCharts
    ref="vueApexCharts"
    type="bar"
    width="100%"
    :height="height"
    :options="getOptions()"
    :series="series"
  />
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import { toFixed } from '@/utils/helpers'

import moment from 'moment'

export default {
  name: 'AlertBarChart',
  components: { VueApexCharts },
  props: {
    extendHeight: {
      type: Number,
      default: () => 250,
    },
    metrics: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: () => null,
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
        }
        clearTimeout(timeout)
      }, 200)
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
              return moment(new Date(timestamp)).format('LTS')
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
              return value
            },
          },
        },
        legend: {
          showForSingleSeries: true,
          showForNullSeries: false,
        },
        noData: {
          text: '暂无数据',
          offsetY: -30,
        },
      }
    },
  },
}
</script>
