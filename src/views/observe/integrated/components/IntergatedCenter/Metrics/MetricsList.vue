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
      label="搜索"
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
      :items-per-page="itemsPerPage"
      no-data-text="暂无数据"
      no-results-text="暂无结果"
      :page.sync="page"
      :search.sync="search"
    />
    <BasePagination
      v-if="pageCount >= 1"
      v-model="page"
      :front-page="true"
      :page-count="pageCount"
      :show-size="false"
      :size="itemsPerPage"
      @changepage="onPageIndexChange"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import { getMyConfigData, getSystemConfigData } from '@/api';

  export default {
    name: 'MetricsList',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        items: [],
        total: 0,
        page: 1,
        pageCount: 0,
        itemsPerPage: 5,
        search: '',
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    watch: {
      total: {
        handler() {
          this.pageCount = Math.ceil(this.total / this.itemsPerPage);
        },
        deep: true,
      },
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.rule'), value: 'showName', align: 'start' },
          { text: this.$t('table.expr'), value: 'expr', align: 'start' },
          { text: this.$t('table.unit'), value: 'unit', align: 'start' },
        ];
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
        this.page = 1;
      },
      async metricsList() {
        let data = null;
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }

        this.items =
          Object.values(data?.content?.resources).reduce((r1, r2) => {
            return Array.isArray(r1)
              ? r1.concat(
                  Object.keys(r2.rules).map((k) => {
                    return { name: k, ...r2.rules[k] };
                  }),
                )
              : Object.keys(r1.rules)
                  .map((k) => {
                    return { name: k, ...r1.rules[k] };
                  })
                  .concat(
                    Object.keys(r2.rules).map((k) => {
                      return { name: k, ...r2.rules[k] };
                    }),
                  );
          }) || [];

        this.pageCount = Math.ceil(this.items.length / this.itemsPerPage);
      },
      onPageIndexChange(page) {
        this.page = page;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .metrics {
    position: relative;
  }
</style>
