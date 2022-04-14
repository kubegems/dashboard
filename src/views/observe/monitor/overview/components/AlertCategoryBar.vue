<template>
  <v-card
    class="pa-4 kubegems__h-24"
  >
    <div
      :style="{
        position: 'absolute',
        right: '10px',
        zIndex: '9',
        top: '24px',
      }"
    >
      <BaseDatetimePicker
        v-model="date"
        :default-value="1440"
        @change="onDatetimeChange(undefined)"
      />
    </div>

    <VueApexCharts
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      height="240px"
      :options="options"
      :series="series"
    />
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { getAlertGroup } from '@/api'
import VueApexCharts from 'vue-apexcharts'
import { toFixed } from '@/utils/helpers'

export default {
  name: 'AlertCategoryBar',
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
        text: '告警类别',
        offsetY: 20,
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
        show: false,
      },
      yaxis: {
        labels: {
          formatter: (v) => toFixed(v, 3),
        },
      },
      xaxis: {
        type: 'category',
        labels: {
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
        offsetY: -2,
      },
    }
    return {
      series: [],
      date: [],
    }
  },
  computed: {
    ...mapState(['Scale']),
  },
  watch: {
    tenant: {
      handler: function() {
        if (this.tenant) { this.alertGroupMetrics() }
      },
      deep: true,
    },
  },
  methods: {
    async alertGroupMetrics() {
      const data = await getAlertGroup({
        tenant: this.tenant.TenantName,
        groupby: 'alert_type',
        start: this.$moment(parseInt(this.date[0])).utc().format(),
        end: this.$moment(parseInt(this.date[1])).utc().format(),
      })
      this.series = data.map(d => {
        return {
          name: "数量",
          data: [{
            x: d.groupValue,
            y: [d.count],
          }],
        }
      })
    },
    onDatetimeChange() {
      this.alertGroupMetrics()
    },
  },
}
</script>
