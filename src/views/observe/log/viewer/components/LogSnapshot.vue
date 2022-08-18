<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BaseFullScreenDialog
    v-model="visible"
    icon="mdi-camera"
    :title="$t('operate.view_snapshot')"
    @dispose="handleDispose"
  >
    <template #action>
      <ProjectEnvSelectCascade
        :key="selectKey"
        v-model="env"
        first
        reverse
        reverse-color
        :small="false"
        :tenant="tenant"
      />
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
          :no-data-text="$root.$t('data.no_data')"
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
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="downloadLogQuerySnapshot(item)">
                      {{ $t('operate.download') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeLogQuerySnapshot(item)">
                      {{ $root.$t('operate.delete') }}
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

  import messages from '../../i18n';
  import { deleteLogQuerySnapshot, getLogQuerySnapshotList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { randomString } from '@/utils/helpers';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'LogSnapshot',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    data: () => ({
      visible: false,
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      clusterid: undefined,
      tenant: null,
      env: undefined,
      selectKey: '',
    }),
    computed: {
      ...mapState(['Progress', 'JWT']),
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'snapshotName', align: 'start' },
          { text: this.$t('table.snapshot_count'), value: 'snapshotCount', align: 'start' },
          { text: this.$t('table.snapshot_address'), value: 'downloadURL', align: 'start' },
          { text: this.$t('table.start_at'), value: 'startTime', align: 'start' },
          { text: this.$t('table.end_at'), value: 'endTime', align: 'start' },
          { text: this.$t('table.save_at'), value: 'createAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 80 },
        ];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.clusterid = newValue.clusterid;
            this.logQuerySnapshotList();
          }
        },
        deep: true,
        immediate: true,
      },
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
        this.selectKey = `snapshot-${randomString(4)}`;
      },
      async logQuerySnapshotList() {
        const data = await getLogQuerySnapshotList(this.clusterid, this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / data.CurrentSize);
      },
      removeLogQuerySnapshot(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('tip.snapshot')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('tip.snapshot')])} ${item.SnapshotName}`,
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
          text: this.$t('tip.download_success'),
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
