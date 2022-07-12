<template>
  <v-card class="mt-3" flat>
    <v-card-text>
      <v-data-table
        class="kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="name"
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-expand
        single-expand
        @click:row="onRowClick"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2">{{ item.name }}</a>
        </template>
        <template #expanded-item="{ headers }">
          <td class="my-2 py-2" :colspan="headers.length">
            {{ expandData }}
          </td>
        </template>
      </v-data-table>
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
  import { Base64 } from 'js-base64';

  import { getModelRuntimeList, getModelRuntimeDetail } from '@/api';

  export default {
    name: 'RuntimeList',
    data: () => ({
      items: [],
      headers: [
        { text: '部署实例', value: 'name', align: 'start' },
        { text: '模型版本', value: 'version', align: 'start' },
        { text: '状态', value: 'status', align: 'start' },
        { text: '集群', value: 'cluster', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '创建人', value: 'creator', align: 'start' },
        { text: 'Api', value: 'url', align: 'start' },
        { text: '', value: 'data-table-expand' },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
      expandData: {},
    }),
    mounted() {
      this.$nextTick(() => {
        this.runtimeList();
      });
    },
    methods: {
      async runtimeList() {
        const data = await getModelRuntimeList(
          this.$route.query.registry,
          Base64.encode(this.$route.params.name),
          this.params,
        );
        this.items = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({ query: { ...this.$route.query } });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      async onRowClick(item, { expand, isExpanded }) {
        const data = await getModelRuntimeDetail(item.tenant, item.project, item.env, item.name);
        this.expandData = data;
        expand(!isExpanded);
      },
    },
  };
</script>
