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
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateTenant"> {{ i18n.t('operate.edit') }} </v-btn>
                </v-flex>
                <template v-if="tenant">
                  <v-flex v-if="tenant.IsActive">
                    <v-btn color="error" small text @click="forbidTenant"> {{ i18nLocal.t('operate.disable') }} </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="primary" small text @click="activeTenant">
                      {{ i18nLocal.t('operate.enable') }}
                    </v-btn>
                  </v-flex>
                </template>
                <v-flex>
                  <v-btn color="error" small text @click="removeTenant"> {{ i18n.t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ tenant ? tenant.TenantName : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.status') }} </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="tenant ? tenant.IsActive : false">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                  {{ i18nLocal.t('status.enabled') }}
                </span>
                <span v-else>
                  <v-icon color="error" small> mdi-minus-circle </v-icon>
                  {{ i18nLocal.t('status.disabled') }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('table.create_at') }} </v-list-item-title>
              <v-list-item-subtitle>
                {{ tenant && tenant.CreatedAt ? moment(tenant.CreatedAt).format('lll') : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="10">
        <UserList :tenant="tenant" />

        <ResourceList class="mt-3" :tenant="tenant" />
      </v-col>
    </v-row>

    <TenantForm ref="tenantForm" @refresh="getTenantDetail" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { nextTick, onMounted, ref } from 'vue';

  import ResourceList from './components/ResourceList/index.vue';
  import TenantForm from './components/TenantForm.vue';
  import UserList from './components/UserList/index.vue';
  import { useI18n } from './i18n';
  import { useRoute, useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Tenant } from '@/types/tenant';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const route = useRoute();
  const router = useRouter();
  const store = useStore();

  const tenant = ref<Tenant>(undefined);
  const getTenantDetail = async (): Promise<void> => {
    const data = await new Tenant({ ID: parseInt(route.query.id as string) }).getTenant();
    tenant.value = data;
  };

  onMounted(() => {
    nextTick(() => {
      getTenantDetail();
    });
  });

  const tenantForm = ref(null);
  const updateTenant = () => {
    tenantForm.value.init(tenant.value);
    tenantForm.value.open();
  };

  const forbidTenant = async (): Promise<void> => {
    const item = tenant.value;
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.disable_c', [i18n.t('resource.tenant')]),
      content: {
        text: `${i18nLocal.t('operate.disable_c', [i18n.t('resource.tenant')])} ${item.TenantName}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item).disableTenant();
        getTenantDetail();
      },
    });
  };

  const activeTenant = async (): Promise<void> => {
    const item = tenant.value;
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.enable_c', [i18n.t('resource.tenant')]),
      content: {
        text: `${i18nLocal.t('operate.enable_c', [i18n.t('resource.tenant')])} ${item.TenantName}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item).activeTenant();
        getTenantDetail();
      },
    });
  };

  const removeTenant = async (): Promise<void> => {
    const item = tenant.value;
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
        router.push({ name: 'tenant-list', params: route.params });
      },
    });
  };
</script>
