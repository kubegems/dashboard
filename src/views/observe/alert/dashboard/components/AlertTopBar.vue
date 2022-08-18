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
    <BaseSubTitle :divider="false" :title="$t('tip.top_10')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <BaseDatetimePicker v-model="date" :default-value="1440" @change="onDatetimeChange(undefined)" />
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
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAlertGroup } from '@/api';
  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'AlertCategoryBar',
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
      return {
        series: [],
        date: [],
        categories: [],
      };
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
                enabled: false,
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
            text: this.$root.$t('data.no_data'),
            offsetY: -13,
            style: {
              fontSize: '13px',
            },
          },
        };
      },
    },
    watch: {
      tenant: {
        handler: function () {
          if (this.tenant) {
            this.alertGroupMetrics();
          }
        },
        deep: true,
      },
    },
    methods: {
      async alertGroupMetrics() {
        const data = await getAlertGroup(this.tenant.ID, {
          groupby: 'project_name',
          start: this.$moment(parseInt(this.date[0])).utc().format(),
          end: this.$moment(parseInt(this.date[1])).utc().format(),
        });
        this.categories = data.map((d) => {
          return [d.groupValue ? d.groupValue : this.$root.$t('data.unknown')];
        });
        this.series = [
          {
            name: this.$t('tip.count'),
            data: data.map((d) => {
              return d.count;
            }),
          },
        ];
      },
      onDatetimeChange() {
        this.alertGroupMetrics();
      },
    },
  };
</script>
