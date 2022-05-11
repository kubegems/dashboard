<template>
  <BasePanel
    v-model="panel"
    title="镜像跟踪"
    :width="`50%`"
    icon="fas fa-search"
    @dispose="dispose"
  >
    <template #header>
      <span class="primary--text ml-2 text-subtitle-2">
        {{ item ? item.ImageName : '' }}
      </span>
    </template>
    <template #content>
      <v-card-text class="mt-1 pa-2">
        <v-data-table
          disable-sort
          :headers="headers"
          :items="items"
          :page.sync="params.page"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          hide-default-footer
          :height="height"
        >
          <template #[`item.publisher`]="{ item }">
            {{
              item.publisher.indexOf(' ') > -1
                ? item.publisher.split(' ')[0]
                : item.publisher
            }}
          </template>
          <template #[`item.publishAt`]="{ item }">
            {{ item.publishAt ? $moment(item.publishAt).format('lll') : '' }}
          </template>
          <template #[`item.dev`]="{ item }">
            <v-icon
              v-if="item.type === 'dev'"
              small
              color="primary"
            >
              mdi-check
            </v-icon>
          </template>
          <template #[`item.test`]="{ item }">
            <v-icon
              v-if="item.type === 'test'"
              small
              color="primary"
            >
              mdi-check
            </v-icon>
          </template>
          <template #[`item.prod`]="{ item }">
            <v-icon
              v-if="item.type === 'prod'"
              small
              color="primary"
            >
              mdi-check
            </v-icon>
          </template>
        </v-data-table>
        <BasePagination
          v-if="pageCount >= 1"
          v-model="params.page"
          :page-count="pageCount"
          :size="params.size"
          :show-size="false"
          @loaddata="deployEnvironmentAppImageTrace"
          @changesize="onPageSizeChange"
          @changepage="onPageIndexChange"
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getDeployEnvironmentAppImageTrace } from '@/api'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'AppDeployImageTrace',
  data: () => ({
    panel: false,
    item: null,
    items: [],
    app: null,
    headers: [
      { text: '时间', value: 'publishAt', align: 'start' },
      { text: '任务', value: 'id', align: 'start' },
      { text: '发布人', value: 'publisher', align: 'start' },
      { text: '镜像', value: 'image', align: 'start', width: 300 },
      { text: '开发', value: 'dev', align: 'start' },
      { text: '测试', value: 'test', align: 'start' },
      { text: '生产', value: 'prod', align: 'start' },
    ],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
  }),
  computed: {
    ...mapState(['Scale']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
    height() {
      return window.innerHeight - 64 * this.Scale - 1
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(app, item) {
      this.item = deepCopy(item)
      this.app = deepCopy(app)
      this.deployEnvironmentAppImageTrace()
    },
    async deployEnvironmentAppImageTrace() {
      const data = await getDeployEnvironmentAppImageTrace(
        this.app.TenantID,
        this.app.ProjectID,
        this.ThisAppEnvironmentID,
        this.app.name,
        Object.assign(this.params, {
          image: this.item.images[0],
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    dispose() {
      this.items = []
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
