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
  <div :style="{ width: width, height: height }">
    <VueApexCharts
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      height="80%"
      :options="options"
      :series="series"
      type="pie"
    />
    <div v-for="(label, index) in labels" :key="index" class="text-caption ml-4">
      <v-icon small :style="{ color: $LINE_THEME_FUL_COLORS[index] }"> mdi-checkbox-blank-circle </v-icon>
      {{ label }}
    </div>
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import { mapState } from 'vuex';

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
    data() {
      return {
        width: '100%',
        height: '300px',
        series: [],
        labels: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
      options() {
        return {
          colors: this.$LINE_THEME_FUL_COLORS,
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
            text: this.$root.$t('data.no_data'),
            style: {
              fontSize: '13px',
            },
          },
          labels: this.labels,
        };
      },
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            const s = {};
            newValue.forEach((d) => {
              if (Object.prototype.hasOwnProperty.call(s, d?.stream[this.type])) {
                s[d?.stream[this.type]] += 1;
              } else {
                s[d?.stream[this.type]] = 1;
              }
            });

            this.labels = Object.keys(s);
            this.series = Object.values(s);
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
