<template>
  <v-card
    class="kubegems__h-24 pa-4"
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
  >
    <VueApexCharts
      height="240px"
      :options="options"
      :series="series"
    />
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import { toFixed } from '@/utils/helpers'

export default {
  name: 'AlertCategoryBar',
  components: {
    VueApexCharts,
  },
  data () {
    this.options = {
      chart: {
        type: 'bar',
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
        text: '当日告警TOP10',
        offsetY: 20,
        align: 'left',
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
      series: [
        {
          name: 'project1',
          data: [
            [Date.now(), 1],
            [Date.now() + 1000, 5],
            [Date.now() + 2000, 10],
            [Date.now() + 3000, 23],
          ],
        },
        {
          name: 'project2',
          data: [
            [Date.now(), 12],
            [Date.now() + 1000, 32],
            [Date.now() + 2000, 14],
            [Date.now() + 3000, 45],
          ],
        },
      ],
    }
  },
  computed: {
    ...mapState(['Scale']),
  },
}
</script>
