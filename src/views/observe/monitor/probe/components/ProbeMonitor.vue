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
                  <td>{{ item.v }}</td>
                  <td>{{ item.t }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-divider class="mt-3" />

          <BaseAreaChart
            chart-type="line"
            :class="`mt-3 clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
            colorful
            :extend-height="350"
            :global-plugins-check="false"
            label="instance"
            :metrics="duration"
            :title="i18nLocal.t('tip.trend')"
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
    PROBE_DURATION_PROMQL,
    PROBE_AVG_DURATION_PROMQL,
    PROBE_MAX_DURATION_PROMQL,
    PROBE_AVAILABILITY_PROMQL,
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
      s: i18nLocal.t('tip.avg_duration'),
      v: undefined,
      t: undefined,
    },
    {
      s: i18nLocal.t('tip.max_duration'),
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
    if (data) duration.value = data;
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
        return d.values[0][1] === '1';
      }).length;
      statistics.value[2].v = `${((success / all) * 100).toFixed(1)}%`;
      statistics.value[2].t = moment(date.value[1]).format('YYYY-MM-DD HH:mm:ss');
    }
  };

  const getMaxDuration = async (): Promise<void> => {
    const query = PROBE_MAX_DURATION_PROMQL.replaceAll(
      '$1',
      `${probe.value.metadata.namespace}/${probe.value.metadata.name}`,
    ).replaceAll('$2', probe.value.spec.targets.staticConfig.static[0]);
    const data = await new Vector().getVector(props.env.clusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) {
      statistics.value[1].v = beautifyTime(data[0].value[1] as string, 1000000);
      statistics.value[1].t = moment(date.value[1]).format('YYYY-MM-DD HH:mm:ss');
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
      statistics.value[0].v = beautifyTime(data[0].value[1] as string, 1000000);
      statistics.value[0].t = moment(date.value[1]).format('YYYY-MM-DD HH:mm:ss');
    }
  };

  let interval: NodeJS.Timeout = undefined;
  const loadMetrics = () => {
    if (interval) clearInterval(interval);
    getDuration();
    getAvgDuration();
    getMaxDuration();
    getAvailability();
    interval = setInterval(() => {
      console.log(statistics);
      params.value.start = moment(params.value.start).utc().add(30, 'seconds').format();
      params.value.end = moment(params.value.end).utc().add(30, 'seconds').format();
      getDuration();
      getAvgDuration();
      getMaxDuration();
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
