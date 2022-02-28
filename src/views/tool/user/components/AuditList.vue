<template>
  <v-card
    flat
    class="pa-2"
  >
    <v-card-title class="pa-0">
      <v-chip-group
        v-model="action"
        column
        class="ml-2 align-center"
        @change="onActionStatusChange"
      >
        <v-chip
          v-for="(item, index) in actionItems"
          :key="index"
          label
          small
          :outlined="action !== index"
          :color="item.color"
          class="font-weight-medium"
          :text-color="`${action !== index ? item.color : 'white'}`"
        >
          {{ item.text }}
        </v-chip>
      </v-chip-group>
    </v-card-title>
    <v-data-table
      class="mx-2"
      disable-sort
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      hide-default-footer
      single-expand
      show-expand
      item-key="ID"
      @item-expanded="convertYaml"
      @click:row="onRowClick"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
      </template>
      <template #[`item.clientIP`]="{ item }">
        {{ item.ClientIP }}
      </template>
      <template #[`item.tenant`]="{ item }">
        {{ item.Tenant }}
      </template>
      <template #[`item.action`]="{ item }">
        {{ item.Action }}
      </template>
      <template #[`item.module`]="{ item }">
        {{ item.Module }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.Name }}
      </template>
      <template #[`item.success`]="{ item }">
        <v-icon
          v-if="item.Success"
          color="success"
          small
        >
          mdi-check-circle
        </v-icon>
        <v-icon
          v-else
          color="error"
          small
        >
          mdi-close-circle
        </v-icon>
      </template>
      <template #expanded-item="{ headers }">
        <td :colspan="headers.length">
          <pre class="kubegems__word-all-break">{{ yaml }}</pre>
        </td>
      </template>
      <template #[`item.labels`]="{ item }">
        <v-chip
          v-for="(value, key) in item ? item.Labels : {}"
          :key="key"
          small
          class="ma-1"
          color="success"
          text-color="white"
        >
          <strong class="mx-1"> {{ key }} </strong>
          {{ value }}
        </v-chip>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @loaddata="auditList"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { getAuditList } from '@/api'

export default {
  name: 'AuditList',
  data() {
    return {
      items: [],
      headers: [
        { text: '时间', value: 'createdAt', align: 'start', width: 220 },
        { text: '租户', value: 'tenant', align: 'start', width: 100 },
        { text: '操作', value: 'action', align: 'start', width: 100 },
        { text: 'Kind', value: 'module', align: 'start', width: 150 },
        { text: '对象', value: 'name', align: 'start', width: 250 },
        { text: '标签', value: 'labels', align: 'start' },
        { text: 'ClientIP', value: 'clientIP', align: 'start', width: 150 },
        { text: '状态', value: 'success', align: 'start', width: 100 },
        { text: '', value: 'data-table-expand' },
      ],
      pageCount: 0,
      action: null,
      actionItems: [
        { text: '创建', color: 'primary' },
        { text: '删除', color: 'error' },
        { text: '更新', color: 'warning' },
        { text: '执行命令', color: 'grey' },
        { text: '登录', color: 'success' },
        { text: '启用', color: 'success' },
        { text: '禁用', color: 'error' },
      ],
      yaml: '',
    }
  },
  computed: {
    ...mapState(['JWT', 'User']),
    params() {
      return {
        page: 1,
        size: 20,
        order: '-CreatedAt',
        Username: this.User.Username,
        Action:
          this.action || this.action === 0
            ? this.actionItems[this.action].text
            : null,
      }
    },
  },
  mounted() {
    if (this.JWT) {
      this.auditList()
    }
  },
  methods: {
    onActionStatusChange() {
      this.auditList()
    },
    async auditList(noprocess = false) {
      const data = await getAuditList(
        Object.assign(this.params, { noprocessing: noprocess }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    convertYaml({ item, value }) {
      if (value) {
        if (item.RawData.request) {
          try {
            item.RawData.request = JSON.parse(item.RawData.request)
          } catch {
            //
          }
        }
        if (item.RawData.response) {
          try {
            item.RawData.response = JSON.parse(item.RawData.response)
          } catch {
            //
          }
        }
        this.yaml = this.$yamldump(item.RawData)
      }
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onRowClick(item, { expand, isExpanded }) {
      expand(!isExpanded)
    },
  },
}
</script>
