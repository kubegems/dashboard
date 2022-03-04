<template>
  <v-flex>
    <v-data-table
      disable-sort
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      hide-default-footer
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
import BaseResource from '@/mixins/resource'

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
  watch: {
    resource: {
      handler: function () {
        if (this.resource) {
          this.resultList()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async resultList() {
      const data =
        this.resource &&
        this.resource.liveState &&
        this.resource.liveState.status.operationState
          ? this.resource.liveState.status.operationState.syncResult.resources
          : []
      this.items = data
    },
    // eslint-disable-next-line vue/no-unused-properties
    dispose() {},
  },
}
</script>
