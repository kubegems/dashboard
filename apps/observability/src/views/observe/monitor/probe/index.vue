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
          <ProjectEnvSelectCascade v-model="env" first :offset-y="0" reverse :tenant="store.getters.Tenant()" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.probe_name'), value: 'search' }"
          :filters="filters"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addProbe">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18n.t('resource.prometheus_probe')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.name="{ item }">
          <a class="text-subtitle-2" @click.stop="showProbeMonitor(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #item.type="{ item }">
          {{ item.spec.module }}
        </template>
        <template #item.probeInterval="{ item }">
          {{ item.spec.interval }}
        </template>
        <template #item.probeAddress="{ item }">
          {{ item.spec.targets.staticConfig.static.join(',') }}
        </template>
        <template #item.status>
          <BaseStatus bg-color="var(--success-color)" status="Running" />
        </template>
        <template #item.action="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateProbe(item)">
                    {{ $root.$t('operate.update') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeProbe(item)"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getProbeList"
      />
    </v-card>

    <ProbeMonitor ref="monitor" :env="env" />
    <ProbeForm ref="form" :env="env" @refresh="refresh" />
  </v-container>
</template>

<script lang="ts" setup>
  import { usePrometheusProbePagination } from '@kubegems/api/hooks/prometheus';
  import { PrometheusProbe } from '@kubegems/api/typed/prometheus_probe';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { nextTick, reactive, ref, watch } from 'vue';

  import ProjectEnvSelectCascade from '../../components/ProjectEnvSelectCascade.vue';
  import { useI18n } from '../i18n';
  import ProbeForm from './components/ProbeForm.vue';
  import ProbeMonitor from './components/ProbeMonitor.vue';

  const store = useStore();
  const env = ref(undefined);
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  watch(
    () => env.value,
    async (newValue) => {
      if (newValue && newValue.clusterName && newValue.namespace) {
        nextTick(() => {
          getProbeList();
        });
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start', sortable: false },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start' },
    { text: i18nLocal.t('table.probe_address'), value: 'probeAddress', align: 'start' },
    { text: i18nLocal.t('table.probe_interval'), value: 'probeInterval', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20, sortable: false },
  ];

  let pagination: Pagination<PrometheusProbe> = reactive<Pagination<PrometheusProbe>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getProbeList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<PrometheusProbe> = await usePrometheusProbePagination(
      new PrometheusProbe({ metadata: { namespace: env.value.namespace } }),
      env.value.clusterName,
      params,
    );
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const query = useQuery();
  const filters = [{ text: i18nLocal.t('filter.probe_name'), value: 'search', items: [] }];
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      if (env.value?.clusterName && env.value?.namespace) getProbeList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const removeProbe = (item: PrometheusProbe) => {
    const probe = new PrometheusProbe(item);
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.prometheus_probe')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.prometheus_probe')])} ${item.metadata.name}`,
        type: 'delete',
        name: item.metadata.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.metadata.name.length > 0) {
          await probe.deletePrometheusProbe(env.value.clusterName);
          getProbeList();
        }
      },
    });
  };

  const monitor = ref(null);
  const showProbeMonitor = (item: PrometheusProbe) => {
    monitor.value.init(item);
    monitor.value.open();
  };

  const form = ref(null);
  const updateProbe = (item: PrometheusProbe) => {
    form.value.init(item);
    form.value.open();
  };

  const addProbe = (): void => {
    form.value.open();
  };

  const refresh = (update = false): void => {
    if (!update) {
      pagination.page = 1;
    }
    getProbeList();
  };
</script>
