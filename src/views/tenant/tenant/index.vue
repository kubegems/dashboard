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
        <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.tenant'), value: 'search' }" :filters="filters" />
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
                <v-btn color="primary" text @click="addTenant">
                  <v-icon left>mdi-account-multiple-plus</v-icon>
                  {{ i18n.t('operate.create_c', [i18n.t('resource.tenant')]) }}
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
        <template #item.tenantName="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="tenantDetail(item)">
            {{ item.TenantName }}
          </a>
        </template>
        <template #item.isActive="{ item }">
          <span v-if="item.IsActive">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ i18nLocal.t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
            {{ i18nLocal.t('status.disabled') }}
          </span>
        </template>
        <template #item.cpu="{ item }"> {{ item.Cpu }} core </template>
        <template #item.memory="{ item }"> {{ item.Memory }} Gi </template>
        <template #item.storage="{ item }"> {{ item.Storage }} Gi </template>
        <template #item.allocatedCpu="{ item }">
          {{ item.AllocatedCpu ? item.AllocatedCpu.toFixed(1) : 0 }} core
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.CpuPercentage)"
              height="15"
              :value="item.CpuPercentage"
            >
              <span class="white--text">{{ item.CpuPercentage }}% </span>
            </v-progress-linear>
          </span>
        </template>
        <template #item.allocatedMemory="{ item }">
          {{ item.AllocatedMemory ? item.AllocatedMemory.toFixed(1) : 0 }} Gi
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.MemoryPercentage)"
              height="15"
              :value="item.MemoryPercentage"
            >
              <span class="white--text">{{ item.MemoryPercentage }}% </span>
            </v-progress-linear>
          </span>
        </template>
        <template #item.allocatedStorage="{ item }">
          {{ item.AllocatedStorage ? item.AllocatedStorage.toFixed(1) : 0 }} Gi
          <span class="text-subtitle-2">
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.StoragePercentage)"
              height="15"
              :value="item.StoragePercentage"
            >
              <span class="white--text">{{ item.StoragePercentage }}% </span>
            </v-progress-linear>
          </span>
        </template>
        <template #item.createdAt="{ item }">
          {{ item.CreatedAt ? moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #item.user="{ item }">
          {{ item.Users === null ? 0 : item.Users.length }}
        </template>
        <template #item.cluster="{ item }">
          {{ item.ResourceQuotas === null ? 0 : item.ResourceQuotas.length }}
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
                  <v-btn color="primary" small text @click="updateTenant(item)"> {{ i18n.t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex v-if="item.IsActive">
                  <v-btn color="error" small text @click="forbidTenant(item)">
                    {{ i18nLocal.t('operate.disable') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="activeTenant(item)">
                    {{ i18nLocal.t('operate.enable') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeTenant(item)"> {{ i18n.t('operate.delete') }} </v-btn>
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
        @loaddata="getTenantList"
      />
    </v-card>

    <TenantForm ref="tenant" @refresh="getTenantList" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { reactive, ref, watch } from 'vue';

  import TenantForm from './components/TenantForm.vue';
  import { useI18n } from './i18n';
  import { useRoute, useRouter } from '@/composition/router';
  import { useTenantPagination } from '@/composition/tenant';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { useStore } from '@/store';
  import { Tenant } from '@/types/tenant';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const router = useRouter();
  const route = useRoute();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'tenantName', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'isActive', align: 'start' },
    { text: i18nLocal.t('table.user_count'), value: 'user', align: 'start' },
    { text: i18nLocal.t('table.cluster_count'), value: 'cluster', align: 'start' },
    { text: i18nLocal.t('table.all', [i18n.t('resource.cpu')]), value: 'cpu', align: 'start' },
    { text: i18nLocal.t('table.all', [i18n.t('resource.memory')]), value: 'memory', align: 'start' },
    { text: i18nLocal.t('table.all', [i18n.t('resource.storage')]), value: 'storage', align: 'start' },
    { text: i18nLocal.t('table.allocated', [i18n.t('resource.cpu')]), value: 'allocatedCpu', align: 'start' },
    {
      text: i18nLocal.t('table.allocated', [i18n.t('resource.memory')]),
      value: 'allocatedMemory',
      align: 'start',
    },
    {
      text: i18nLocal.t('table.allocated', [i18n.t('resource.storage')]),
      value: 'allocatedStorage',
      align: 'start',
    },
    { text: i18nLocal.t('table.create_at'), value: 'createdAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Tenant> = reactive<Pagination<Tenant>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
    request: { containAllocatedResourcequota: true, preload: 'ResourceQuotas,Users' },
  });

  const getTenantList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Tenant> = await useTenantPagination(
      new Tenant(),
      params.page,
      params.size,
      params.search,
      params.request,
    );
    pagination = Object.assign(pagination, data);
  };

  const filters = [{ text: i18nLocal.t('filter.tenant'), value: 'search', items: [] }];
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
      getTenantList();
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

  const tenant = ref(null);
  const addTenant = (): void => {
    tenant.value.open();
  };

  const updateTenant = (item: Tenant): void => {
    tenant.value.init(item);
    tenant.value.open();
  };

  const tenantDetail = (item: Tenant): void => {
    router.push({
      name: 'tenant-detail',
      params: Object.assign(route.params, { name: item.TenantName }),
      query: { id: item.ID.toString() },
    });
  };

  const forbidTenant = (item: Tenant): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.disable_c', [i18n.t('resource.tenant')]),
      content: {
        text: `${i18nLocal.t('operate.disable_c', [i18n.t('resource.tenant')])} ${item.TenantName}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item).disableTenant();
        getTenantList();
      },
    });
  };

  const activeTenant = (item: Tenant): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.enable_c', [i18n.t('resource.tenant')]),
      content: {
        text: `${i18nLocal.t('operate.enable_c', [i18n.t('resource.tenant')])} ${item.TenantName}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item).activeTenant();
        getTenantList();
      },
    });
  };

  const removeTenant = (item: Tenant): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.tenant')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.tenant')])} ${item.TenantName}`,
        type: 'delete',
        name: item.TenantName,
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item).deleteTenant();
        store.commit('CLEAR_TENANT');
        store.dispatch('UPDATE_TENANT_DATA');
        getTenantList();
      },
    });
  };

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };
</script>
