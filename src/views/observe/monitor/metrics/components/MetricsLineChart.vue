<template>
  <VueApexCharts type="line" :width="width" :height="height" :options="options" :series="series" />
</template>

<script>
  import { toFixed } from '@/utils/helpers';
  import VueApexCharts from 'vue-apexcharts';
  import moment from 'moment';

  export default {
    name: 'MetricsLineChart',
    components: { VueApexCharts },
    props: {
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        default: '',
      },
      series: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      options() {
        return {
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
                delay: 0,
              },
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
            width: 2,
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
              formatter: (v) => toFixed(v, 3) + this.unit,
            },
          },
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeUTC: false,
              formatter: function (value, timestamp) {
                return moment(new Date(timestamp * 1000)).format('LTS');
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
            offsetY: -16,
            style: {
              fontSize: '13px',
            },
          },
        };
      },
    },
  };
</script>
