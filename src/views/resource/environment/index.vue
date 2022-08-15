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
    <BaseViewportHeader v-if="!AdminViewport" :selectable="false" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.environment_name'), value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
          @refresh="m_filter_list"
        />
        <v-sheet class="text-subtitle-2 ml-4">{{ $root.$t('resource.tenant') }}</v-sheet>
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
            :items="m_select_tenantItems"
            :label="$root.$t('resource.tenant')"
            :no-data-text="$root.$t('data.no_data')"
            prepend-inner-icon="mdi-account-switch"
            solo
            @change="onTenantSelectChange"
            @focus="onTenantSelectFocus"
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
          :items="items"
          :items-per-page="itemsPerPage"
          :no-data-text="$root.$t('data.no_data')"
          :page.sync="page"
          @page-count="pageCount = $event"
        >
          <template #[`item.environmentName`]="{ item }">
            {{ item.EnvironmentName }}
          </template>
          <template #[`item.metaType`]="{ item }">
            <v-chip
              :color="
                $METATYPE_CN[item.MetaType] && $METATYPE_CN[item.MetaType].color
                  ? $METATYPE_CN[item.MetaType].color
                  : 'grey'
              "
              label
              small
            >
              {{ $root.$t(`metadata.environment_type.${item.MetaType}`) }}
            </v-chip>
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.Creator.Username }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.Namespace }}
          </template>
          <template #[`item.cpu`]="{ item }">{{ item.Cpu }} core</template>
          <template #[`item.memory`]="{ item }"> {{ item.Memory }} Gi </template>
          <template #[`item.storage`]="{ item }"> {{ item.Storage }} Gi </template>
          <template #[`item.usedCpu`]="{ item }">
            {{ item.UsedCpu.toFixed(1) }} core
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.CpuPercentage)"
              height="15"
              :value="item.CpuPercentage"
            >
              <span class="white--text"> {{ item.CpuPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedMemory`]="{ item }">
            {{ item.UsedMemory.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.MemoryPercentage)"
              height="15"
              :value="item.MemoryPercentage"
            >
              <span class="white--text"> {{ item.MemoryPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template #[`item.usedStorage`]="{ item }">
            {{ item.UsedStorage.toFixed(1) }} Gi
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.StoragePercentage)"
              height="15"
              :value="item.StoragePercentage"
            >
              <span class="white--text"> {{ item.StoragePercentage }}% </span>
            </v-progress-linear>
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
                    <v-btn color="primary" small text @click="updateEnvironment(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeEnvironment(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>

        <BasePagination
          v-if="pageCount >= 1"
          v-model="page"
          :front-page="true"
          :page-count="pageCount"
          :size="itemsPerPage"
          @changepage="onPageIndexChange"
          @changesize="onPageSizeChange"
          @loaddata="environmentTenantResourceQuota(tenant)"
        />
      </v-card-text>
    </v-card>

    <UpdateEnvironment ref="updateEnvironment" @refresh="environmentTenantResourceQuota(tenant)" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import UpdateEnvironment from './components/UpdateEnvironment';
  import messages from './i18n';
  import { deleteEnvironment, getEnvironmentTenantResourceQuota } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import BaseTable from '@/mixins/table';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'Environment',
    i18n: {
      messages: messages,
    },
    components: {
      UpdateEnvironment,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseSelect, BaseTable],
    inject: ['reload'],
    data: () => ({
      items: [],
      itemsCopy: [],
      tenant: -1,
      params: {},
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
    }),
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport']),
      ...mapGetters(['Project', 'Tenant', 'Cluster']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'environmentName', align: 'start' },
          { text: this.$root.$t('resource.type'), value: 'metaType', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.creator'), value: 'creator', align: 'start' },
          { text: this.$root.$t('resource.cpu'), value: 'cpu', align: 'start' },
          { text: this.$root.$t('resource.memory'), value: 'memory', align: 'start' },
          { text: this.$root.$t('resource.storage'), value: 'storage', align: 'start' },
          {
            text: this.$t('table.used', [this.$root.$t('resource.cpu')]),
            value: 'usedCpu',
            align: 'start',
            width: 150,
          },
          {
            text: this.$t('table.used', [this.$root.$t('resource.memory')]),
            value: 'usedMemory',
            align: 'start',
            width: 150,
          },
          {
            text: this.$t('table.used', [this.$root.$t('resource.storage')]),
            value: 'usedStorage',
            align: 'start',
            width: 150,
          },
        ];
        if (this.m_permisson_projectAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.environment_name'), value: 'search', items: [] }];
      },
    },
    async mounted() {
      if (this.JWT) {
        if (this.Tenant().ID > 0) {
          Object.assign(this.params, this.$route.query);
          await this.m_select_tenantSelectData();
          if (this.m_select_tenantItems.length > 0) {
            this.tenant = this.m_select_tenantItems[0].value;
            this.environmentTenantResourceQuota(this.tenant);
          }
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('data.no_tenant'),
            color: 'warning',
          });
        }
      }
    },
    methods: {
      customFilter() {
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          this.items = this.itemsCopy.filter((item) => {
            return (
              item.EnvironmentName &&
              item.EnvironmentName.toLocaleLowerCase().indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
            );
          });
        } else {
          this.items = this.itemsCopy;
        }
        // this.m_table_generateSelectResource()
      },
      async environmentTenantResourceQuota(tenantid) {
        const data = await getEnvironmentTenantResourceQuota(tenantid, this.params);
        this.items = data;
        this.items.forEach((e) => {
          e.EnvironmentName = e.environment.EnvironmentName;
          e.MetaType = e.environment.MetaType;
          e.Namespace = e.environment.Namespace;
          e.Creator = e.environment.Creator;
          e.name = e.environment.EnvironmentName;
          e.ID = e.environment.ID;
          if (e.quota && e.quota.status.hard) {
            e.Cpu = e.quota.status.hard['limits.cpu'] ? parseFloat(sizeOfCpu(e.quota.status.hard['limits.cpu'])) : 0;
            e.Memory = e.quota.status.hard['limits.memory']
              ? parseFloat(sizeOfStorage(e.quota.status.hard['limits.memory']))
              : 0;
            e.Storage = e.quota.status.hard['requests.storage']
              ? parseFloat(sizeOfStorage(e.quota.status.hard['requests.storage']))
              : 0;
          } else {
            e.Cpu = 0;
            e.Memory = 0;
            e.Storage = 0;
          }
          if (e.quota && e.quota.status.used) {
            e.UsedCpu = e.quota.status.used['limits.cpu']
              ? parseFloat(sizeOfCpu(e.quota.status.used['limits.cpu']))
              : 0;
            e.UsedMemory = e.quota.status.used['limits.memory']
              ? parseFloat(sizeOfStorage(e.quota.status.used['limits.memory']))
              : 0;
            e.UsedStorage = e.quota.status.used['requests.storage']
              ? parseFloat(sizeOfStorage(e.quota.status.used['requests.storage']))
              : 0;
          } else {
            e.UsedCpu = 0;
            e.UsedMemory = 0;
            e.UsedStorage = 0;
          }
          e.CpuPercentage = e.Cpu > 0 ? ((e.UsedCpu / e.Cpu) * 100).toFixed(1) : 0;
          e.MemoryPercentage = e.Memory > 0 ? ((e.UsedMemory / e.Memory) * 100).toFixed(1) : 0;
          e.StoragePercentage = e.Storage > 0 ? ((e.UsedStorage / e.Storage) * 100).toFixed(1) : 0;
        });
        this.itemsCopy = deepCopy(this.items);
        if (this.$route.query.search) this.customFilter();
      },
      onTenantSelectChange() {
        if (this.tenant) this.environmentTenantResourceQuota(this.tenant);
        else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_tenant'),
            color: 'warning',
          });
        }
      },
      updateEnvironment(item) {
        this.$refs.updateEnvironment.init(item.environment);
        this.$refs.updateEnvironment.open();
      },
      removeEnvironment(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.environment')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.environment')])} ${
              item.EnvironmentName
            } , ${item.DeletePolicy === 'delLabels' ? this.$t('tip.delete_cascade') : this.$t('tip.delete_all')}`,
            type: 'delete',
            name: item.EnvironmentName,
            level: item.DeletePolicy === 'delLabels' ? 'warning' : 'error',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteEnvironment(param.item.environment.ID);
            this.$store.commit('CLEAR_RESOURCE');
            this.$router.push({
              name: 'resource-dashboard',
              params: this.$route.params,
            });
            this.environmentTenantResourceQuota(this.tenant);
          },
        });
      },
      onTenantSelectFocus() {
        this.m_select_tenantSelectData();
      },
      onPageSizeChange(size) {
        this.page = 1;
        this.itemsPerPage = size;
      },
      onPageIndexChange(page) {
        this.page = page;
      },
      getColor(percentage) {
        return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
      },
    },
  };
</script>

<style>
  .v-data-table .v-input__slot {
    background: none !important;
  }
  .v-expansion-panel-header .v-input__slot {
    background: none !important;
  }
</style>
