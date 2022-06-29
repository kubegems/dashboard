<template>
  <div :style="{ height: `${height}px`, overflowY: `auto`, position: `relative` }">
    <v-data-table
      class="mx-4 kubegems__table-row-pointer"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="index"
      :items="items"
      :items-per-page="itemsPerPage"
      no-data-text="暂无数据"
      :page.sync="page"
      show-expand
      single-expand
      @click:row="onRowClick"
      @page-count="pageCount = $event"
    >
      <template #[`item.reason`]="{ item }">
        {{ item.stream.reason }}
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip
          class="font-weight-medium chip-width"
          :color="item.stream.type === 'Normal' ? 'success' : 'warning'"
          small
        >
          <span>{{ item.stream.type }}</span>
        </v-chip>
      </template>
      <template #[`item.count`]="{ item }">
        {{ item.stream.count }}
      </template>
      <template #[`item.namespace`]="{ item }">
        {{ item.stream.metadata_namespace ? item.stream.metadata_namespace : '' }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.stream.metadata_name ? item.stream.metadata_name : '' }}
      </template>
      <template #[`item.component`]="{ item }">
        {{ item.stream.source_component ? item.stream.source_component : '' }}
      </template>
      <template #[`item.host`]="{ item }">
        {{ item.stream.source_host ? item.stream.source_host : '' }}
      </template>
      <template #[`item.firstAt`]="{ item }">
        {{
          item.stream.firstTimestamp
            ? $moment(item.stream.firstTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? $moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #[`item.lastAt`]="{ item }">
        {{
          item.stream.lastTimestamp
            ? $moment(item.stream.lastTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? $moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #[`item.message`]="{ item }">
        {{ item.stream.message.length > 100 ? item.stream.message.substr(0, 100) + '......' : item.stream.message }}
      </template>
      <template #expanded-item="{ headers, item }">
        <td class="text-left" :colspan="headers.length">
          <pre class="kubegems__word-all-break">{{ item.stream.message }}</pre>
        </td>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="page"
      :front-page="true"
      :page-count="pageCount"
      pid="page_event"
      :size="itemsPerPage"
      :visible-num="4"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="onDatetimeChange"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'EventList',
    props: {
      data: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        items: [],
        headers: [
          { text: '来源组件', value: 'component', align: 'start', width: 150 },
          { text: '来源主机', value: 'host', align: 'start', width: 250 },
          { text: '服务', value: 'name', align: 'start', width: 200 },
          { text: '命名空间', value: 'namespace', align: 'start', width: 150 },
          { text: '类型', value: 'type', align: 'start', width: 150 },
          { text: 'Reason', value: 'reason', align: 'start', width: 100 },
          { text: '消息', value: 'message', align: 'start', width: 200 },
          { text: '次数', value: 'count', align: 'start', width: 50 },
          { text: '首次发生时间', value: 'firstAt', align: 'start', width: 150 },
          { text: '最近发生时间', value: 'lastAt', align: 'start', width: 150 },
          { text: '', value: 'data-table-expand' },
        ],
        page: 1,
        itemsPerPage: 10,
        pageCount: 0,
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 110) / this.Scale);
      },
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            const itemIndex = this.items.length;
            newValue.forEach((event, index) => {
              const tmp = {
                index: itemIndex + index,
                ...event,
              };
              this.items.push(tmp);
            });
            this.items.sort((a, b) => {
              return parseInt(b.values[0]) - parseInt(a.values[0]);
            });
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onPageSizeChange(size) {
        this.page = 1;
        this.itemsPerPage = size;
      },
      onPageIndexChange(page) {
        this.page = page;
      },
      onDatetimeChange() {
        this.$emit('loadData');
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
