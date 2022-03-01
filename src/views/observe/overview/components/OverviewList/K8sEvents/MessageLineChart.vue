<template>
  <VueApexCharts
    type="line"
    :width="width"
    :height="height"
    :options="options"
    :series="series"
  />
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import { toFixed } from '@/utils/helpers'

export default {
  name: 'MessageLineChart',
  components: {
    VueApexCharts,
  },
  data () {
    this.options = {
      chart: {
        type: 'line',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        animations: {
          animateGradually: {
            enabled: false,
          },
        },
      },
      title: {
        text: '消息',
        offsetY: 20,
        align: 'center',
        style: {
          fontSize: '1.25rem',
          fontWeight: 'bold',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        width: 1,
      },
      grid: {
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
      legend: {
        show: true,
        position: 'top',
      },
      yaxis: {
        labels: {
          formatter: (v) => toFixed(v, 3),
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          formatter: function (value, timestamp) {
            return moment(new Date(timestamp * 1000)).format('LTS')
          },
          style: {
            cssClass: 'grey--text lighten-2--text fill-color',
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      tooltip: {
        theme: 'dark',
      },
      noData: {
        text: '暂无数据',
        offsetY: -18,
      },
    }

    return {
      width: '100%',
      height: '100%',
      series: [
        {
          name: 'normal',
          data: [
            [Date.now(), 1],
            [Date.now() + 1000, 5],
            [Date.now() + 2000, 10],
          ],
        },
        {
          name: 'warning',
          data: [
            [Date.now(), 12],
            [Date.now() + 1000, 32],
            [Date.now() + 2000, 14],
          ],
        },
      ],
    }
  },
}
</script>
