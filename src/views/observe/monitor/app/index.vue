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
  <v-container class="search" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ServiceSelect v-model="service" :date="date" :env="env" :offset-y="0" />
          <ProjectEnvSelectCascade v-model="env" first :offset-y="0" reverse :tenant="tenant" />
          <BaseDatetimePicker v-model="date" :default-value="30" :offset-y="0" @change="onDatetimeChange(undefined)" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <div class="search__main" flat :height="height">
      <v-row>
        <v-col cols="4">
          <v-card class="pa-2">
            <BaseAreaChart
              id="latency"
              chart-type="line"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
              colorful
              :extend-height="300"
              :global-plugins-check="false"
              label="name"
              :metrics="latency"
              title="Latency"
              type="timecost"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card class="pa-2">
            <BaseAreaChart
              id="error_rate"
              begin-at-zero
              chart-type="line"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
              colorful
              :extend-height="300"
              :global-plugins-check="false"
              label="name"
              :metrics="errorRate"
              title="Error rate"
              type="percent"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card class="pa-2">
            <BaseAreaChart
              id="request_rate"
              chart-type="line"
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
              colorful
              :extend-height="300"
              :global-plugins-check="false"
              label="name"
              :metrics="requestRate"
              title="Request rate"
              type="reqrate"
            />
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mt-3 pa-4">
        <v-data-table
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="1000"
          :no-data-text="$root.$t('data.no_data')"
          :page="1"
        >
          <template #[`item.name`]="{ item }">
            {{ item.name }}
            <v-btn
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              color="white"
              depressed
              icon
              small
              @click.stop
            >
              <v-icon small @click.stop="toTrace(item)"> mdi-open-in-new </v-icon>
            </v-btn>
          </template>
          <template #[`item.latency`]="{ item }">
            <v-flex class="text-subtitle-2 float-right table__item mx-2">
              {{ item.latency && item.latency.length > 0 ? `${item.latency[0].toFixed(2)} us` : 0 }}
            </v-flex>
            <v-sparkline
              auto-draw
              :auto-draw-duration="200"
              auto-line-width
              color="rgba(29, 136, 229, 0.6)"
              fill
              :line-width="5"
              smooth
              type="trend"
              :value="item.latency ? item.latency : []"
            />
          </template>
          <template #[`item.requestRate`]="{ item }">
            <v-flex class="text-subtitle-2 float-right table__item mx-2">
              {{ item.requestRate && item.requestRate.length > 0 ? `${item.requestRate[0].toFixed(2)} req/s` : 0 }}
            </v-flex>
            <v-sparkline
              auto-draw
              :auto-draw-duration="200"
              auto-line-width
              color="rgba(29, 136, 229, 0.6)"
              fill
              :line-width="5"
              smooth
              type="trend"
              :value="item.requestRate ? item.requestRate : []"
            />
          </template>
          <template #[`item.errorRate`]="{ item }">
            <v-flex class="text-subtitle-2 float-right table__item mx-2">
              {{ item.errorRate && item.errorRate.length > 0 ? item.errorRate[0].toFixed(2) : 0 }}
            </v-flex>
            <v-sparkline
              auto-draw
              :auto-draw-duration="200"
              auto-line-width
              color="rgba(29, 136, 229, 0.6)"
              fill
              :line-width="5"
              smooth
              type="trend"
              :value="item.errorRate ? item.errorRate : []"
            />
          </template>
        </v-data-table>
      </v-card>
    </div>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ServiceSelect from './components/ServiceSelect';
  import { getAppPerformanceDashboard } from '@/api';
  import BasePermission from '@/mixins/permission';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'AppPerformance',
    components: {
      ProjectEnvSelectCascade,
      ServiceSelect,
    },
    mixins: [BasePermission],
    data() {
      return {
        cluster: undefined,

        missingPlugins: [],
        tenant: null,
        env: undefined,
        date: [],
        service: null,
        latency: [],
        errorRate: [],
        requestRate: [],
        items: [],
        params: {
          start: '',
          end: '',
        },

        timeinterval: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant']),
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
      headers() {
        return [
          { text: 'Name', value: 'name', align: 'start' },
          { text: 'P95 Latency', value: 'latency', align: 'start', width: 250 },
          { text: 'Request Rate', value: 'requestRate', align: 'start', width: 250 },
          { text: 'Error Rate', value: 'errorRate', align: 'start', width: 250 },
        ];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.cluster = newValue.clusterName;
            this.loadPluginCheck();
            this.latency = [];
            this.errorRate = [];
            this.requestRate = [];
            this.items = [];
          }
        },
        deep: true,
        immediate: true,
      },
      service: {
        handler(newValue) {
          if (newValue) {
            this.params.start = this.$moment(this.date[0]).utc().format();
            this.params.end = this.$moment(this.date[1]).utc().format();
            this.loadData(true);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_tenant'),
            color: 'warning',
          });
          return;
        }
        this.tenant = this.Tenant();
      });
    },
    destroyed() {
      this.clearInterval();
    },
    methods: {
      async loadPluginCheck() {
        this.missingPlugins = await this.m_permission_plugin_pass(this.cluster, this.$route.meta?.dependencies || []);
        if (this.missingPlugins?.length === 0) {
          //
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('plugin.cluster_missing', [this.missingPlugins.join(', ')]),
            color: 'warning',
          });
          return;
        }
      },
      async loadData() {
        this.clearInterval();
        this.appPerformanceDashboard(false, true);
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.appPerformanceDashboard(true);
        }, 1000 * 30);
      },
      onDatetimeChange() {
        if (this.env) {
          this.params.start = this.$moment(this.date[0]).utc().format();
          this.params.end = this.$moment(this.date[1]).utc().format();
          this.loadData();
        }
      },
      setTableValue(d, key) {
        const index = this.items.findIndex((l) => {
          return l.name === d.metric.operation;
        });
        const values = d.values.map((v) => {
          return isNaN(v[1]) ? 0 : parseFloat(v[1]);
        });
        if (index === -1) {
          this.items.push({
            name: d.metric.operation,
            latency: key === 'latency' ? values : [],
            requestRate: key === 'requestRate' ? values : [],
            errorRate: key === 'errorRate' ? values : [],
          });
        } else {
          const item = this.items[index];
          item[key] = values;
          this.$set(this.items, index, item);
        }
      },
      async appPerformanceDashboard(noprocess = false, tableRefresh = false) {
        this.items = [];
        const data = await getAppPerformanceDashboard(this.cluster, this.env?.namespace, {
          service: this.service,
          ...this.params,
          noprocessing: noprocess,
        });

        if (data) {
          let l = [];
          if (data.latencyP50 && data.latencyP50.length > 0) {
            data.latencyP50[0].metric['name'] = 'P50';
            l = l.concat(data.latencyP50);
          }
          if (data.latencyP75 && data.latencyP75.length > 0) {
            data.latencyP75[0].metric['name'] = 'P75';
            l = l.concat(data.latencyP75);
          }
          if (data.latencyP95 && data.latencyP95.length > 0) {
            data.latencyP95[0].metric['name'] = 'P95';
            l = l.concat(data.latencyP95);
          }
          this.latency = l;
          if (data.errorRate && data.errorRate.length > 0) {
            data.errorRate[0].metric['name'] = 'Error Rate';
            this.errorRate = data.errorRate;
          }
          if (data.requestRate && data.requestRate.length > 0) {
            data.requestRate[0].metric['name'] = 'Request Rate';
            this.requestRate = data.requestRate;
          }
          if (tableRefresh) {
            data.operationlatencyP95.forEach((d) => {
              this.setTableValue(d, 'latency');
            });

            data.operationRequestRate.forEach((d) => {
              this.setTableValue(d, 'requestRate');
            });

            data.operationErrorRate.forEach((d) => {
              this.setTableValue(d, 'errorRate');
            });
          }
        }
      },
      toTrace(item) {
        this.$router.push({
          name: 'observe-trace-search',
          query: {
            service: this.service,
            operation: item.name,
            start: this.date[0],
            end: this.date[1],
          },
        });
      },
      clearInterval() {
        if (this.timeinterval) clearInterval(this.timeinterval);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .table {
    &__item {
      line-height: 44px;
    }
  }
</style>
