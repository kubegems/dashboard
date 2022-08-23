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
  <BaseFullScreenDialog
    v-model="dialog"
    icon="mdi-chart-areaspline-variant"
    :title="`${$t('tip.monitor_panel')}--${graph.name}`"
    @dispose="dispose"
  >
    <template #action>
      <BaseDatetimePicker v-model="date" color="primary" :default-value="30" @change="onDatetimeChange(undefined)" />
    </template>
    <template #content>
      <v-card flat :height="outerHeight" :style="{ overflowY: 'auto' }">
        <!-- <v-row :style="{ maxHeight: `${maxHeight}px` }">
          <v-col v-for="label in labels" :key="label.text" class="py-1 px-4" cols="4">
            <v-autocomplete
              attach
              class="my-1"
              dense
              flat
              hide-details
              hide-selected
              :items="label.items"
              :label="label.text"
              multiple
              :no-data-text="$root.$t('data.no_data')"
              solo
              :value="labelpairs[label.text]"
              @change="onLabelChange($event, label.text)"
              @focus="onLoadLabelFocus(label.text)"
            >
              <template #selection="{ item, parent, index }">
                <v-chip v-if="index === 0" class="my-1" color="primary" small>
                  {{ item }}
                </v-chip>
                <v-chip v-if="index === 1" class="my-1" color="primary" small> +{{ parent.value.length - 1 }} </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row> -->
        <BaseApexAreaChart
          id="max"
          :animations-enable="false"
          chart-type="line"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="height"
          horizontal-align="left"
          label="all"
          :metrics="metrics"
          :no-data-offset-y="-24"
          single-tooptip
          title=""
          type=""
          :unit="graph.promqlGenerator ? getUnit(graph.promqlGenerator.unit) : getUnit(graph.unit)"
        />
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getMetricsQueryrange } from '@/api';

  export default {
    name: 'GraphMax',
    i18n: {
      messages: messages,
    },
    props: {
      environment: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      dialog: false,
      graph: {},
      namespace: '',
      metrics: [],
      timeinterval: null,
      date: [],
      params: {
        start: null,
        end: null,
      },
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      outerHeight() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
      height() {
        return window.innerHeight - 64 * this.Scale - 100;
      },
    },
    destroyed() {
      this.clearInterval();
    },
    mounted() {
      this.$nextTick(() => {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
      });
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(graph, namespace) {
        this.graph = graph;
        this.namespace = namespace;
        this.loadMetrics();
      },
      async loadMetrics() {
        this.clearInterval();
        this.getMetrics();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.getMetrics();
        }, 1000 * 30);
      },
      dispose() {
        this.graph = {};
        this.metrics = [];
        this.clearInterval();
      },
      clearInterval() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
      async getMetrics() {
        const params = this.graph.promqlGenerator
          ? this.graph.promqlGenerator
          : {
              expr: this.graph.expr,
              unit: this.graph.unit,
            };
        const data = await getMetricsQueryrange(
          this.environment.clusterName,
          this.namespace,
          Object.assign(this.params, params),
        );
        this.metrics = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
      getUnit(unit) {
        if (unit === 'short') {
          return 'short';
        }
        if (unit && unit?.indexOf('-') > -1) {
          return unit.substr(unit.indexOf('-') + 1);
        }
        return unit;
      },
      // onLoadLabelFocus(label) {
      //   this.$emit('loadLabel', label);
      // },
      // onLabelChange(value, label) {
      //   this.$emit('change', { label, value });
      // },
    },
  };
</script>
