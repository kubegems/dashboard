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
    :title="i18nLocal.t('resource.tip.resource_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 primary--text">
        {{ tenant ? tenant.TenantName : '' }}
      </span>
    </template>
    <template #action>
      <v-flex>
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatetimePicker v-model="date" color="primary" :default-value="30" @change="datetimeChanged" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')} mt-4`" flat>
        <v-card-text class="py-0">
          <BaseAreaChart
            :extend-height="280"
            label="tenant"
            :metrics="cpu"
            :title="i18nLocal.t('resource.tip.cpu_used')"
            type="cpu"
          />

          <BaseAreaChart
            :extend-height="280"
            label="tenant"
            :metrics="memory"
            :title="i18nLocal.t('resource.tip.memory_used')"
            type="memory"
          />
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useStore } from '@kubegems/extension/store';
  import { TENANT_CPU_USAGE_PROMQL, TENANT_MEMORY_USAGE_PROMQL } from '@kubegems/libs/constants/prometheus';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { onUnmounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import { Matrix } from '@/types/prometheus';

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    panel: false,
  });

  const params = ref({
    start: '',
    end: '',
  });

  const tenant = ref<Tenant>(undefined);
  const cluster = ref<Cluster>(undefined);

  const cpu = ref([]);
  const tenantCPUUsage = async () => {
    const query = TENANT_CPU_USAGE_PROMQL.replaceAll('$1', tenant?.value?.TenantName);
    const data = await new Matrix().getMatrix(cluster?.value?.ClusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) cpu.value = data;
  };

  const memory = ref([]);
  const tenantMemoryUsage = async () => {
    const query = TENANT_MEMORY_USAGE_PROMQL.replaceAll('$1', tenant?.value?.TenantName);
    const data = await new Matrix().getMatrix(cluster?.value?.ClusterName, {
      query: query,
      start: params.value.start,
      end: params.value.end,
    });
    if (data) memory.value = data;
  };

  let interval: NodeJS.Timeout = undefined;
  const loadMetrics = () => {
    if (interval) clearInterval(interval);
    tenantCPUUsage();
    tenantMemoryUsage();
    interval = setInterval(() => {
      params.value.start = moment(params.value.start).utc().add(30, 'seconds').format();
      params.value.end = moment(params.value.end).utc().add(30, 'seconds').format();
      tenantCPUUsage();
      tenantMemoryUsage();
    }, 30 * 1000);
  };

  onUnmounted(() => {
    clearInterval(interval);
  });

  const date = ref([]);
  const datetimeChanged = (): void => {
    params.value.start = moment(date.value[0]).utc().format();
    params.value.end = moment(date.value[1]).utc().format();
    loadMetrics();
  };

  const dispose = (): void => {
    clearInterval(interval);
  };

  const init = (item: any): void => {
    tenant.value = deepCopy(item.Tenant) as Tenant;
    cluster.value = deepCopy(item.Cluster) as Cluster;
    params.value.start = moment(date.value[0]).utc().format();
    params.value.end = moment(date.value[1]).utc().format();
    loadMetrics();
  };

  const open = (): void => {
    state.panel = true;
  };

  defineExpose({
    init,
    open,
  });
</script>
