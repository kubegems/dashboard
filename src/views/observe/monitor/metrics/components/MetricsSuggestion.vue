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
  <v-data-table
    v-if="suggestShow"
    class="table kubegems__table-row-pointer pa-2"
    :custom-filter="filterKeyword"
    dense
    disable-pagination
    disable-sort
    :headers="headers"
    hide-default-footer
    hide-default-header
    item-key="item.value"
    :items="items"
    :loading="loading"
    :loading-text="$t('tip.loading')"
    :no-data-text="$root.$t('data.no_data')"
    :no-results-text="$root.$t('data.no_data')"
    :search="keyword"
    :style="{ top: `${top + topOffset}px`, left: `${left}px` }"
    @click:row="selectedItem"
  >
    <template #[`item.item`]="{ item }">
      {{ item.value }}
    </template>
  </v-data-table>
</template>

<script>
  import messages from '../../i18n';
  import { getMetrics } from '@/api';

  export default {
    name: 'MetricsSuggestion',
    i18n: {
      messages: messages,
    },
    props: {
      cluster: {
        type: String,
        default: () => '',
      },
      expr: {
        type: String,
        default: () => '',
      },
      index: {
        type: Number,
        default: () => 0,
      },
      left: {
        type: Number,
        default: () => 35,
      },
      newline: {
        type: Number,
        default: () => 43,
      },
      top: {
        type: Number,
        default: () => 250,
      },
    },
    data() {
      return {
        suggestShow: true,
        items: [],
        loading: false,
        keyword: '',
        topOffset: 0,
        headers: [{ text: '', value: 'item', align: 'start' }],
      };
    },
    watch: {
      cluster: {
        handler(newValue) {
          if (newValue) {
            this.loadMetrics();
          } else {
            this.suggestShow = false;
          }
        },
        deep: true,
        immediate: true,
      },
      expr: {
        handler: async function (newValue) {
          if (newValue) {
            if (newValue.length >= this.newline) {
              this.topOffset = (24 * newValue.length) / this.newline;
            } else {
              this.topOffset = 0;
            }
          } else {
            this.suggestShow = true;
          }
          if (this.suggestShow) {
            await this.loadMetrics();
            if (this.items.length === 0) {
              this.suggestShow = false;
            }
          }
        },
        deep: true,
      },
    },
    methods: {
      async loadMetrics() {
        if (!this.cluster) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_cluster_or_environment'),
            color: 'warning',
          });
          return;
        }
        this.loading = true;
        const data = await getMetrics(this.cluster, {
          label: '__name__',
          noprocessing: true,
          search: this.expr,
        });
        this.loading = false;
        this.items = data.labels.map((l) => {
          return { text: l, value: l };
        });
      },
      filterKeyword(value, search, item) {
        return typeof item.value === 'string' && item.value.toString().indexOf(search) !== -1;
      },
      selectedItem(item) {
        this.suggestShow = false;
        this.$emit('insertMetrics', item.value, this.index);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .table {
    min-width: 200px !important;
    box-shadow: 1px 2px 2px gray !important;
    position: absolute;
    z-index: 1;
    left: 20px;
    max-height: 200px;
    overflow-y: auto;
    font-weight: normal;
    border-radius: 8px;
  }
</style>
