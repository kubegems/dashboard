<template>
  <v-card
    class="kubegems__h-24"
  >
    <BaseSubTitle
      title="告警类别"
      :divider="false"
    >
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <BaseDatetimePicker
            v-model="date"
            :default-value="1440"
            @change="onDatetimeChange(undefined)"
          />
        </v-sheet>
      </template>
    </BaseSubTitle>

    <VueApexCharts
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      height="290px"
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
    return {
      series: [],
      date: [],
      categories: [],
    }
  },
  computed: {
    ...mapState(['Scale']),
    options() {
      return {
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
              delay: 0,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
          width: 0,
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
          categories: this.categories,
          labels: {
            style: {
              cssClass: 'grey--text lighten-2--text fill-color',
            },
          },
          tooltip: {
            enabled: false,
          },
          tickAmount: 5,
        },
        tooltip: {
          theme: 'dark',
        },
        noData: {
          text: '暂无数据',
          offsetY: -13,
          style: {
            fontSize: '13px',
          },
        },
      }
    },
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
      const data = await getAlertGroup(this.tenant.ID, {
        groupby: 'alert_type',
        start: this.$moment(parseInt(this.date[0])).utc().format(),
        end: this.$moment(parseInt(this.date[1])).utc().format(),
      })
      this.categories = data.map(d => { return [d.groupValue ? d.groupValue : '未知'] })
      this.series = [{
        name: '数量',
        data: data.map(d => {
          return d.count
        }),
      }]
    },
    onDatetimeChange() {
      this.alertGroupMetrics()
    },
  },
}
</script>
