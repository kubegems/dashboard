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
        <BaseFilter
          :default="{ items: [], text: $t('filter.tenant'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
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
                <v-btn color="primary" text @click="addTenant">
                  <v-icon left>mdi-account-multiple-plus</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.tenant')]) }}
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
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.tenantName`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="tenantDetail(item)">
            {{ item.TenantName }}
          </a>
        </template>
        <template #[`item.isActive`]="{ item }">
          <span v-if="item.IsActive">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ $t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
            {{ $t('status.disabled') }}
          </span>
        </template>
        <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
        <template #[`item.memory`]="{ item }"> {{ item.Memory }} Gi </template>
        <template #[`item.storage`]="{ item }"> {{ item.Storage }} Gi </template>
        <template #[`item.allocatedCpu`]="{ item }">
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
        <template #[`item.allocatedMemory`]="{ item }">
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
        <template #[`item.allocatedStorage`]="{ item }">
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
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #[`item.user`]="{ item }">
          {{ item.Users === null ? 0 : item.Users.length }}
        </template>
        <template #[`item.cluster`]="{ item }">
          {{ item.ResourceQuotas === null ? 0 : item.ResourceQuotas.length }}
        </template>
        <template #[`item.action`]="{ item }">
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
                  <v-btn color="primary" small text @click="updateTenant(item)"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex v-if="item.IsActive">
                  <v-btn color="error" small text @click="forbidTenant(item)"> {{ $t('operate.disable') }} </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="activeTenant(item)"> {{ $t('operate.enable') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeTenant(item)"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="tenantList"
      />
    </v-card>

    <AddTenant ref="addTenant" @refresh="tenantList" />
    <UpdateTenant ref="updateTenant" @refresh="tenantList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddTenant from './components/AddTenant';
  import UpdateTenant from './components/UpdateTenant';
  import messages from './i18n';
  import { deleteTenant, getTenantList, putActiveTenant, putForbideTenant } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'Tenant',
    i18n: {
      messages: messages,
    },
    components: {
      AddTenant,
      UpdateTenant,
    },
    mixins: [BaseFilter, BaseResource, BaseSelect, BaseTable],
    data: () => ({
      items: [],

      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        containAllocatedResourcequota: true,
      },
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'tenantName', align: 'start' },
          { text: this.$t('table.status'), value: 'isActive', align: 'start' },
          { text: this.$t('table.user_count'), value: 'user', align: 'start' },
          { text: this.$t('table.cluster_count'), value: 'cluster', align: 'start' },
          { text: this.$t('table.all', [this.$root.$t('resource.cpu')]), value: 'cpu', align: 'start' },
          { text: this.$t('table.all', [this.$root.$t('resource.memory')]), value: 'memory', align: 'start' },
          { text: this.$t('table.all', [this.$root.$t('resource.storage')]), value: 'storage', align: 'start' },
          { text: this.$t('table.allocated', [this.$root.$t('resource.cpu')]), value: 'allocatedCpu', align: 'start' },
          {
            text: this.$t('table.allocated', [this.$root.$t('resource.memory')]),
            value: 'allocatedMemory',
            align: 'start',
          },
          {
            text: this.$t('table.allocated', [this.$root.$t('resource.storage')]),
            value: 'allocatedStorage',
            align: 'start',
          },
          { text: this.$t('table.create_at'), value: 'createdAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
      filters() {
        return [{ text: this.$t('filter.tenant'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        Object.assign(this.params, convertStrToNum(this.$route.query));
        this.tenantList();
      }
    },
    methods: {
      async tenantList() {
        const data = await getTenantList(this.params);
        data.List.forEach((t) => {
          t.Cpu = 0;
          t.Memory = 0;
          t.Storage = 0;
          t.ResourceQuotas.forEach((r) => {
            t.Cpu += sizeOfCpu(r.Content['limits.cpu']);
            t.Memory += sizeOfStorage(r.Content['limits.memory']);
            t.Storage += sizeOfStorage(r.Content['requests.storage']);
          });

          t.AllocatedCpu = t.AllocatedResourcequota ? sizeOfCpu(t.AllocatedResourcequota['requests.cpu']) : 0;
          t.AllocatedMemory = t.AllocatedResourcequota ? sizeOfStorage(t.AllocatedResourcequota['requests.memory']) : 0;
          t.AllocatedStorage = t.AllocatedResourcequota
            ? sizeOfStorage(t.AllocatedResourcequota['requests.storage'])
            : 0;

          t.CpuPercentage = t.Cpu > 0 ? ((t.AllocatedCpu / t.Cpu) * 100).toFixed(1) : 0;
          t.MemoryPercentage = t.Memory > 0 ? ((t.AllocatedMemory / t.Memory) * 100).toFixed(1) : 0;
          t.StoragePercentage = t.Storage > 0 ? ((t.AllocatedStorage / t.Storage) * 100).toFixed(1) : 0;
        });
        this.items = data.List.map((item) => {
          return {
            name: item.TenantName,
            ...item,
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      addTenant() {
        this.$refs.addTenant.open();
      },
      updateTenant(item) {
        this.$refs.updateTenant.init(item);
        this.$refs.updateTenant.open();
      },
      tenantDetail(item) {
        this.$router.push({
          name: 'tenant-detail',
          params: Object.assign(this.$route.params, { name: item.TenantName }),
          query: { id: item.ID },
        });
      },
      forbidTenant(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.disable_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$t('operate.disable_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putForbideTenant(param.item.ID);
            this.tenantList();
          },
        });
      },
      activeTenant(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.enable_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$t('operate.enable_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putActiveTenant(param.item.ID);
            this.tenantList();
          },
        });
      },
      removeTenant(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'delete',
            name: item.TenantName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteTenant(param.item.ID);
            this.$store.commit('CLEAR_TENANT');
            this.$store.dispatch('UPDATE_TENANT_DATA');
            this.tenantList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getColor(percentage) {
        return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
      },
    },
  };
</script>
