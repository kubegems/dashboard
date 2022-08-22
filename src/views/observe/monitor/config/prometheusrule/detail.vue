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
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange" />
          <v-menu v-if="m_permisson_resourceAllow($route.query.env)" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updatePrometheusRule">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removePrometheusRule">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-row>
      <v-col cols="6">
        <v-card class="mt-0" flat>
          <BaseSubTitle class="pa-2" :divider="false" :title="$t('tip.rule_detail')" />
          <v-card-text class="px-6 pt-0" :style="{ overflowY: 'auto', height: '330px' }">
            <pre class="yaml-pre">{{ yaml }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="mt-0" flat>
          <BaseSubTitle class="pa-2" :divider="false" :title="$t('tip.alert_trend')" />
          <v-card-text class="px-6 pt-0" :style="{ height: '330px' }">
            <AlertBarChart
              :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
              :extend-height="280"
              label="name"
              :metrics="metrics"
              :title="$t('tip.alert_count')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-card class="mt-3" flat>
      <v-card-text class="px-4 py-3">
        <AlertList ref="alertList" />
      </v-card-text>
    </v-card>

    <UpdatePrometheusRule ref="updatePrometheusRule" @refresh="prometheusRuleDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import AlertBarChart from './components/AlertBarChart';
  import AlertList from './components/AlertList';
  import UpdatePrometheusRule from './components/UpdatePrometheusRule';
  import BaseAlert from './mixins/alert';
  import { deletePrometheusRule, getPrometheusAlertHistory, getPrometheusRuleDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'PrometheusRuleDetail',
    i18n: {
      messages: messages,
    },
    components: {
      AlertBarChart,
      AlertList,
      UpdatePrometheusRule,
    },
    mixins: [BaseAlert, BasePermission, BaseResource],
    data: () => ({
      date: [],
      prometheusRule: null,
      yaml: '',
      metrics: [],
      timeArray: [],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'Admin', 'Scale']),
    },
    watch: {
      '$route.fullPath'() {
        this.prometheusRule = null;
        this.init();
      },
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        if (this.$route.query.createAt) {
          const time = new Date(this.$route.query.createAt).getTime();
          this.date = [time - 5 * 60 * 1000, time + 5 * 60 * 1000];
        }
        this.updateRule();
      },
      onDatetimeChange() {
        this.updateRule();
      },
      async prometheusRuleDetail() {
        const data = await getPrometheusRuleDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          {
            isAdmin: this.AdminViewport,
          },
        );
        this.yaml = data.origin;
        this.prometheusRule = data;
      },
      updatePrometheusRule() {
        this.$refs.updatePrometheusRule.open();
        this.$refs.updatePrometheusRule.init(this.prometheusRule);
      },
      removePrometheusRule() {
        const item = this.prometheusRule;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.prometheus_rule')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.prometheus_rule')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deletePrometheusRule(this.$route.query.cluster, param.item.namespace, param.item.name, {
              source: param.item.source,
            });
            this.$router.push({
              name: 'observe-monitor-config',
              params: this.$route.params,
              query: this.$route.query,
            });
          },
        });
      },
      async updateRule() {
        this.$refs.alertList.setParams({
          CreatedAt_gte: this.$moment(this.date[0]).format(),
          CreatedAt_lte: this.$moment(this.date[1]).format(),
        });
        this.$refs.alertList.init();
        this.generateDateArray();
        this.prometheusRuleChart();
      },
      generateDateArray() {
        const timeStep = (this.date[1] - this.date[0]) / 10;
        this.timeArray = '0123456789'
          .split('')
          .concat([10])
          .map((s) => {
            return this.date[0] + timeStep * s;
          });
      },
      async prometheusRuleChart() {
        this.metrics = this.$options.data().metrics;
        if (this.prometheusRule === null || this.prometheusRule.origin.rules.length < 1) {
          await this.prometheusRuleDetail();
        }

        const data = await getPrometheusAlertHistory(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          {
            CreatedAt_gte: this.$moment(this.date[0]).format(),
            CreatedAt_lte: this.$moment(this.date[1]).format(),
            size: 10000,
            noprocessing: true,
          },
        );
        if (data.List) {
          const severitys = ['error', 'critical'];
          severitys.forEach((severity) => {
            this.metrics.push({
              metric: { name: severity },
              values: this.timeArray.map((d) => {
                return [d, 0];
              }),
            });
          });
          data.List.forEach((d) => {
            const time = Date.parse(this.$moment(d.CreatedAt));
            const index = this.timeArray.findIndex((t) => {
              return t >= time;
            });
            if (index > -1) {
              if (d.Labels.severity === 'error') {
                this.metrics[0].values[index][1] += d.Count;
              } else if (d.Labels.severity === 'critical') {
                this.metrics[1].values[index][1] += d.Count;
              }
            }
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .yaml-pre {
    white-space: break-spaces;
    word-break: break-all;
  }
</style>
