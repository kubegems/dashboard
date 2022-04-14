<template>
  <v-card
    class="kubegems__h-24 pa-4"
  >
    <div style="height: 100%; width: 100%;">
      <VueApexCharts
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        height="240px"
        :options="options"
        :series="series"
      />
    </div>
  </v-card>
</template>

<script>
import { getAlertGraph } from '@/api'
import { mapState } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import { toFixed } from '@/utils/helpers'

export default {
  name: 'AlertHistoryLine',
  components: {
    VueApexCharts,
  },
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
  data () {
    this.options = {
      colors: this.$LINE_THEME_COLORS,
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
        text: '告警历史趋势',
        offsetY: 20,
        margin: 0,
        align: 'left',
        style: {
          fontSize: '1rem',
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
        showForSingleSeries: true,
        showForNullSeries: true,
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
            return moment(new Date(timestamp * 1000)).format('L')
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
        offsetY: -5,
      },
    }
    return {
      series: [],
    }
  },
  computed: {
    ...mapState(['Scale']),
  },
  watch: {
    tenant: {
      handler: function() {
        if (this.tenant) { this.alertGraphMetrics() }
      },
      deep: true,
    },
  },
  methods: {
    async alertGraphMetrics() {
      const data = await getAlertGraph({
        tenant: this.tenant.TenantName,
        start: this.$moment().utc().add(-30, 'days').format(),
        end: this.$moment().utc().format(),
      })
      this.series = data.map(d => {
        return {
          name: d.metric?.project,
          data: d.values,
        }
      })
    },
  },
}
</script>
