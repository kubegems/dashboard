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
  <div class="mt-3">
    <v-row>
      <v-col cols="4">
        <v-card class="px-2 py-1">
          <BaseAreaChart
            chart-type="line"
            :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
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
      <v-col cols="4">
        <v-card class="px-2 py-1">
          <BaseAreaChart
            begin-at-zero
            chart-type="line"
            :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
            colorful
            :extend-height="300"
            :global-plugins-check="false"
            label="name"
            :metrics="errorRate"
            title="Error rate"
            type="reqrate"
          />
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card class="px-2 py-1">
          <BaseAreaChart
            chart-type="line"
            :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
            colorful
            :extend-height="300"
            :global-plugins-check="false"
            label="name"
            :metrics="duration"
            title="Duration"
            unit="s"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-3">
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30">
          <v-tab v-for="item in tabItems" :key="item.tab">
            {{ item.text }}
          </v-tab>
        </v-tabs>

        <component :is="tabItems[tab].value" :date="date" :env="env" :service="service" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { nextTick, ref, watch } from 'vue';

  import Operation from './Operation.vue';
  import Trace from './Trace/index.vue';
  import { useStore } from '@/store';
  import { Telemetry } from '@/types/opentelemetry';

  const store = useStore();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
      date?: string[];
      service?: string;
    }>(),
    {
      env: undefined,
      date: undefined,
      service: undefined,
    },
  );

  watch(
    () => props.date,
    async (newValue) => {
      if (newValue && newValue.length === 2 && props.env.clusterName && props.service) {
        kubeRequest.start = moment(props.date[0]).utc().format();
        kubeRequest.end = moment(props.date[1]).utc().format();
        nextTick(() => {
          getRequest();
        });
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.service,
    async (newValue) => {
      if (newValue && props.env.clusterName) {
        nextTick(() => {
          getRequest();
        });
      }
    },
    {
      deep: true,
    },
  );

  const requestRate = ref([]);
  const errorRate = ref([]);
  const duration = ref([]);
  const kubeRequest: KubeRequest = {
    start: '',
    end: '',
    noprocessing: true,
  };
  const getRequest = async (params: KubeRequest = kubeRequest): Promise<void> => {
    const data: { [key: string]: any } = await new Telemetry().getRequest(
      props.env.clusterName,
      props.env.namespace,
      props.service,
      params,
    );
    requestRate.value = data.requestRate.map((d) => {
      d.metric.name = 'Request Rate';
      return d;
    });
    errorRate.value = data.errorRate.map((d) => {
      d.metric.name = 'Error Rate';
      return d;
    });
    duration.value = []
      .concat(
        data.p75DurationSeconds.map((d) => {
          d.metric.name = 'p75';
          return d;
        }),
      )
      .concat(
        data.p90DurationSeconds.map((d) => {
          d.metric.name = 'p90';
          return d;
        }),
      );
  };

  const tab = ref(0);
  const tabItems = [
    { text: 'Operation', value: Operation, tab: 'operation' },
    { text: 'Trace', value: Trace, tab: 'trace' },
  ];
</script>
