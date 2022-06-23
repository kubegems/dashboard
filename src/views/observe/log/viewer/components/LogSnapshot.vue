<template>
  <BaseFullScreenDialog v-model="visible" icon="mdi-camera" title="查看快照" @dispose="handleDispose">
    <template #action>
      <ProjectEnvSelect reverse :tenant="tenant" @refreshEnvironemnt="refreshEnvironemnt" />
    </template>
    <template #content>
      <v-card class="mt-3" flat>
        <v-data-table
          class="px-4"
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          :page.sync="params.page"
        >
          <template #[`item.snapshotName`]="{ item }">{{ item.SnapshotName }}</template>
          <template #[`item.snapshotCount`]="{ item }">{{ item.SnapshotCount }}</template>
          <template #[`item.startTime`]="{ item }">{{
            item.StartTime ? $moment(item.StartTime).format('lll') : ''
          }}</template>
          <template #[`item.endTime`]="{ item }">{{
            item.EndTime ? $moment(item.EndTime).format('lll') : ''
          }}</template>
          <template #[`item.createAt`]="{ item }">{{
            item.CreateAt ? $moment(item.CreateAt).format('lll') : ''
          }}</template>
          <template #[`item.downloadURL`]="{ item }">
            <v-btn class="font-weight-medium" color="primary" small text @click="previewLogQuerySnapshot(item)">
              {{ item.DownloadURL }}
            </v-btn>
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.ID}`" />
            <v-menu :attach="`#r${item.ID}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="downloadLogQuerySnapshot(item)"> 下载 </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeLogQuerySnapshot(item)"> 删除 </v-btn>
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
          @changepage="onPageIndexChange"
          @changesize="onPageSizeChange"
          @loaddata="logQuerySnapshotList"
        />
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getLogQuerySnapshotList, deleteLogQuerySnapshot } from '@/api';
  import BaseSelect from '@/mixins/select';
  import ProjectEnvSelect from '@/views/observe/components/ProjectEnvSelect';

  export default {
    name: 'LogSnapshot',
    components: {
      ProjectEnvSelect,
    },
    mixins: [BaseSelect],
    data: () => ({
      visible: false,
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
      clusterid: undefined,
      tenant: null,
    }),
    computed: {
      ...mapState(['Progress', 'JWT']),
      ...mapGetters(['Tenant']),
    },
    async mounted() {
      if (this.JWT) {
        Object.assign(this.params, this.$route.query);
      }
    },
    methods: {
      show() {
        this.visible = true;
        this.tenant = this.Tenant();
      },
      async logQuerySnapshotList() {
        const data = await getLogQuerySnapshotList(this.clusterid, this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / data.CurrentSize);
      },
      refreshEnvironemnt(env) {
        this.clusterid = env.clusterid;
        this.logQuerySnapshotList();
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
            await deleteLogQuerySnapshot(param.item.ID);
            this.logQuerySnapshotList();
          },
        });
      },
      previewLogQuerySnapshot(item) {
        window.open('/api' + item.DownloadURL);
      },
      downloadLogQuerySnapshot(item) {
        if (this.Progress) return;

        const link = document.createElement('a');
        link.addEventListener('click', function () {
          const paths = item.DownloadURL.split('/');
          const filename = paths[paths.length - 1];
          const dir = paths[paths.length - 2];
          link.download = filename;
          link.href = `/api/lokiExport/snapshot/${dir}/${filename}`;
        });
        const e = document.createEvent('MouseEvents');
        e.initEvent('click', false, false);
        link.dispatchEvent(e);
        this.$store.commit('SET_SNACKBAR', {
          text: '下载成功',
          color: 'success',
        });
      },
      refresh() {
        this.logQuerySnapshotList();
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      handleDispose() {
        this.cluster = undefined;
        this.items = [];
      },
    },
  };
</script>
