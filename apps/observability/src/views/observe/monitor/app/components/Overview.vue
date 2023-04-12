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
  <v-row>
    <v-col cols="6">
      <v-card class="mt-3 px-3 py-1">
        <BaseBarChart
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="400"
          horizontal
          :label-show="false"
          :metrics="metrics.dbOperationDurationSeconds"
          :title="i18nLocal.t('tip.db_operation')"
          type="time"
        />
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card class="mt-3 px-3 py-1">
        <BaseBarChart
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="400"
          horizontal
          :label-show="false"
          :metrics="metrics.serviceErrorCount"
          :title="i18nLocal.t('tip.service_error')"
        />
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card class="mt-3 px-3 py-1">
        <BaseBarChart
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="400"
          horizontal
          :label-show="false"
          :metrics="metrics.p90OperationDurationSeconds"
          :title="i18nLocal.t('tip.p90_operate_duration')"
          type="time"
        />
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card class="mt-3 px-3 py-1">
        <BaseBarChart
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="400"
          horizontal
          :label-show="false"
          :metrics="metrics.p90ServiceDurationSeconds"
          :title="i18nLocal.t('tip.p90_service_duration')"
          type="time"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import moment from 'moment';
  import { nextTick, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { Telemetry } from '@kubegems/api/typed/opentelemetry';

  const i18nLocal = useI18n();
  const store = useStore();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  type TelemetryValue = {
    x: string;
    y: string;
  };

  type TelemetryMetric = {
    data: TelemetryValue[];
    label: string;
  };

  type TelemetryMetrics = {
    [key: string]: TelemetryMetric[];
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
      date?: string[];
    }>(),
    {
      env: undefined,
      date: undefined,
    },
  );

  watch(
    () => props.env,
    async (newValue) => {
      if (newValue && newValue.clusterName && newValue.namespace) {
        nextTick(() => {
          getOverview();
        });
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => props.date,
    async (newValue) => {
      if (newValue && newValue.length === 2 && props.env.clusterName) {
        kubeRequest.start = moment(props.date[0]).utc().format();
        kubeRequest.end = moment(props.date[1]).utc().format();
        nextTick(() => {
          getOverview();
        });
      }
    },
    {
      deep: true,
    },
  );

  const metrics = ref<TelemetryMetrics>({});
  const kubeRequest: KubeRequest = {
    start: '',
    end: '',
  };
  const getOverview = async (params: KubeRequest = kubeRequest): Promise<void> => {
    const data: { [key: string]: any } = await new Telemetry().getOverview(
      props.env.clusterName,
      props.env.namespace,
      params,
    );
    metrics.value = {};
    Object.keys(data).forEach((key) => {
      const metric: TelemetryMetric = {
        data: [],
        label: '',
      };
      metric.data = data[key]
        .slice(0, 10)
        .map((t) => {
          return {
            y: t.labelvalue,
            x: parseFloat(t.value),
          };
        })
        .filter((t) => {
          return t.x > 0;
        });
      metrics.value[key] = [metric];
    });
  };
</script>
