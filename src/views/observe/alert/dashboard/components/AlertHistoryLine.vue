<template>
  <v-card class="kubegems__h-24">
    <BaseSubTitle :divider="false" title="告警历史趋势" />
    <div style="height: 100%; width: 100%">
      <VueApexCharts
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        height="290px"
        :options="options"
        :series="series"
      />
    </div>
  </v-card>
</template>

<script>
  import moment from 'moment';
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import { getAlertGraph } from '@/api';
  import { toFixed } from '@/utils/helpers';

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
    data() {
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
              return moment(new Date(timestamp * 1000)).format('L');
            },
            style: {
              cssClass: 'grey--text lighten-2--text fill-color',
            },
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
          offsetY: -12,
          style: {
            fontSize: '13px',
          },
        },
      };
      return {
        series: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      tenant: {
        handler: function () {
          if (this.tenant) {
            this.alertGraphMetrics();
          }
        },
        deep: true,
      },
    },
    methods: {
      async alertGraphMetrics() {
        const data = await getAlertGraph(this.tenant.ID, {
          start: this.$moment().utc().add(-30, 'days').format(),
          end: this.$moment().utc().format(),
        });
        this.series = data.map((d) => {
          return {
            name: d.metric?.project,
            data: d.values,
          };
        });
      },
    },
  };
</script>
