<template>
  <BasePanel v-model="panel" icon="fas fa-search" title="镜像跟踪" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="primary--text ml-2 text-subtitle-2">
        {{ item ? item.ImageName : '' }}
      </span>
    </template>
    <template #content>
      <v-card-text class="mt-1 py-0 px-2">
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
          <template #[`item.publisher`]="{ item }">
            {{ item.publisher.indexOf(' ') > -1 ? item.publisher.split(' ')[0] : item.publisher }}
          </template>
          <template #[`item.publishAt`]="{ item }">
            {{ item.publishAt ? $moment(item.publishAt).format('lll') : '' }}
          </template>
          <template #[`item.dev`]="{ item }">
            <v-icon v-if="item.type === 'dev'" color="primary" small> mdi-check </v-icon>
          </template>
          <template #[`item.test`]="{ item }">
            <v-icon v-if="item.type === 'test'" color="primary" small> mdi-check </v-icon>
          </template>
          <template #[`item.prod`]="{ item }">
            <v-icon v-if="item.type === 'prod'" color="primary" small> mdi-check </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getDeployEnvironmentAppImageTrace } from '@/api';
  import { deepCopy } from '@/utils/helpers';

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
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      height() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.panel = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(app, item) {
        this.item = deepCopy(item);
        this.app = deepCopy(app);
        this.deployEnvironmentAppImageTrace();
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
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      dispose() {
        this.items = [];
      },
    },
  };
</script>
