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
        <template #[`item.name`]="{ item }">
          {{ item.metadata.name }}
        </template>
        <template #[`item.status`]="{ item }">
          <span v-if="item.status.succeeded !== undefined">
            <v-icon
              small
              color="primary"
            > fas fa-check-circle </v-icon>
            成功
          </span>
          <span v-else-if="item.status.failed !== undefined">
            <v-icon
              small
              color="error"
            >fas fa-minus-circle</v-icon>
            失败
          </span>
          <span v-else-if="item.status.active !== undefined">
            <v-icon
              small
              color="success"
            >fas fa-dot-circle</v-icon>
            进行中
          </span>
        </template>
        <template #[`item.startAt`]="{ item }">
          {{
            item.status.startTime
              ? $moment(item.status.startTime).format('lll')
              : ''
          }}
        </template>
        <template #[`item.endAt`]="{ item }">
          {{
            item.status.completionTime
              ? $moment(item.status.completionTime).format('lll')
              : ''
          }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="jobList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { getJobList } from '@/api'
import BaseResource from '@/mixins/resource'

export default {
  name: 'JobList',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    items: [],
    headers: [
      { text: '任务', value: 'name', align: 'start' },
      { text: '状态', value: 'status', align: 'start' },
      { text: '开始时间', value: 'startAt', align: 'start' },
      { text: '结束时间', value: 'endAt', align: 'start' },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
      noprocessing: true,
    },
  }),
  computed: {
    ...mapState(['JWT']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        Object.assign(this.params, this.$route.query)
        this.jobList()
      })
    }
  },
  methods: {
    async jobList() {
      const data = await getJobList(
        this.ThisCluster,
        this.$route.query.namespace,
        Object.assign(this.params, {
          topkind: 'CronJob',
          topname: this.item
            ? this.item.metadata.name
            : this.$route.params.name,
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>
