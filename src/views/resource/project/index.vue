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
          :default="{ items: [], text: $t('filter.name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-sheet v-if="AdminViewport" class="text-subtitle-2 ml-4"> {{ $root.$t('resource.tenant') }} </v-sheet>
        <v-sheet width="350">
          <v-autocomplete
            v-if="AdminViewport"
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
        <template #[`item.projectName`]="{ item }">
          <span v-if="AdminViewport">{{ item.ProjectName }}</span>
          <a v-else class="text-subtitle-2" @click="projectDetail(item)">
            {{ item.ProjectName }}
          </a>
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #[`item.environment`]="{ item }">
          {{ item.Environments.length }}
        </template>
        <template #[`item.tenant`]="{ item }">
          {{ item.Tenant.TenantName }}
        </template>
        <template #[`item.projectAlias`]="{ item }">
          {{ item.ProjectAlias }}
        </template>
        <template #[`item.cpu`]="{ item }"> {{ item.Cpu ? item.Cpu : 0 }} core </template>
        <template #[`item.memory`]="{ item }"> {{ item.Memory ? item.Memory : 0 }} Gi </template>
        <template #[`item.storage`]="{ item }"> {{ item.Storage ? item.Storage : 0 }} Gi </template>
        <template #[`item.usedCpu`]="{ item }">
          {{ item.UsedCpu ? item.UsedCpu.toFixed(1) : 0 }} core
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
          {{ item.UsedMemory ? item.UsedMemory.toFixed(1) : 0 }} Gi
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
          {{ item.UsedStorage ? item.UsedStorage.toFixed(1) : 0 }} Gi
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
                  <v-btn color="primary" small text @click="updateProject(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeProject(item)">
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
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="projectList"
      />
    </v-card>

    <UpdateProject ref="updateProject" @refresh="projectList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import UpdateProject from './components/UpdateProject';
  import messages from './i18n';
  import { deleteProject, getProjectList, getTenantProjectQuotaList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';
  import { convertStrToNum, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'Project',
    i18n: {
      messages: messages,
    },
    components: {
      UpdateProject,
    },
    mixins: [BaseFilter, BasePermission, BaseSelect],
    data: () => ({
      items: [],
      tenant: -1,
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'JWT', 'ProjectStore']),
      ...mapGetters(['Tenant']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'projectName', align: 'start' },
          { text: this.$t('table.alias'), value: 'projectAlias', align: 'start' },
          { text: this.$t('table.environment_space'), value: 'environment', align: 'start' },
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
          { text: this.$t('table.create_at'), value: 'createdAt', align: 'start' },
        ];
        if (this.Admin && this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.tenant'),
            value: 'tenant',
            align: 'start',
          });
        }
        if (this.m_permisson_tenantAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.name'), value: 'search', items: [] }];
      },
    },
    async mounted() {
      if (this.JWT) {
        if (this.Tenant().ID > 0) {
          this.$nextTick(async () => {
            Object.assign(this.params, convertStrToNum(this.$route.query));
            await this.m_select_tenantSelectData();
            if (this.m_select_tenantItems.length > 0) {
              this.tenant = this.m_select_tenantItems[0].value;
              this.projectList();
            }
          });
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('data.no_tenant'),
            color: 'warning',
          });
        }
      }
    },
    methods: {
      async projectList() {
        const data = await getProjectList(this.AdminViewport ? this.tenant : this.Tenant().ID, this.params);
        this.items = data.List.map((item) => {
          return {
            name: item.TenantName,
            ...item,
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.projectQuotaList();
      },
      async projectQuotaList() {
        const data = await getTenantProjectQuotaList(this.AdminViewport ? this.tenant : this.Tenant().ID, {
          noprocessing: true,
        });
        if (data) {
          data.forEach((q) => {
            const index = this.items.findIndex((p) => {
              return p.ID === q.projectid;
            });
            if (index > -1) {
              const item = this.items[index];
              item.Cpu = q.resourceStatus.quota.hard
                ? parseFloat(sizeOfCpu(q.resourceStatus.quota.hard['limits.cpu']))
                : 0;
              item.Memory = q.resourceStatus.quota.hard
                ? parseFloat(sizeOfStorage(q.resourceStatus.quota.hard['limits.memory']))
                : 0;
              item.Storage = q.resourceStatus.quota.hard
                ? parseFloat(sizeOfStorage(q.resourceStatus.quota.hard[`requests.storage`]))
                : 0;
              item.UsedCpu = q.resourceStatus.quota.used
                ? parseFloat(sizeOfCpu(q.resourceStatus.quota.used['limits.cpu']))
                : 0;
              item.UsedMemory = q.resourceStatus.quota.used
                ? parseFloat(sizeOfStorage(q.resourceStatus.quota.used['limits.memory']))
                : 0;
              item.UsedStorage = q.resourceStatus.quota.used
                ? parseFloat(sizeOfStorage(q.resourceStatus.quota.used[`requests.storage`]))
                : 0;
              item.CpuPercentage = item.Cpu > 0 ? ((item.UsedCpu / item.Cpu) * 100).toFixed(1) : 0;
              item.MemoryPercentage = item.Memory > 0 ? ((item.UsedMemory / item.Memory) * 100).toFixed(1) : 0;
              item.StoragePercentage = item.Storage > 0 ? ((item.UsedStorage / item.Storage) * 100).toFixed(1) : 0;
              this.$set(this.items, index, item);
            }
          });
        }
      },
      onTenantSelectChange() {
        if (this.tenant) this.projectList();
        else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.tenant'),
            color: 'warning',
          });
        }
      },
      updateProject(item) {
        this.$refs.updateProject.init(item);
        this.$refs.updateProject.open();
      },
      async projectDetail(item) {
        this.$router.push({
          name: 'project-detail',
          params: {
            tenant: this.Tenant().TenantName,
            project: item.ProjectName,
          },
          query: { name: item.ProjectName },
        });
      },
      removeProject(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.project')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.project')])} ${item.ProjectName}`,
            type: 'delete',
            name: item.ProjectName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteProject(param.item.ID);
            this.$store.commit('CLEAR_RESOURCE');
            this.projectList();
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
      onTenantSelectFocus() {
        this.m_select_tenantSelectData();
      },
      getColor(percentage) {
        return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
      },
    },
  };
</script>
