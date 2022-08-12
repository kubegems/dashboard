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
          :default="{ items: [], text: $t('filter.mesh_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="Admin" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addVirtualSpace">
                  <v-icon left>mdi-cloud-outline</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.mesh')]) }}
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
        <template #[`item.virtualSpaceName`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="virtualSpaceDetail(item)">
            {{ item.VirtualSpaceName }}
          </a>
        </template>
        <template #[`item.user`]="{ item }">
          {{ item.Users ? item.Users.length : 0 }}
        </template>
        <template #[`item.createdBy`]="{ item }">
          {{ item.CreatedBy }}
        </template>
        <template #[`item.env`]="{ item }">
          {{ item.Environments ? item.Environments.length : 0 }}
        </template>
        <template #[`item.isActive`]="{ item }">
          {{ item.IsActive ? $t('status.activated') : $t('status.inactivated') }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
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
                <v-flex v-if="item.IsActive">
                  <v-btn color="error" small text @click="setVirtualSpaceStatus(item, false)">
                    {{ $t('operate.inactivate') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" small text @click="setVirtualSpaceStatus(item, true)">
                    {{ $t('operate.activate') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="updateVirtualSpace(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeVirtualSpace(item)">
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
        @loaddata="virtualSpaceList"
      />
    </v-card>

    <AddVirtualSpace ref="addVirtualSpace" @refresh="virtualSpaceList" />
    <UpdateVirtualSpace ref="updateVirtualSpace" @refresh="virtualSpaceList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddVirtualSpace from './components/AddVirtualSpace';
  import UpdateVirtualSpace from './components/UpdateVirtualSpace';
  import messages from './i18n';
  import { deleteVirtualSpace, getVirtualSpaceList, patchSetVirtualSpaceStatus } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';

  export default {
    name: 'VirtualSpace',
    i18n: {
      messages: messages,
    },
    components: {
      AddVirtualSpace,
      UpdateVirtualSpace,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
      };
    },
    computed: {
      ...mapState(['JWT', 'Admin']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'virtualSpaceName', align: 'start' },
          { text: this.$t('table.status'), value: 'isActive', align: 'start' },
          { text: this.$root.$t('resource.environment'), value: 'env', align: 'start' },
          { text: this.$root.$t('resource.member'), value: 'user', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
          { text: this.$t('table.creator'), value: 'createdBy', align: 'start' },
        ];
        if (this.m_permisson_virtualSpaceAllow || this.m_permisson_tenantAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.mesh_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.virtualSpaceList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.$store.commit('CLEAR_VIRTUAL_SPACE');
          this.m_table_generateParams();
          this.virtualSpaceList();
        });
      }
    },
    methods: {
      async virtualSpaceList(noprocess = false) {
        const data = await getVirtualSpaceList(
          Object.assign(this.params, {
            noprocessing: noprocess,
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      async virtualSpaceDetail(item) {
        this.$router.push({
          name: 'virtualspace-detail',
          params: { virtualspace: item.VirtualSpaceName },
          query: { name: item.VirtualSpaceName },
        });
      },
      addVirtualSpace() {
        this.$refs.addVirtualSpace.open();
      },
      updateVirtualSpace(item) {
        this.$refs.updateVirtualSpace.init(item);
        this.$refs.updateVirtualSpace.open();
      },
      removeVirtualSpace(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.mesh')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.mesh')])} ${item.VirtualSpaceName}`,
            type: 'delete',
            name: item.VirtualSpaceName,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.VirtualSpaceName.length > 0) {
              await deleteVirtualSpace(param.item.ID);
              this.$store.commit('CLEAR_VIRTUAL_SPACE');
              this.virtualSpaceList();
            }
          },
        });
      },
      setVirtualSpaceStatus(item, open) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('tip.set_status'),
          content: {
            text: open
              ? `${this.$t('operate.activate_c', [this.$root.$t('resource.mesh')])} ${item.VirtualSpaceName}`
              : `${this.$t('operate.inactivate_c', [this.$root.$t('resource.mesh')])} ${item.VirtualSpaceName}`,
            type: 'confirm',
          },
          param: { item, open },
          doFunc: async (param) => {
            if (param.item.VirtualSpaceName.length > 0) {
              await patchSetVirtualSpaceStatus(param.item.ID, {
                enable: param.open,
              });
              this.virtualSpaceList();
            }
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
