<template>
  <v-flex class="px-2">
    <v-data-table
      disable-sort
      :headers="headers"
      :height="height"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      :page.sync="params.page"
    >
      <template #[`item.kind`]="{ item }">
        {{ item.kind }}
      </template>
      <template #[`item.namespace`]="{ item }">
        {{ item.namespace }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.name }}
      </template>
      <template #[`item.status`]="{ item }">
        {{ item.status }}
      </template>
      <template #[`item.message`]="{ item }">
        {{ item.message }}
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployResult',
    mixins: [BaseResource],
    props: {
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      items: [],
      headers: [
        { text: 'Kind', value: 'kind', align: 'start' },
        { text: 'Namspace', value: 'namespace', align: 'start' },
        { text: '名称', value: 'name', align: 'start' },
        { text: '状态', value: 'status', align: 'start' },
        { text: '消息', value: 'message', align: 'start', width: 350 },
      ],
      params: {
        page: 1,
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 64 - 45) / this.Scale);
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.resultList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async resultList() {
        const data = this.resource?.liveState?.status?.operationState?.syncResult?.resources || [];
        this.items = data;
      },
      dispose() {},
    },
  };
</script>
