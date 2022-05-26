<template>
  <v-flex :class="`pa-0 clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
    <VueApexCharts
      class="px-2"
      type="area"
      height="300"
      width="100%"
      :options="chartOptions.options"
      :series="chartOptions.series"
    />
    <div class="py-3 px-2">
      <div
        v-for="(val, index) in chart ? chart['table-data'] : []"
        :key="index"
        class="ma-1 pa-1"
        :style="`border-left: 3px solid ${$LINE_THEME_COLORS[index % 11]};font-size: 0.85rem;`"
      >
        <span class="pl-2">
          {{ index }}
        </span>
        {{ val }}
      </div>
    </div>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'LogLine',
  components: {
    VueApexCharts,
  },
  props: {
    chart: {
      type: Object,
      default: () => {
        return {
          'xAxis-data': [],
          'yAxis-data': {},
        }
      },
    },
  },
  computed: {
    ...mapState(['Scale']),
    chartOptions() {
      const series = []
      for (const key in this.chart ? this.chart['yAxis-data'] : {}) {
        series.push({
          name: key,
          data: this.chart['yAxis-data'][key],
        })
      }
      const options = {
        colors: this.$LINE_THEME_COLORS,
        chart: {
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
        xaxis: {
          categories: this.chart ? this.chart['xAxis-data'].map(d => { return parseInt(`${d}000`) }) : [],
          labels: {
            style: {
              cssClass: 'grey--text lighten-2--text fill-color',
            },
          },
        },
        yaxis: {
          labels: {
            formatter: (val) => {
              return parseInt(val)
            },
          },
        },
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        grid: {
          show: true,
          borderColor: 'rgba(0, 0, 0, .3)',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: true,
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
            formatter: function (val) {
              return val
            },
          },
        },
      }
      return { options, series }
    },
  },
}
</script>
