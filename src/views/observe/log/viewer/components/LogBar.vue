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
  <v-flex :class="`pa-0`">
    <BaseBarChart
      id="log_bar"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
      :color="color"
      :extend-height="180"
      :labels="
        chart
          ? chart['xAxis-data'].map((x) => {
              return $moment(new Date(x * 1000)).format('LTS');
            })
          : []
      "
      :metrics="series"
    />
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import { THEME_COLORS } from '@/utils/chart';

  export default {
    name: 'LogBar',
    props: {
      chart: {
        type: Object,
        default: () => {
          return {
            'xAxis-data': [],
            'yAxis-data': {
              info: [],
              debug: [],
              error: [],
              warn: [],
              unknown: [],
            },
          };
        },
      },
    },
    computed: {
      ...mapState(['Scale']),
      color() {
        return THEME_COLORS;
      },
      series() {
        return [
          {
            label: 'Info',
            data: this.chart ? this.chart['yAxis-data'].info : [],
          },
          {
            label: 'Debug',
            data: this.chart ? this.chart['yAxis-data'].debug : [],
          },
          {
            label: 'Warn',
            data: this.chart ? this.chart['yAxis-data'].warn : [],
          },
          {
            label: 'Error',
            data: this.chart ? this.chart['yAxis-data'].error : [],
          },
          {
            label: 'Unknown',
            data: this.chart ? this.chart['yAxis-data'].unknown : [],
          },
        ];
      },
    },
  };
</script>
