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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-account-multiple"
    :title="i18n.t('resource.tenant')"
    :width="600"
    @reset="reset"
  >
    <template #content>
      <v-flex class="grey lighten-4 rounded ma-2 mt-0">
        <v-list-item>
          <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
            {{ i18nLocal.t('tip.tenant') }} : {{ store.getters.Tenant().TenantName }}
          </v-list-item-content>
        </v-list-item>
      </v-flex>

      <v-text-field v-model="search" class="mx-2 mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />

      <v-sheet>
        <v-data-table
          class="px-2 tenant__table"
          :headers="headers"
          hide-default-footer
          item-key="ID"
          :items="tenantItems"
          :items-per-page="1000"
          :no-data-text="i18n.t('data.no_data')"
          :no-results-text="i18n.t('data.no_data')"
          :page="1"
          :search.sync="search"
        >
          <template #item.tenantName="{ item }">
            {{ item.diaplayName }}
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
          <template #item.action="{ item }">
            <v-btn v-if="!item.disabled && item.IsActive" color="primary" small text @click="enterTenant(item)">
              {{ i18n.t('operate.enter', [i18n.t('resource.space')]) }}
            </v-btn>
          </template>
        </v-data-table>
      </v-sheet>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { inject, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import { useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Tenant } from '@/types/tenant';
  import { User } from '@/types/user';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();

  const headers = [
    { text: i18nLocal.t('table.tenant'), value: 'tenantName', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'isActive', align: 'start' },
    { text: '', value: 'action', align: 'end' },
  ];

  const state = reactive({
    dialog: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const reset = (): void => {
    state.dialog = false;
  };

  const init = (): void => {
    getTenantList();
  };

  const tenantItems = ref<Tenant[]>([]);
  const getTenantList = async (): Promise<void> => {
    const params = {
      page: 1,
      size: 1000,
      preload: 'Users,ResourceQuotas',
    };
    let data: KubePaginationResponse<Tenant[]>;
    if (store.state.Admin) {
      data = await new Tenant().getTenantList(params);
    } else {
      data = await new User(store.state.User).getTenantList(params);
    }
    tenantItems.value = data.List;
    tenantItems.value.forEach((item) => {
      item.diaplayName =
        item.ResourceQuotas?.length > 0
          ? item.TenantName
          : `${item.TenantName} (${i18n.t('tip.not_allocate_resource')})`;
      item.disabled = !item.ResourceQuotas || item.ResourceQuotas?.length === 0;
    });
  };

  const search = ref<string>('');
  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload');
  const enterTenant = async (item: Tenant): Promise<void> => {
    store.commit('CLEAR_RESOURCE');
    store.commit('SET_ADMIN_VIEWPORT', false);
    store.commit('SET_DIALOG', false);
    await router.push({
      name: 'resource-dashboard',
      params: { tenant: item.TenantName },
    });
    await store.dispatch('UPDATE_TENANT_DATA');
    reset();
    reload();
  };

  defineExpose({
    open,
    init,
  });
</script>

<style lang="scss">
  .tenant__table .v-data-table__wrapper {
    max-height: 350px;
  }
</style>
