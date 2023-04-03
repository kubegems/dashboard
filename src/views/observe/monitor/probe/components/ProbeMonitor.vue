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
  <BasePanel
    v-model="state.panel"
    icon="mdi-chart-areaspline-variant"
    :title="i18nLocal.t('tip.probe_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text" />
    </template>
    <template #action>
      <v-flex class="float-right">
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatetimePicker v-model="date" color="primary" :default-value="30" @change="datetimeChanged" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card class="mt-4" flat>
        <v-card-text class="py-0">
          <div class="text-subtitle-2">{{ i18nLocal.t('tip.base_info') }}</div>
          <template v-if="probe && probe.spec.module === 'http_2xx'">
            <div class="text-body-2 ml-4">
              <div class="http__div">
                {{ i18nLocal.t('tip.address') }}: {{ probe ? probe.spec.targets.staticConfig.static[0] : '' }}</div
              >
              <div class="http__div">
                HTTPS: {{ httpsEnabled === '0' ? i18nLocal.t('tip.disabled') : i18nLocal.t('tip.enabled') }}
              </div>
              <div class="http__div">
                {{ i18nLocal.t('tip.http_version') }}: {{ httpVersion === '0' ? 'http' : 'http2' }}
              </div>
              <template v-if="httpsEnabled === '1'">
                <div class="http__div">{{ i18nLocal.t('tip.tls_version') }}: {{ tlsVersion }}</div>
                <div class="http__div">{{ i18nLocal.t('tip.http_cert_expired') }}: {{ httpCertExpired }}</div>
              </template>
            </div>
          </template>

          <v-simple-table>
            <template #default>
              <thead>
                <tr>
                  <th class="text-left">{{ i18nLocal.t('table.statistics') }}</th>
                  <th class="text-left">{{ i18nLocal.t('table.value') }}</th>
                  <th class="text-left">{{ i18nLocal.t('table.time') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in statistics" :key="index">
                  <td>{{ item.s }}</td>
                  <td>{{ item.v || '-' }}</td>
                  <td>{{ item.t || '-' }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-divider class="mt-3" />

          <div class="text-subtitle-2 mt-5">{{ i18nLocal.t('tip.trend') }}</div>
          <BaseAreaChart
            chart-type="line"
            :class="`mt-3 clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
            colorful
            :extend-height="350"
            :global-plugins-check="false"
            label="instance"
            :metrics="duration"
            title=""
            unit="s"
          />
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onUnmounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import {
    PROBE_AVAILABILITY_PROMQL,
    PROBE_AVG_DURATION_PROMQL,
    PROBE_DURATION_PROMQL,
    PROBE_HTTPS_ENABLED_PROMQ,
    PROBE_HTTP_CERT_EXPIRY_PROMQ,
    PROBE_HTTP_TLS_VERSION_PROMQ,
    PROBE_HTTP_VERSION_PROMQ,
  } from '@/constants/prometheus';
  import { useStore } from '@/store';
  import { Matrix, Vector } from '@/types/prometheus';
  import { PrometheusProbe } from '@/types/prometheus_probe';
  import { beautifyTime } from '@/utils/helpers';

  const store = useStore();
  const i18nLocal = useI18n();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
    }>(),
    {
      env: undefined,
    },
  );

  const state = reactive({
    panel: false,
  });

  const date = ref([]);

  const probe = ref<PrometheusProbe>(undefined);
  const init = (item: PrometheusProbe): void => {
    probe.value = new PrometheusProbe(item);
    params.value.start = moment(date.value[0]).utc().format();
    params.value.end = moment(date.value[1]).utc().format();
    loadMetrics();
  };

  const open = (): void => {
    state.panel = true;
  };

  const statistics = ref([
    {
      s: i18nLocal.t('tip.min_duration'),
      v: undefined,
      t: undefined,
    },
    {
      s: i18nLocal.t('tip.max_duration'),
      v: undefined,
      t: undefined,
    },
    {
      s: i18nLocal.t('tip.avg_duration'),
      v: undefined,
      t: undefined,
    },
    {
      s: i18nLocal.t('tip.availability'),
      v: undefined,
      t: undefined,
    },
  ]);

  const params = ref({
    start: '',
    end: '',
  });
  const httpsEnabled = ref('');
  const getHttpsEnabled = async (): Promise<void> => {
    const query = PROBE_HTTPS_ENABLED_PROMQ.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    );
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) httpsEnabled.value = (data[0] ? data[0].value[1] : 0) as string;
  };

  const httpVersion = ref('');
  const getHttpVersion = async (): Promise<void> => {
    const query = PROBE_HTTP_VERSION_PROMQ.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    );
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) httpVersion.value = (data[0] ? data[0].value[1] : 0) as string;
  };

  const tlsVersion = ref('');
  const getTlsVersion = async (): Promise<void> => {
    const query = PROBE_HTTP_TLS_VERSION_PROMQ.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    );
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) tlsVersion.value = (data[0] ? data[0].metric?.version : '') as string;
  };

  const httpCertExpired = ref('');
  const getHttpCertExpired = async (): Promise<void> => {
    const query = PROBE_HTTP_CERT_EXPIRY_PROMQ.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    );
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data)
      httpCertExpired.value = (
        data[0] ? moment(new Date(parseInt(data[0].value[1] as string) * 1000)).format('YYYY-MM-DD HH:mm:ss') : 0
      ) as string;
  };

  const duration = ref([]);
  const getDuration = async (): Promise<void> => {
    const query = PROBE_DURATION_PROMQL.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    );
    const data = await new Matrix().getMatrix(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) {
      duration.value = data;
      const values = data[0]?.values?.map((d) => {
        return d[1] as number;
      });
      const maxDur = Math.max(...values);
      const maxTime = data[0]?.values?.[
        values.findIndex((v) => {
          return v.toString() === maxDur.toString();
        })
      ][0] as number;
      statistics.value[1].v = beautifyTime((maxDur.toString() || 0) as string, 1000000);
      statistics.value[1].t = moment(data[0] ? maxTime * 1000 : 0).format('YYYY-MM-DD HH:mm:ss');

      const minDur = Math.min(...values);
      const minTime = data[0]?.values?.[
        values.findIndex((v) => {
          return v.toString() === minDur.toString();
        })
      ][0] as number;
      statistics.value[0].v = beautifyTime((minDur.toString() || 0) as string, 1000000);
      statistics.value[0].t = moment(data[0] ? minTime * 1000 : 0).format('YYYY-MM-DD HH:mm:ss');
    }
  };

  const getAvailability = async (): Promise<void> => {
    const query = PROBE_AVAILABILITY_PROMQL.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    ).replaceAll('$2', probe.value.spec.targets.staticConfig.static[0]);
    const data = await new Matrix().getMatrix(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) {
      const all = data.length;
      const success = data.filter((d) => {
        return d.values?.[0]?.[1] === '1';
      }).length;
      statistics.value[3].v = `${((success / all) * 100).toFixed(1)}%`;
      statistics.value[3].t = '--';
    }
  };

  const getAvgDuration = async (): Promise<void> => {
    const query = PROBE_AVG_DURATION_PROMQL.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    ).replaceAll('$2', probe.value.spec.targets.staticConfig.static[0]);
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) {
      statistics.value[2].v = beautifyTime((data[0] ? data[0].value[1] : 0) as string, 1000000);
      statistics.value[2].t = '--';
    }
  };

  let interval: NodeJS.Timeout = undefined;
  const loadMetrics = () => {
    if (interval) clearInterval(interval);
    if (probe.value.spec.module === 'http_2xx') {
      getHttpsEnabled();
      getHttpVersion();
      getTlsVersion();
      getHttpCertExpired();
    }
    getDuration();
    getAvgDuration();
    getAvailability();
    interval = setInterval(() => {
      params.value.start = moment(params.value.start).utc().add(30, 'seconds').format();
      params.value.end = moment(params.value.end).utc().add(30, 'seconds').format();
      getDuration();
      getAvgDuration();
      getAvailability();
    }, 30 * 1000);
  };
  onUnmounted(() => {
    clearInterval(interval);
  });

  const datetimeChanged = (): void => {
    params.value.start = moment(date.value[0]).utc().format();
    params.value.end = moment(date.value[1]).utc().format();
    loadMetrics();
  };

  const dispose = (): void => {
    clearInterval(interval);
  };

  defineExpose({
    init,
    open,
  });
</script>

<style lang="scss" scoped>
  .http__div {
    line-height: 24px;
  }
</style>
