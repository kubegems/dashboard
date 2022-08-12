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
    <BaseViewportHeader v-if="!AdminViewport" :environmented="false" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.registry_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addRegistry">
                  <v-icon left>mdi-database-plus</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.image_registry')]) }}
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
        <template #[`item.registryName`]="{ item }">
          {{ item.RegistryName }}
        </template>
        <template #[`item.registryAddress`]="{ item }">
          {{ item.RegistryAddress }}
        </template>
        <template #[`item.updateAt`]="{ item }">
          {{ item.UpdateTime ? $moment(item.UpdateTime).format('lll') : '' }}
        </template>
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
        </template>
        <template #[`item.creator`]="{ item }">
          {{ item.Creator.Username }}
        </template>
        <template #[`item.project`]="{ item }">
          {{ item.Project.ProjectName }}
        </template>
        <template #[`item.isDefault`]="{ item }">
          {{ item.IsDefault ? $t('tip.yes') : $t('tip.no') }}
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
                <v-flex v-if="item.IsDefault">
                  <v-btn color="error" small text @click="setDefaultRegistry(item, false)">
                    {{ $t('operate.cancel_default') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="setDefaultRegistry(item, true)">
                    {{ $t('operate.set_default') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="updateRegistry(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeRegistry(item)">
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
        @loaddata="registryList"
      />
    </v-card>

    <AddRegistry ref="addRegistry" @refresh="registryList" />
    <UpdateRegistry ref="updateRegistry" @refresh="registryList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddRegistry from './components/AddRegistry';
  import UpdateRegistry from './components/UpdateRegistry';
  import messages from './i18n';
  import { deleteRegistry, getRegistryAllList, getRegistryList, patchSetDefaultRegistry } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'Registry',
    i18n: {
      messages: messages,
    },
    components: {
      AddRegistry,
      UpdateRegistry,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'JWT']),
      ...mapGetters(['Project']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'registryName', align: 'start' },
          { text: this.$t('table.address'), value: 'registryAddress', align: 'start' },
          { text: this.$t('table.default'), value: 'isDefault', align: 'start' },
          { text: this.$t('table.username'), value: 'username', align: 'start' },
          { text: this.$t('table.creator'), value: 'creator', align: 'start' },
          { text: this.$t('table.last_update_at'), value: 'updateAt', align: 'start' },
        ];
        if (this.Admin && this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.project'),
            value: 'project',
            align: 'start',
          });
        }
        if (this.m_permisson_resourceAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.registry_name'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (!this.AdminViewport && this.Project().ID === 0) {
            return;
          }
          Object.assign(this.params, convertStrToNum(this.$route.query));
          this.registryList();
        });
      }
    },
    methods: {
      async registryList() {
        let data = {};
        if (this.Admin && this.AdminViewport) {
          data = await getRegistryAllList(this.params);
        } else {
          data = await getRegistryList(this.Project().ID, this.params);
        }
        this.items = data.List.map((item) => {
          return {
            name: item.TenantName,
            ...item,
          };
        });
        this.m_table_generateSelectResourceNoK8s('ProjectName', 'ID');
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      addRegistry() {
        if (!this.AdminViewport && this.Project().ID === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_project'),
            color: 'warning',
          });
          return;
        }
        this.$refs.addRegistry.open();
      },
      updateRegistry(item) {
        this.$refs.updateRegistry.init(item);
        this.$refs.updateRegistry.open();
      },
      removeRegistry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.image_registry')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.image_registry')])} ${
              item.RegistryName
            }`,
            type: 'delete',
            name: item.RegistryName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteRegistry({
              projectid: param.item.ProjectID,
              registryid: param.item.ID,
            });
            this.registryList();
          },
        });
      },
      setDefaultRegistry(item, isDefault) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.set_default'),
          content: {
            text: isDefault
              ? this.$t('tip.set_default', [item.RegistryName])
              : this.$t('tip.cancel_default', [item.RegistryName]),
            type: 'confirm',
          },
          param: { item, isDefault },
          doFunc: async (param) => {
            await patchSetDefaultRegistry(
              {
                projectid: param.item.ProjectID,
                registryid: param.item.ID,
              },
              {
                isDefault: param.isDefault,
              },
            );
            this.registryList();
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
    },
  };
</script>
