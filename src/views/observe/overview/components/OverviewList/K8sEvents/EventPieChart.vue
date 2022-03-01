<template>
  <VueApexCharts
    type="pie"
    :width="width"
    :height="height"
    :options="options"
    :series="series"
  />
</template>

<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'MessageLineChart',
  components: {
    VueApexCharts,
  },
  data () {
    this.options = {
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
            enabled: false,
          },
        },
      },
      title: {
        text: '事件类型',
        align: 'center',
        offsetY: 20,
        style: {
          fontSize: '1.25rem',
          fontWeight: 'bold',
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
        show: true,
        position: 'left',
      },
      tooltip: {
        theme: 'dark',
      },
      noData: {
        text: '暂无数据',
        offsetY: -18,
      },
      labels: ['类型1', '类型2', '类型3', '类型4', '类型5'],
    }

    return {
      width: '100%',
      height: '100%',
      series: [10, 14, 9, 32, 121],
    }
  },
}
</script>
