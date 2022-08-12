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
          :default="{ items: [], text: $t('filter.dns_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_tenantAllow || m_permisson_virtualSpaceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addDNSDomain">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.dns')]) }}
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
        <template #[`item.virtualDomainName`]="{ item }">
          {{ item.VirtualDomainName }}
        </template>
        <template #[`item.createdBy`]="{ item }">
          {{ item.CreatedBy }}
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
                <v-flex>
                  <v-btn color="primary" small text @click="updateDNSDomain(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeDNSDomain(item)">
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
        @loaddata="dnsDomainList"
      />
    </v-card>

    <AddDNSDomain ref="addDNSDomain" @refresh="dnsDomainList" />
    <UpdateDNSDomain ref="updateDNSDomain" @refresh="dnsDomainList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddDNSDomain from './components/AddDNSDomain';
  import UpdateDNSDomain from './components/UpdateDNSDomain';
  import messages from './i18n';
  import { deleteDNSDomain, getDnsDomainList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';

  export default {
    name: 'DNSDomain',
    i18n: {
      messages: messages,
    },
    components: {
      AddDNSDomain,
      UpdateDNSDomain,
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
      ...mapState(['JWT']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'virtualDomainName', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
          { text: this.$t('table.creator'), value: 'createdBy', align: 'start' },
        ];
        if (this.m_permisson_virtualSpaceAllow || this.m_permisson_tenantAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.dns_name'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.m_table_generateParams();
          this.dnsDomainList();
        });
      }
    },
    methods: {
      async dnsDomainList(noprocess = false) {
        const data = await getDnsDomainList(
          Object.assign(this.params, {
            noprocessing: noprocess,
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      addDNSDomain() {
        this.$refs.addDNSDomain.open();
      },
      updateDNSDomain(item) {
        this.$refs.updateDNSDomain.init(item);
        this.$refs.updateDNSDomain.open();
      },
      removeDNSDomain(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.dns')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.dns')])} ${item.VirtualDomainName}`,
            type: 'delete',
            name: item.VirtualDomainName,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.VirtualDomainName.length > 0) {
              await deleteDNSDomain(param.item.ID);
              this.dnsDomainList();
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
