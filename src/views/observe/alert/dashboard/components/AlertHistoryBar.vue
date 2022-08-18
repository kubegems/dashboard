<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-card class="kubegems__h-24" flat>
    <BaseSubTitle :divider="false" :title="$t('tip.alert_trend')" />
    <div :style="{ height: `100%`, width: `100%` }">
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

  import messages from '../../i18n';
  import { getAlertGraph } from '@/api';
  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'AlertHistoryBar',
    i18n: {
      messages: messages,
    },
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
          text: this.$root.$t('data.no_data'),
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
