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
  <v-flex :class="`pa-0 clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
    <BaseAreaChart
      id="log_line"
      chart-type="line"
      :labels="
        chart
          ? chart['xAxis-data'].map((x) => {
              return $moment(new Date(x * 1000)).format('LTS');
            })
          : []
      "
      :metrics="chartOptions.series"
      unit=""
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
  import { mapState } from 'vuex';

  export default {
    name: 'LogLine',
    props: {
      chart: {
        type: Object,
        default: () => {
          return {
            'xAxis-data': [],
            'yAxis-data': {},
          };
        },
      },
    },
    computed: {
      ...mapState(['Scale']),
      chartOptions() {
        const series = [];
        for (const key in this.chart ? this.chart['yAxis-data'] : {}) {
          series.push({
            label: key,
            values: this.chart['yAxis-data'][key],
          });
        }
        return { series };
      },
    },
  };
</script>
