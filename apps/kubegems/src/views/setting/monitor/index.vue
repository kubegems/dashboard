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
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.template_name'), value: 'search' }"
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
                <v-btn color="primary" text @click="addMonitorDashboardTemplate">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18n.t('resource.monitor_template')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.name="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="toMonitorTemplateDetail(item)">
            {{ item.name }}
          </a>
        </template>
        <template #item.graphCount="{ item }">
          {{ item.graphs.length }}
        </template>
        <template #item.action="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu :attach="`#r${item.ID}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateMonitorDashboardTemplate(item)">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeMonitorDashboardTemplate(item)">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
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
        @loaddata="getMonitorTemplateList"
      />
    </v-card>

    <MonitorTemplateForm ref="monitorTemplate" @refresh="getMonitorTemplateList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import MonitorTemplateForm from './components/MonitorTemplateForm.vue';
  import { useI18n } from './i18n';
  import { useMonitorTemplatePagination } from '@/composition/monitor_template';
  import { MonitorTemplate } from '@/types/monitor_template';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.description'), value: 'description', align: 'start' },
    { text: i18nLocal.t('table.refresh'), value: 'refresh', align: 'start' },
    { text: i18nLocal.t('table.graph_count'), value: 'graphCount', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<MonitorTemplate> = reactive<Pagination<MonitorTemplate>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getMonitorTemplateList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<MonitorTemplate> = await useMonitorTemplatePagination(
      new MonitorTemplate(),
      params.page,
      params.size,
      params.search,
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

  const filters = [{ text: i18nLocal.t('filter.template_name'), value: 'search', items: [] }];
  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      getMonitorTemplateList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const removeMonitorDashboardTemplate = (item: MonitorTemplate): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.monitor_template')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.monitor_template')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        await new MonitorTemplate(param.item).deleteMonitorTemplate();
        getMonitorTemplateList();
      },
    });
  };

  const toMonitorTemplateDetail = (item: MonitorTemplate): void => {
    router.push({
      name: 'monitor-template-detail',
      params: {
        name: item.name,
      },
    });
  };

  const monitorTemplate = ref(null);
  const addMonitorDashboardTemplate = (): void => {
    monitorTemplate.value.open();
  };

  const updateMonitorDashboardTemplate = (item: MonitorTemplate): void => {
    monitorTemplate.value.init(item);
    monitorTemplate.value.open();
  };
</script>
