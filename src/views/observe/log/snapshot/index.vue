<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card flat>
      <v-card-text class="pl-4 py-1">
        <v-row class="my-1 pa-1">
          <v-col
            cols="12"
            class="pa-1 pl-2"
          >
            <ClusterSelect
              v-model="cluster"
              auto-select-first
              object-value
              mode="default"
              @change="onClusterChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '日志快照名称', value: 'search' }"
          @refresh="m_filter_list"
        />
      </v-card-title>
      <v-data-table
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        class="px-4"
      >
        <template #[`item.snapshotName`]="{ item }">{{ item.SnapshotName }}</template>
        <template #[`item.snapshotCount`]="{ item }">{{ item.SnapshotCount }}</template>
        <template #[`item.startTime`]="{ item }">{{ item.StartTime ? $moment(item.StartTime).format('lll') : '' }}</template>
        <template #[`item.endTime`]="{ item }">{{ item.EndTime ? $moment(item.EndTime).format('lll') : '' }}</template>
        <template #[`item.createAt`]="{ item }">{{ item.CreateAt ? $moment(item.CreateAt).format('lll') : '' }}</template>
        <template #[`item.downloadURL`]="{ item }">
          <v-btn
            text
            color="primary"
            class="font-weight-medium"
            small
            @click="previewLogQuerySnapshot(item)"
          >
            {{ item.DownloadURL }}
          </v-btn>
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu
            left
            :attach="`#r${item.ID}`"
          >
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="downloadLogQuerySnapshot(item)"
                  >
                    下载
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeLogQuerySnapshot(item)"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="logQuerySnapshotList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getLogQuerySnapshotList, deleteLogQuerySnapshot } from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import BaseFilter from '@/mixins/base_filter'

export default {
  name: 'LogSnapshot',
  components: { ClusterSelect },
  mixins: [BaseFilter],
  data: () => ({
    items: [],
    headers: [
      { text: '快照名称', value: 'snapshotName', align: 'start' },
      { text: '快照容量（条）', value: 'snapshotCount', align: 'start' },
      { text: '快照地址', value: 'downloadURL', align: 'start' },
      { text: '快照起始时间', value: 'startTime', align: 'start' },
      { text: '快照终止时间', value: 'endTime', align: 'start' },
      { text: '保存时间', value: 'createAt', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 80 },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '日志快照名称', value: 'search', items: [] }],
    cluster: {},
  }),
  computed: {
    ...mapState(['Progress', 'JWT']),
  },
  async mounted() {
    if (this.JWT) {
      Object.assign(this.params, this.$route.query)
    }
  },
  methods: {
    async logQuerySnapshotList() {
      const data = await getLogQuerySnapshotList(
        this.cluster.value,
        this.params,
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / data.CurrentSize)
    },
    removeLogQuerySnapshot(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '删除日志快照',
        content: {
          text: `删除日志快照 ${item.SnapshotName}`,
          type: 'delete',
          name: item.SnapshotName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteLogQuerySnapshot(param.item.ID)
          this.logQuerySnapshotList()
        },
      })
    },
    previewLogQuerySnapshot(item) {
      window.open('/api' + item.DownloadURL)
    },
    downloadLogQuerySnapshot(item) {
      if (this.Progress) return

      const link = document.createElement('a')
      link.addEventListener('click', function () {
        const paths = item.DownloadURL.split('/')
        const filename = paths[paths.length - 1]
        const dir = paths[paths.length - 2]
        link.download = filename
        link.href = `/api/lokiExport/snapshot/${dir}/${filename}`
      })
      const e = document.createEvent('MouseEvents')
      e.initEvent('click', false, false)
      link.dispatchEvent(e)
      this.$store.commit('SET_SNACKBAR', {
        text: '下载成功',
        color: 'success',
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    refresh() {
      this.logQuerySnapshotList()
    },
    onClusterChange () {
      this.logQuerySnapshotList()
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
