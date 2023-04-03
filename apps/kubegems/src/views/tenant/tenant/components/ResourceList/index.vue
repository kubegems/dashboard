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
  <v-card>
    <v-card-text>
      <BaseSubTitle :divider="false" :pl="0" :title="i18nLocal.t('resource.tip.resource_allocate')">
        <template #header>
          <span>
            <span class="ma-2 text-caption grey--text">
              {{ i18n.t('resource.cpu') }}:
              <span class="text-subtitle-2">{{ totalCpu }}</span>
              core
            </span>
            <span class="ma-2 text-caption grey--text">
              {{ i18n.t('resource.memory') }}:
              <span class="text-subtitle-2">{{ totalMemory }}</span>
              Gi
            </span>
            <span class="ma-2 text-caption grey--text">
              {{ i18n.t('resource.storage') }}:
              <span class="text-subtitle-2">{{ totalStorage }}</span>
              Gi
            </span>
          </span>
        </template>
        <template #action>
          <v-btn id="intro_add_cluster" class="float-right" color="primary" small text @click="addResource">
            <v-icon left small> mdi-server-plus </v-icon>
            {{ i18n.t('operate.add_c', [i18n.t('resource.cluster')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.clusterName="{ item }">
          <v-flex class="float-left resource__tr">
            {{ item.Cluster.ClusterName }}
          </v-flex>
          <v-flex v-if="item.NvidiaGpu || item.TkeGpu" class="float-left ml-2 resource__icon">
            <GpuTip :allocated="false" :item="item" />
          </v-flex>
        </template>
        <template #item.cpu="{ item }"> {{ item.Cpu }} core </template>
        <template #item.memory="{ item }"> {{ item.Memory }} Gi </template>
        <template #item.storage="{ item }"> {{ item.Storage }} Gi </template>
        <template #item.action="{ item }">
          <v-flex :id="`l${item.ID}`" />
          <v-menu :attach="`#l${item.ID}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="scaleResource(item)">
                    {{ i18nLocal.t('resource.operate.resource_scale') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="tenantMonitor(item)">
                    {{ i18nLocal.t('resource.operate.resource_monitor') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="recycleCluster(item)">
                    {{ i18nLocal.t('resource.operate.recycle_cluster') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount > 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getResourceQuotaList"
      />
    </v-card-text>

    <AddResource ref="add" :tenant-resource-quota-items="pagination.items" @refresh="getResourceQuotaList" />
    <TenantMonitor ref="monitor" />
    <ScaleResource ref="scale" @refresh="getResourceQuotaList" />
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import intro from '@kubegems/extension/tool/guide';
  import { sleep } from '@kubegems/libs/utils/helpers';
  import _ from 'lodash';
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import AddResource from './AddResource.vue';
  import ScaleResource from './ScaleResource.vue';
  import TenantMonitor from './TenantMonitor.vue';
  import { useTenantResourceQuotaPagination } from '@/composition/tenant';
  import { Tenant, TenantResourceQuota } from '@/types/tenant';
  import GpuTip from '@/views/resource/components/common/GpuTip.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      tenant?: Tenant;
    }>(),
    {
      tenant: undefined,
    },
  );

  const headers = [
    { text: i18nLocal.t('resource.table.cluster'), value: 'clusterName', align: 'start' },
    { text: i18n.t('resource.cpu'), value: 'cpu', align: 'start' },
    { text: i18n.t('resource.memory'), value: 'memory', align: 'start' },
    { text: i18n.t('resource.storage'), value: 'storage', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<TenantResourceQuota> = reactive<Pagination<TenantResourceQuota>>({
    page: 1,
    size: 20,
    pageCount: 0,
    items: [],
    total: 0,
  });

  const totalCpu: ComputedRef<number> = computed(() => {
    return _.sum(
      pagination.items.map((item) => {
        return item.Cpu;
      }),
    );
  });
  const totalMemory: ComputedRef<number> = computed(() => {
    return _.sum(
      pagination.items.map((item) => {
        return item.Memory;
      }),
    );
  });
  const totalStorage: ComputedRef<number> = computed(() => {
    return _.sum(
      pagination.items.map((item) => {
        return item.Storage;
      }),
    );
  });

  const getResourceQuotaList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<TenantResourceQuota> = await useTenantResourceQuotaPagination(
      new Tenant(props.tenant),
      params.page,
      params.size,
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

  watch(
    () => props.tenant,
    async (newValue) => {
      if (newValue) {
        getResourceQuotaList();
        if (!store.state.Guided && pagination.items?.length > 0) {
          await sleep(500);
          intro
            .setOptions({
              steps: [
                {
                  element: document.querySelector('#intro_add_cluster'),
                  intro: i18nLocal.t('intro.add_cluster'),
                },
              ],
            })
            .start();

          intro.onexit(() => {
            store.commit('SET_GUIDED', true);
          });
        }
      }
    },
    {
      deep: true,
    },
  );

  const add = ref(null);
  const addResource = (): void => {
    add.value.init(props.tenant);
    add.value.open();
    intro.exit();
  };

  const monitor = ref(null);
  const tenantMonitor = (item: TenantResourceQuota): void => {
    monitor.value.init(item);
    monitor.value.open();
  };

  const scale = ref(null);
  const scaleResource = (item: TenantResourceQuota): void => {
    scale.value.init(item);
    scale.value.open();
  };

  const recycleCluster = (item: TenantResourceQuota) => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('resource.operate.recycle_cluster'),
      content: {
        text: `${i18nLocal.t('resource.operate.recycle_cluster')} ${item.Cluster.ClusterName}`,
        type: 'delete',
        name: item.Cluster.ClusterName,
      },
      param: { item },
      doFunc: async (param) => {
        await new Tenant(param.item.Tenant).deleteResourceQuota(param.item.ID);
        getResourceQuotaList();
      },
    });
  };
</script>

<style lang="scss" scoped>
  .resource {
    &__tr {
      line-height: 48px;
    }

    &__icon {
      margin-top: 13px;
    }
  }
</style>
