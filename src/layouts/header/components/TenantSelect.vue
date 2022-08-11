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
    v-model="dialog"
    icon="mdi-account-multiple"
    :title="$root.$t('resource.tenant')"
    :width="600"
    @reset="reset"
  >
    <template #content>
      <v-flex class="grey lighten-4 rounded ma-2 mt-0">
        <v-list-item>
          <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
            {{ $t('tip.tenant') }} : {{ Tenant().TenantName }}
          </v-list-item-content>
        </v-list-item>
      </v-flex>

      <v-text-field v-model="search" class="mx-2 mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />

      <v-sheet>
        <v-data-table
          class="px-2 tenant__table"
          :headers="headers"
          hide-default-footer
          item-key="value"
          :items="m_select_tenantItems"
          :items-per-page="params.size"
          :no-data-text="$root.$t('data.no_data')"
          :no-results-text="$root.$t('data.no_data')"
          :page.sync="params.page"
          :search.sync="search"
        >
          <template #[`item.isActive`]="{ item }">
            <span v-if="item.isActive">
              <v-icon color="primary" small> mdi-check-circle </v-icon>
              {{ $t('status.enabled') }}
            </span>
            <span v-else>
              <v-icon color="error" small> mdi-minus-circle </v-icon>
              {{ $t('status.disabled') }}
            </span>
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn v-if="!item.disabled && item.isActive" color="primary" small text @click="setTenant(item)">
              {{ $root.$t('operate.enter', [$root.$t('resource.space')]) }}
            </v-btn>
          </template>
        </v-data-table>
      </v-sheet>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'TenantSelect',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    inject: ['reload'],
    data: () => ({
      dialog: false,

      search: '',
      params: {
        page: 1,
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['Circular', 'Locale']),
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.tenant'), value: 'text', align: 'start' },
          // { text: 'ID', value: 'value', align: 'start' },
          { text: this.$t('table.status'), value: 'isActive', align: 'start' },
          { text: '', value: 'action', align: 'end' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init() {
        this.m_select_tenantSelectData();
      },
      async setTenant(item) {
        this.$store.commit('CLEAR_RESOURCE');
        this.$store.commit('SET_ADMIN_VIEWPORT', false);
        await this.$router.push({
          name: 'resource-dashboard',
          params: { tenant: item.text },
        });
        await this.$store.dispatch('UPDATE_TENANT_DATA');
        this.reset();
        this.reload();
      },
      reset() {
        this.dialog = false;
      },
    },
  };
</script>

<style lang="scss">
  .tenant__table .v-data-table__wrapper {
    max-height: 350px;
  }
</style>
