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
    <ScopeResourceLayout>
      <BaseBreadcrumb flat>
        <template #extend>
          <v-flex class="kubegems__full-right">
            <v-btn class="primary--text" small text @click="addTemplate">
              <v-icon left small> mdi-plus-box </v-icon>
              {{ i18n.t('operate.create_c', [i18n.t('resource.template')]) }}
            </v-btn>
          </v-flex>
        </template>
      </BaseBreadcrumb>

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
        <template #item.rule="{ item }">
          {{ item.showName }}
        </template>
        <template #item.unit="{ item }">
          {{ item.unit }}
        </template>
        <template #item.label="{ item, index }">
          <BaseCollapseChips :id="`p_label_${index}`" :chips="item.labels || []" icon="mdi-label" single-line />
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`r${index}`" />
          <v-menu :attach="`#r${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateTemplate(item)">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeTemplate(item)">
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
        @loaddata="getTemplateList"
      />
    </ScopeResourceLayout>

    <TemplateForm ref="template" @refresh="getTemplateList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import ScopeResourceLayout from './components/ScopeResourceLayout.vue';
  import TemplateForm from './components/TemplateForm.vue';
  import { useI18n } from './i18n';
  import { usePrometheusTemplatePagination } from '@/composition/prometheus';
  import { PrometheusTemplate } from '@/types/prometheus_template';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.rule'), value: 'rule', align: 'start' },
    { text: 'Expr', value: 'expr', align: 'start' },
    { text: i18nLocal.t('table.unit'), value: 'unit', align: 'start' },
    { text: i18nLocal.t('table.label'), value: 'label', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<PrometheusTemplate> = reactive<Pagination<PrometheusTemplate>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getTemplateList = async (): Promise<void> => {
    const data: Pagination<PrometheusTemplate> = await usePrometheusTemplatePagination(
      '_all',
      new PrometheusTemplate({ resourceID: query.value.resourceId }),
      pagination,
    );
    pagination = Object.assign(pagination, data);
  };

  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.resourceId) {
        pagination.page = 1;
        getTemplateList();
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const template = ref(null);
  const addTemplate = (): void => {
    if (!query.value.resourceId) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.select_resource'),
        color: 'warning',
      });
      return;
    }
    template.value.open();
  };

  const updateTemplate = (item: PrometheusTemplate): void => {
    template.value.init(item);
    template.value.open();
  };

  const removeTemplate = (item) => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.template')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.template')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        await new PrometheusTemplate(param.item).deletePrometheusTemplate('_all');
        getTemplateList();
      },
    });
  };
</script>
