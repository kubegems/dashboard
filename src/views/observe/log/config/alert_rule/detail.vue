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
                  <v-btn color="primary" small text @click="updateAlertRule"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeAlertRule"> {{ $root.$t('operate.delete') }} </v-btn>
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
        <AlertList ref="alertList" mode="logging" />
      </v-card-text>
    </v-card>

    <UpdateAlertRule ref="updateAlertRule" mode="logging" @refresh="alertRuleDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { deleteLogAlertRule, getLogAlertRuleDetail, getPrometheusAlertHistory } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import AlertBarChart from '@/views/observe/monitor/config/prometheusrule/components//AlertBarChart';
  import AlertList from '@/views/observe/monitor/config/prometheusrule/components/AlertList';
  import UpdateAlertRule from '@/views/observe/monitor/config/prometheusrule/components/UpdatePrometheusRule';
  import BaseAlert from '@/views/observe/monitor/config/prometheusrule/mixins/alert';

  export default {
    name: 'AlertRuleDetail',
    i18n: {
      messages: messages,
    },
    components: {
      AlertBarChart,
      AlertList,
      UpdateAlertRule,
    },
    mixins: [BaseAlert, BasePermission, BaseResource],
    data: () => ({
      date: [],
      alertRule: null,
      yaml: '',
      metrics: [],
      timeArray: [],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'Admin', 'Scale']),
    },
    watch: {
      '$route.fullPath'() {
        this.alertRule = null;
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
      async alertRuleDetail() {
        const data = await getLogAlertRuleDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
          {
            isAdmin: this.AdminViewport,
          },
        );
        this.yaml = data.origin;
        this.alertRule = data;
      },
      updateAlertRule() {
        this.$refs.updateAlertRule.open();
        this.$refs.updateAlertRule.init(this.alertRule);
      },
      removeAlertRule() {
        const item = this.alertRule;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.prometheus_rule')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.prometheus_rule')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteLogAlertRule(this.$route.query.cluster, param.item.namespace, param.item.name);
            this.$router.push({
              name: 'log-config',
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
        this.alertRuleChart();
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
      async alertRuleChart() {
        this.metrics = this.$options.data().metrics;
        if (this.alertRule === null || this.alertRule.origin.rules.length < 1) {
          await this.alertRuleDetail();
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
