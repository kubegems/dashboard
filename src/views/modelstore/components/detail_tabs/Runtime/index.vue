<template>
  <v-card class="mt-3">
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
      />
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="runtimeList"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'Runtime',
    data: () => ({
      items: [],
      headers: [
        { text: '部署实例', value: 'instance', align: 'start' },
        { text: '模型版本', value: 'version', align: 'start' },
        { text: '状态', value: 'status', align: 'start' },
        { text: '集群', value: 'cluster', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '创建人', value: 'creator', align: 'start' },
        { text: 'Api', value: 'api', align: 'start' },
        { text: '操作', value: 'action', align: 'center', width: 20 },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),

    methods: {
      async runtimeList() {},
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
