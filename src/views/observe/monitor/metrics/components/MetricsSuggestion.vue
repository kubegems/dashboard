<template>
  <v-data-table
    v-if="suggestShow"
    class="table kubegems__table-row-pointer"
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
    loading-text="载入中..."
    no-data-text="暂无指标"
    no-results-text="无匹配"
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
  import { getMetrics } from '@/api';

  export default {
    name: 'MetricsSuggestion',
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
