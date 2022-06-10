<template>
  <VueApexCharts
    ref="vueApexCharts"
    type="line"
    :width="`${width}%`"
    :height="extendHeight"
    :options="getOptions(title)"
    :series="series"
  />
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import moment from 'moment';

  export default {
    name: 'SampleAreaChart',
    components: { VueApexCharts },
    props: {
      extendHeight: {
        type: Number,
        default: () => 250,
      },
      width: {
        type: Number,
        default: () => 100,
      },
      metrics: {
        type: Array,
        default: () => [],
      },
      title: {
        type: String,
        default: () => null,
      },
    },
    data: () => ({
      series: [],
      timeinterval: null,
    }),
    watch: {
      metrics: {
        handler() {
          this.loadData();
        },
        deep: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      async loadData() {
        let series = [];
        series = series.concat(
          this.metrics.map((metricAndValues) => {
            return {
              name:
                metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
                  ? this.label
                    ? metricAndValues.metric[this.label]
                    : Object.values(metricAndValues.metric)[0]
                  : this.$route.params.name,
              data: metricAndValues.values,
            };
          }),
        );
        const timeout = setTimeout(() => {
          if (this.$refs.vueApexCharts) {
            this.$refs.vueApexCharts.updateSeries(series, false, true);
          }
          clearTimeout(timeout);
        }, 200);
      },
      getOptions(title) {
        return {
          subtitle: {
            text: title,
            align: 'left',
            margin: 0,
            offsetX: -10,
            offsetY: 0,
            style: {
              fontSize: '12px',
              fontFamily: undefined,
              color: '#FFFFFF',
              fontWeight: 'normal',
            },
          },
          colors: ['#ffffff'],
          grid: {
            show: false,
            padding: {
              left: 0,
              right: 0,
            },
          },
          chart: {
            toolbar: {
              show: false,
            },
            sparkline: {
              enabled: true,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 2,
          },
          fill: {
            type: 'solid',
            opacity: 0.5,
          },
          // 线条颜色
          tooltip: {
            theme: 'dark',
            y: {
              formatter: function (val) {
                return `${parseFloat(val).toFixed(2)} %`;
              },
            },
            fixed: {
              enabled: true,
              position: 'bottomLeft',
              offsetY: 100,
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
              rotate: -30,
              rotateAlways: true,
            },
            tooltip: {
              enabled: false,
            },
          },
          noData: {
            text: '暂无数据',
            offsetX: -30,
            offsetY: 0,
            style: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          },
        };
      },
    },
  };
</script>
