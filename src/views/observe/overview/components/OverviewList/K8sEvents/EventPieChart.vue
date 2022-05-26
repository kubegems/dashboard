<template>
  <div :style="{ width :width, height: height }">
    <VueApexCharts
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      type="pie"
      height="80%"
      :options="options"
      :series="series"
    />
    <div
      v-for="(label, index) in labels"
      :key="index"
      class="text-caption ml-4"
    >
      <v-icon
        small
        :style="{ color: $LINE_THEME_COLORS[index] }"
      >
        mdi-checkbox-blank-circle
      </v-icon>
      {{ label }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'MessageLineChart',
  components: {
    VueApexCharts,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: () => '',
    },
    type: {
      type: String,
      default: () => '',
    },
  },
  data () {
    return {
      width: '100%',
      height: '100%',
      series: [],
      labels: [],
    }
  },
  computed: {
    ...mapState(['Scale']),
    options() {
      return {
        colors: this.$LINE_THEME_COLORS,
        chart: {
          type: 'pie',
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
        title: {
          text: this.title,
          align: 'left',
          margin: 5,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#757575',
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            cssClass: 'grey--text lighten-2--text fill-color',
          },
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
          position: 'left',
        },
        tooltip: {
          theme: 'dark',
        },
        noData: {
          text: '暂无数据',
        },
        labels: this.labels,
      }
    },
  },
  watch: {
    data: {
      handler(newValue) {
        const s = {}
        newValue.forEach(d => {
          if (Object.prototype.hasOwnProperty.call(s, d?.stream[this.type])) {
            s[d?.stream[this.type]] += 1
          } else {
            s[d?.stream[this.type]] = 1
          }
        })

        this.labels = Object.keys(s)
        this.series = Object.values(s)
      },
      deep: true,
    },
  },
}
</script>
