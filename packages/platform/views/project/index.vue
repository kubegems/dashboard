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
        <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }" :filters="filters" />
        <v-sheet v-if="store.state.AdminViewport" class="text-subtitle-2 ml-4">
          {{ i18n.t('resource.tenant') }}
        </v-sheet>
        <v-sheet width="350">
          <v-autocomplete
            v-if="store.state.AdminViewport"
            v-model="tenant"
            chips
            class="ml-2"
            color="primary"
            dense
            flat
            full-width
            hide-details
            hide-selected
            :items="tenantItems"
            :label="i18n.t('resource.tenant')"
            :no-data-text="i18n.t('data.no_data')"
            prepend-inner-icon="mdi-account-switch"
            solo
            @change="tenantSelectChanged"
          >
            <template #selection="{ attrs, item, selected }">
              <v-chip color="primary" :input-value="selected" label small v-bind="attrs">
                <span class="pr-2">{{ item.text }}</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-sheet>
        <v-spacer />
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
        <template #item.projectName="{ item }">
          <span v-if="store.state.AdminViewport">{{ item.ProjectName }}</span>
        </template>
        <template #item.createdAt="{ item }">
          {{ item.CreatedAt ? moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #item.environment="{ item }">
          {{ item.Environments.length }}
        </template>
        <template #item.tenant="{ item }">
          {{ item.Tenant.TenantName }}
        </template>
        <template #item.projectAlias="{ item }">
          {{ item.ProjectAlias }}
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
                  <v-btn color="primary" small text @click="updateProject(item)">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeProject(item)">
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
        @loaddata="getProjectList"
      />
    </v-card>

    <ProjectBaseForm ref="project" @refresh="getProjectList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useProjectPagination } from '@kubegems/api/hooks/project';
  import { useTenantList } from '@kubegems/api/hooks/tenant';
  import { Project } from '@kubegems/api/typed/project';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useTenantAllow } from '@kubegems/extension/permission';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import moment from 'moment';
  import { computed, onMounted, reactive, ref, nextTick, watch } from 'vue';

  import ProjectBaseForm from './components/ProjectBaseForm.vue';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const headers = computed(() => {
    const items: { text: string; value: string; align: string; width?: number }[] = [
      { text: i18nLocal.t('table.name'), value: 'projectName', align: 'start' },
      { text: i18nLocal.t('table.alias'), value: 'projectAlias', align: 'start' },
      { text: i18nLocal.t('table.environment_space'), value: 'environment', align: 'start' },
      { text: i18nLocal.t('table.create_at'), value: 'createdAt', align: 'start' },
    ];
    if (store.state.Admin && store.state.AdminViewport) {
      items.splice(1, 0, {
        text: i18n.t('resource.tenant').toString(),
        value: 'tenant',
        align: 'start',
      });
    }
    if (useTenantAllow()) {
      items.push({ text: '', value: 'action', align: 'center', width: 20 });
    }
    return items;
  });

  let pagination: Pagination<Project> = reactive<Pagination<Project>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      search: '',
    },
  });

  const tenant = ref<number>(undefined);
  const tenantItems = ref<{ text: string; value: number }[]>([]);
  const getTenantList = async (): Promise<void> => {
    const data = await useTenantList(new Tenant());
    tenantItems.value = data.map((t) => {
      return {
        text: t.TenantName,
        value: t.ID,
      };
    });
  };

  const getProjectList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data = await useProjectPagination(new Project(), params.page, params.size, params.request);
    pagination = Object.assign(pagination, data);
  };

  const filters = [{ text: i18nLocal.t('filter.name'), value: 'search', items: [] }];

  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.request.search = newValue.value.search;
      } else {
        pagination.request.search = '';
      }
      getProjectList();
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

  const removeProject = (item: Project): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.project')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.project')])} ${item.ProjectName}`,
        type: 'delete',
        name: item.ProjectName,
      },
      param: { item },
      doFunc: async (param) => {
        await new Project(param.item).deleteProject();
        store.commit('CLEAR_RESOURCE');
        getProjectList();
      },
    });
  };

  const project = ref(null);
  const updateProject = (item: Project): void => {
    project.value.init(item);
    project.value.open();
  };

  const tenantSelectChanged = (): void => {
    if (tenant.value) getProjectList();
    else {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.tenant'),
        color: 'warning',
      });
    }
  };

  onMounted(() => {
    nextTick(async () => {
      await getTenantList();
      if (tenantItems.value.length > 0) {
        tenant.value = tenantItems.value[0].value;
        getProjectList();
      }
    });
  });
</script>
