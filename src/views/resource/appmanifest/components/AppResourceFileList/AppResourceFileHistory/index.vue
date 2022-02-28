<template>
  <v-sheet>
    <v-data-table
      disable-sort
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.page_size"
      no-data-text="暂无数据"
      hide-default-footer
    >
      <template #[`item.hash`]="{ item }">
        {{ item.hash.substr(0, 7) }}
      </template>
      <template #[`item.timestamp`]="{ item }">
        {{ item.timestamp ? $moment(item.timestamp).format('lll') : '' }}
      </template>
      <template #[`item.action`]="{ item }">
        <v-flex :id="`r${item.hash}`" />
        <v-menu
          left
          :attach="`#r${item.hash}`"
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
            <v-card-text class="pa-2 text-center">
              <v-flex>
                <v-btn
                  color="primary"
                  text
                  small
                  @click="diff(item)"
                >
                  变更内容
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="primary"
                  text
                  small
                  @click="rollback(item)"
                >
                  回滚
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
      @loaddata="appResourceFileHistorys"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />

    <AppResourceFileDiff ref="appResourceFileDiff" />
  </v-sheet>
</template>

<script>
import { getAppResourceFileHistorys, postRollbackAppResourceFile } from '@/api'
import AppResourceFileDiff from './AppResourceFileDiff'
import BaseResource from '@/mixins/resource'

export default {
  name: 'AppResourceFileHistory',
  components: {
    AppResourceFileDiff,
  },
  mixins: [BaseResource],
  props: {
    app: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    items: [],
    headers: [
      { text: 'CommitID', value: 'hash', align: 'start' },
      { text: '消息', value: 'message', align: 'start' },
      { text: '修改人', value: 'author', align: 'start' },
      { text: '修改时间', value: 'timestamp', align: 'start' },
      { text: '操作', value: 'action', align: 'center', width: 20 },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
      noprocessing: true,
    },
  }),
  mounted() {
    this.$nextTick(() => {
      this.appResourceFileHistorys()
    })
  },
  methods: {
    async appResourceFileHistorys() {
      const data = await getAppResourceFileHistorys(
        this.app.TenantID,
        this.app.ProjectID,
        this.ThisAppEnvironmentID,
        this.app.name,
        this.params,
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    diff(item) {
      this.$refs.appResourceFileDiff.init(this.app, item)
      this.$refs.appResourceFileDiff.open()
    },
    rollback(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '回滚',
        content: { text: `回滚版本至 ${item.hash}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await postRollbackAppResourceFile(
            this.app.TenantID,
            this.app.ProjectID,
            this.ThisAppEnvironmentID,
            this.app.name,
            {
              hash: param.item.hash,
            },
          )
          this.$emit('refresh')
        },
      })
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
