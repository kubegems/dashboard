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
    <BaseViewportHeader v-if="!store.state.AdminViewport" :selectable="false" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.environment_name'), value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
        />
        <v-sheet class="text-subtitle-2 ml-4">{{ i18n.t('resource.tenant') }}</v-sheet>
        <v-sheet width="350">
          <v-autocomplete
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
      <v-card-text class="pa-0">
        <v-data-table
          class="mx-4"
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="pagination.items"
          :items-per-page="pagination.size"
          :no-data-text="i18n.t('data.no_data')"
          :page.sync="pagination.page"
          @page-count="pagination.pageCount = $event"
        >
          <template #item.environmentName="{ item }">
            {{ item.EnvironmentName }}
          </template>
          <template #item.metaType="{ item }">
            <v-chip
              :color="
                METATYPE_CN[item.MetaType] && METATYPE_CN[item.MetaType].color
                  ? METATYPE_CN[item.MetaType].color
                  : 'grey'
              "
              label
              small
            >
              {{ i18n.t(`metadata.environment_type.${item.MetaType}`) }}
            </v-chip>
          </template>
          <template #item.creator="{ item }">
            {{ item.Creator.Username }}
          </template>
          <template #item.namespace="{ item }">
            {{ item.Namespace }}
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
                    <v-btn color="primary" small text @click="updateEnvironment(item)">
                      {{ i18n.t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeEnvironment(item)">
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
          :front-page="true"
          :page-count="pagination.pageCount"
          :size="pagination.size"
          @changepage="pageChange"
          @changesize="sizeChange"
          @loaddata="getEnvironmentList"
        />
      </v-card-text>
    </v-card>

    <EnvironmentBaseForm ref="environment" @refresh="getEnvironmentList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useEnvironmentListInTenant, useTenantList } from '@kubegems/api/hooks/tenant';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useProjectAllow } from '@kubegems/extension/permission';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { METATYPE_CN } from '@kubegems/libs/constants/platform';
  import { computed, onMounted, reactive, ref, watch } from 'vue';

  import EnvironmentBaseForm from './components/EnvironmentBaseForm/index.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = computed(() => {
    const items = [
      { text: i18nLocal.t('table.name'), value: 'environmentName', align: 'start' },
      { text: i18n.t('resource.type'), value: 'metaType', align: 'start' },
      { text: i18n.t('resource.namespace'), value: 'namespace', align: 'start' },
      { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
      { text: i18n.t('resource.cpu'), value: 'cpu', align: 'start' },
      { text: i18n.t('resource.memory'), value: 'memory', align: 'start' },
      { text: i18n.t('resource.storage'), value: 'storage', align: 'start' },
      {
        text: i18nLocal.t('table.used', [i18n.t('resource.cpu')]),
        value: 'usedCpu',
        align: 'start',
        width: 150,
      },
      {
        text: i18nLocal.t('table.used', [i18n.t('resource.memory')]),
        value: 'usedMemory',
        align: 'start',
        width: 150,
      },
      {
        text: i18nLocal.t('table.used', [i18n.t('resource.storage')]),
        value: 'usedStorage',
        align: 'start',
        width: 150,
      },
    ];
    if (useProjectAllow()) {
      items.push({ text: '', value: 'action', align: 'center', width: 20 });
    }
    return items;
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

  let pagination: Pagination<Environment> = reactive<Pagination<Environment>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      search: '',
    },
  });

  const itemsCopy = ref<Environment[]>([]);
  const getEnvironmentList = async (): Promise<void> => {
    const data = await useEnvironmentListInTenant(new Tenant({ ID: tenant.value }));
    pagination = Object.assign(pagination, data);
  };

  const customFilter = () => {
    if (query.value.search) {
      pagination.items = itemsCopy.value.filter((item) => {
        return (
          item.EnvironmentName &&
          item.EnvironmentName.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1
        );
      });
    } else {
      pagination.items = itemsCopy.value;
    }
  };

  const filters = [{ text: i18nLocal.t('filter.environment_name'), value: 'search', items: [] }];

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
      getEnvironmentList();
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

  const environment = ref(null);
  const updateEnvironment = (item: Environment): void => {
    environment.value.init(item);
    environment.value.open();
  };

  const removeEnvironment = (item: Environment): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.environment')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.environment')])} ${item.EnvironmentName} , ${
          item.DeletePolicy === 'delLabels' ? i18nLocal.t('tip.delete_cascade') : i18nLocal.t('tip.delete_all')
        }`,
        type: 'delete',
        name: item.EnvironmentName,
        level: item.DeletePolicy === 'delLabels' ? 'warning' : 'error',
      },
      param: { item },
      doFunc: async (param) => {
        await new Environment(param.item).deleteEnvironment();
        store.commit('CLEAR_RESOURCE');
      },
    });
  };

  const tenantSelectChanged = (): void => {
    if (tenant.value) getEnvironmentList();
    else {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.select_tenant'),
        color: 'warning',
      });
    }
  };

  onMounted(async () => {
    if (store.getters.Tenant().ID > 0) {
      await getTenantList();
      if (tenantItems.value.length > 0) {
        tenant.value = tenantItems.value[0].value;
        getEnvironmentList();
      }
    } else {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('data.no_tenant'),
        color: 'warning',
      });
    }
  });
</script>

<style>
  .v-data-table .v-input__slot {
    background: none !important;
  }
  .v-expansion-panel-header .v-input__slot {
    background: none !important;
  }
</style>
