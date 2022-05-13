<template>
  <v-card
    class="kubegems__h-24"
  >
    <BaseSubTitle
      title="告警历史趋势"
      :divider="false"
    />
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
import { toFixed } from '@/utils/helpers'

import moment from 'moment'

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
      const data = await getAlertGraph(this.tenant.ID, {
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
