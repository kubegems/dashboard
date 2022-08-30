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
  <div class="metrics">
    <v-text-field
      v-model="search"
      class="px-2 mt-2"
      hide-details
      :label="$root.$t('query')"
      prepend-inner-icon="mdi-magnify"
      @keyup="onInput"
    />
    <v-data-table
      class="px-2"
      :custom-filter="customFilter"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="value"
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :no-results-text="$root.$t('data.no_data')"
      :page.sync="params.page"
      :search.sync="search"
    />
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      front-page
      :page-count="pageCount"
      :show-size="false"
      :size="params.size"
      @changepage="onPageIndexChange"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  import messages from '../../../i18n';
  import { getRuleList } from '@/api';

  export default {
    name: 'MetricsList',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        items: [],
        total: 0,
        params: {
          page: 1,
          size: 5,
        },
        pageCount: 0,
        search: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.rule'), value: 'showName', align: 'start' },
          { text: this.$t('table.expr'), value: 'expr', align: 'start' },
          { text: this.$t('table.unit'), value: 'unit', align: 'start' },
        ];
      },
    },
    watch: {
      total: {
        handler() {
          this.pageCount = Math.ceil(this.total / this.params.size);
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.metricsList();
      });
    },
    methods: {
      customFilter(value, search, item) {
        if (
          item != null &&
          search != null &&
          item.expr &&
          item.expr.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1
        ) {
          this.total += 1;
          return true;
        }
        return false;
      },
      onInput() {
        this.total = 0;
        this.params.page = 1;
      },
      async metricsList() {
        const data = await getRuleList(this.Tenant().ID, '_all', { size: 1000 });

        this.items = data.List;
        this.pageCount = Math.ceil(this.items.length / this.params.size);
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .metrics {
    position: relative;
  }
</style>
