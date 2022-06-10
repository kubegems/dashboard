<template>
  <v-card>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
      >
        <template #[`item.reason`]="{ item }">
          {{ item.reason }}
        </template>
        <template #[`item.type`]="{ item }">
          <v-badge
            v-if="item.count > 1"
            bordered
            :color="$EVENT_STATUS_COLOR[item.type]"
            :content="item.count > 99 ? '99+' : item.count"
            overlap
          >
            <v-chip
              class="white--text font-weight-medium chip-width"
              :color="$EVENT_STATUS_COLOR[item.type]"
              small
              label
            >
              <span>{{ item.type }}</span>
            </v-chip>
          </v-badge>
          <v-chip
            v-else
            class="white--text font-weight-medium chip-width"
            :color="$EVENT_STATUS_COLOR[item.type]"
            small
            label
          >
            <span>{{ item.type }}</span>
          </v-chip>
        </template>
        <template #[`item.kind`]="{ item }">
          {{ item.involvedObject.kind }}
        </template>
        <template #[`item.firstAt`]="{ item }">
          {{
            item.firstTimestamp
              ? $moment(item.firstTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
              : item.eventTime
              ? $moment(item.eventTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
              : ''
          }}
        </template>
        <template #[`item.lastAt`]="{ item }">
          {{ item.lastTimestamp ? $moment(item.lastTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
        </template>
        <template #[`item.message`]="{ item }">
          {{ item.message }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="eventList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { getEventList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'EventList',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      selector: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      items: [],
      headers: [
        { text: 'Reason', value: 'reason', align: 'start' },
        { text: 'Kind', value: 'kind', align: 'start' },
        { text: '首次发生时间', value: 'firstAt', align: 'start', width: 120 },
        { text: '最近发生时间', value: 'lastAt', align: 'start', width: 120 },
        { text: '类型', value: 'type', align: 'start' },
        { text: '消息', value: 'message', align: 'start' },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
    watch: {
      item: {
        handler: function () {
          if (this.item) {
            this.eventList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async eventList() {
        const data = await getEventList(
          this.$route.query.cluster || this.ThisCluster,
          this.$route.query.namespace || '_all',
          Object.assign(this.selector, this.params),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
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

<style lang="scss" scoped>
  .regular-width {
    width: 70px;
  }

  .chip-width {
    width: 70px;
    display: block;
    text-align: center;
  }
</style>
