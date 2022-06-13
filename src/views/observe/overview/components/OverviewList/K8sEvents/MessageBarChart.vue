<template>
  <VueApexCharts
    :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    :height="height"
    :options="options"
    :series="series"
    type="bar"
    :width="width"
  />
</template>

<script>
  import moment from 'moment';
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'MessageBarChart',
    components: {
      VueApexCharts,
    },
    props: {
      data: {
        type: Array,
        default: () => [],
      },
      date: {
        type: Array,
        default: () => [],
      },
    },
    data() {
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
              delay: 0,
            },
          },
        },
        title: {
          text: '消息',
          align: 'left',
          margin: 5,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#757575',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
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
          show: true,
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
              return moment(new Date(timestamp)).format('LTS');
            },
            style: {
              cssClass: 'grey--text lighten-2--text fill-color',
            },
            rotate: -55,
            rotateAlways: true,
          },
          tooltip: {
            enabled: false,
          },
          tickAmount: 10,
        },
        tooltip: {
          theme: 'dark',
        },
        noData: {
          text: '暂无数据',
          offsetY: -28,
          style: {
            fontSize: '13px',
          },
        },
      };
      return {
        width: '100%',
        height: '100%',
        series: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            const timeArray = this.generateDateArray();
            this.loadSeries(newValue, timeArray);
          }
        },
        deep: true,
      },
    },
    methods: {
      generateDateArray() {
        const timeStep = (this.date[1] - this.date[0]) / 10;
        return '0123456789'
          .split('')
          .concat([10])
          .map((s) => {
            return this.date[0] + timeStep * s;
          });
      },
      loadSeries(data, timeArray) {
        const metrics = [];
        const types = ['Normal', 'Warning'];
        types.forEach((severity) => {
          metrics.push({
            metric: { name: severity },
            values: timeArray.map((d) => {
              return [d, 0];
            }),
          });
        });
        data.forEach((d) => {
          const time = Date.parse(this.$moment(d.stream.lastTimestamp));
          const index = timeArray.findIndex((t) => {
            return t >= time;
          });
          if (index > -1) {
            if (d.stream.type === 'Normal') {
              metrics[0].values[index][1] += 1;
            } else if (d.stream.type === 'Warning') {
              metrics[1].values[index][1] += 1;
            }
          }
        });
        this.series = metrics.map((metricAndValues) => {
          return {
            name:
              metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
                ? this.label
                  ? metricAndValues.metric[this.label]
                  : Object.values(metricAndValues.metric)[0]
                : this.$route.params.name,
            data: metricAndValues.values,
          };
        });
      },
    },
  };
</script>
