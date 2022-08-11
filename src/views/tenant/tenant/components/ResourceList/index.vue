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
      <BaseSubTitle :divider="false" :pl="0" :title="$t('resource.tip.resource_allocate')">
        <template #header>
          <span>
            <span class="ma-2 text-caption grey--text">
              {{ $root.$t('resource.cpu') }}:
              <span class="text-subtitle-2">{{ allCpu }}</span>
              core
            </span>
            <span class="ma-2 text-caption grey--text">
              {{ $root.$t('resource.memory') }}:
              <span class="text-subtitle-2">{{ allMem }}</span>
              Gi
            </span>
            <span class="ma-2 text-caption grey--text">
              {{ $root.$t('resource.storage') }}:
              <span class="text-subtitle-2">{{ allStorage }}</span>
              Gi
            </span>
          </span>
        </template>
        <template #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addResource">
            <v-icon left small> mdi-server-plus </v-icon>
            {{ $root.$t('operate.add_c', [$root.$t('resource.cluster')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.clusterName`]="{ item }">
          <v-flex class="float-left resource__tr">
            {{ item.Cluster.ClusterName }}
          </v-flex>
          <v-flex v-if="item.TkeGpu" class="float-left ml-2 resource__icon">
            <GpuTip :allocated="false" :item="item" type="tke" />
          </v-flex>
          <v-flex v-if="item.NvidiaGpu" class="float-left ml-2 resource__icon">
            <GpuTip :allocated="false" :item="item" type="nvidia" />
          </v-flex>
        </template>
        <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
        <template #[`item.memory`]="{ item }"> {{ item.Memory }} Gi </template>
        <template #[`item.storage`]="{ item }"> {{ item.Storage }} Gi </template>
        <template #[`item.action`]="{ item }">
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
                    {{ $t('resource.operate.resource_scale') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="tenantMonitor(item)">
                    {{ $t('resource.operate.resource_monitor') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="recycleTenantResourceQuota(item)">
                    {{ $t('resource.operate.recycle_cluster') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount > 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onClusterPageIndexChange"
        @changesize="onClusterPageSizeChange"
        @loaddata="tenantResourceQuotaList"
      />
    </v-card-text>

    <AddResource ref="addResource" :clusters="items" @refresh="tenantResourceQuotaList" />
    <TenantMonitor ref="tenantMonitor" />
    <ScaleResource ref="scaleResource" @refresh="tenantResourceQuotaList" />
  </v-card>
</template>

<script>
  import messages from '../../i18n';
  import AddResource from './AddResource';
  import ScaleResource from './ScaleResource';
  import TenantMonitor from './TenantMonitor';
  import { deleteTenantResourceQuota, getTenantResourceQuotaList } from '@/api';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';
  import GpuTip from '@/views/resource/components/common/GpuTip';

  export default {
    name: 'ResourceList',
    i18n: {
      messages: messages,
    },
    components: {
      AddResource,
      GpuTip,
      ScaleResource,
      TenantMonitor,
    },
    props: {
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 50,
        },
        allCpu: 0,
        allMem: 0,
        allStorage: 0,
      };
    },
    computed: {
      headers() {
        return [
          { text: this.$t('resource.table.cluster'), value: 'clusterName', align: 'start' },
          { text: this.$root.$t('resource.cpu'), value: 'cpu', align: 'start' },
          { text: this.$root.$t('resource.memory'), value: 'memory', align: 'start' },
          { text: this.$root.$t('resource.storage'), value: 'storage', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    watch: {
      tenant: {
        handler(newValue) {
          if (newValue) {
            this.tenantResourceQuotaList();
          }
        },
        deep: true,
      },
    },
    methods: {
      async tenantResourceQuotaList() {
        this.allCpu = 0;
        this.allMem = 0;
        this.allStorage = 0;
        const data = await getTenantResourceQuotaList(this.tenant.ID, {
          noprocessing: true,
        });
        data.List.forEach((item) => {
          item.Cpu = item.Content['limits.cpu'] ? sizeOfCpu(item.Content['limits.cpu']) : 0;
          item.Memory = item.Content['limits.memory'] ? sizeOfStorage(item.Content['limits.memory']) : 0;
          item.Storage = item.Content['requests.storage'] ? sizeOfStorage(item.Content['requests.storage']) : 0;

          if (item.Content['limits.nvidia.com/gpu']) {
            item.NvidiaGpu = sizeOfStorage(item.Content['limits.nvidia.com/gpu']);
          }
          if (item.Content['tencent.com/vcuda-core']) {
            item.TkeGpu = parseInt(item.Content['tencent.com/vcuda-core']);
          }
          if (item.Content['tencent.com/vcuda-memory']) {
            item.TkeMemory = parseInt(item.Content['tencent.com/vcuda-memory']);
          }

          this.allCpu += item.Cpu;
          this.allMem += item.Memory;
          this.allStorage += item.Storage;
        });
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      addResource() {
        this.$refs.addResource.init(this.tenant);
        this.$refs.addResource.open();
      },
      tenantMonitor(item) {
        this.$refs.tenantMonitor.init(item);
        this.$refs.tenantMonitor.open();
      },
      scaleResource(item) {
        this.$refs.scaleResource.init(item);
        this.$refs.scaleResource.open();
      },
      recycleTenantResourceQuota(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('resource.operate.recycle_cluster'),
          content: {
            text: `${this.$t('resource.operate.recycle_cluster')} ${item.Cluster.ClusterName}`,
            type: 'delete',
            name: item.Cluster.ClusterName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteTenantResourceQuota(param.item.TenantID, param.item.ClusterID);
            this.tenantResourceQuotaList();
          },
        });
      },
      onClusterPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onClusterPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .resource {
    &__tr {
      line-height: 48px;
    }

    &__icon {
      margin-top: 10px;
    }
  }
</style>
