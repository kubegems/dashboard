<template>
  <BasePanel v-model="panel" icon="mdi-wrench" title="监听列表">
    <template #content>
      <v-data-table
        :headers="headers"
        hide-default-footer
        :items="listeners"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        @page-count="pageCount = $event"
      />
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :front-page="true"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="open"
      />
    </template>
  </BasePanel>
</template>

<script>
  import { configListener } from '../api/index.js';
  export default {
    name: 'ConfigListener',
    data() {
      return {
        panel: false,
        listeners: [],
        headers: [
          { text: 'ip', value: 'ip' },
          { text: 'md5', value: 'md5' },
        ],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
      };
    },
    methods: {
      async open(item) {
        const ret = await configListener(item.tenant, item.project, item.application, item.environment, item.key);
        let listeners = [];
        for (let key in ret) {
          listeners.push({ ip: key, md5: ret[key] });
        }
        this.listeners = listeners;
        this.panel = true;
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
