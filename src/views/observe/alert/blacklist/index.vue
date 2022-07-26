<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-container class="alert-history" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ProjectEnvSelectCascade v-model="env" first reverse :tenant="tenant" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card class="mt-3 pa-4">
      <v-data-table
        class="kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="Fingerprint"
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-expand
        single-expand
        @click:row="onRowClick"
      >
        <template #[`item.summary`]="{ item }">
          {{ item.Summary }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.Namespace }}
        </template>
        <template #[`item.fingerprint`]="{ item }">
          {{ item.Fingerprint }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.SilenceCreator }}
        </template>
        <template #[`item.silenceEndsAt`]="{ item }">
          {{ item.SilenceEndsAt ? $moment(item.SilenceEndsAt).format('yyyy/MM/DD hh:mm:ss') : '永久' }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="pa-4" :colspan="headers.length">
            <pre class="pre">{{ item.Labels }}</pre>
          </td>
        </template>
        <template #[`item.action`]="{ item }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2">
              <v-btn color="primary" small text @click.stop="onRemoveBlack(item)"> 移除黑名单 </v-btn>
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
        @loaddata="getBlackList"
      />
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { deletePrometheusBlacklist, getPrometheusBlackList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deleteEmpty } from '@/utils/helpers';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'AlertHistroy',
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    data() {
      this.headers = [
        { text: '摘要', value: 'summary', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '指纹', value: 'fingerprint', align: 'start' },
        { text: '创建人', value: 'silenceCreator', align: 'start' },
        { text: '过期时间', value: 'silenceEndsAt', align: 'start' },
        { text: '', value: 'action', align: 'center', width: 20 },
        { text: '', value: 'data-table-expand', align: 'end' },
      ];

      return {
        items: [],
        pageCount: 0,
        tenant: null,
        params: {
          cluster: '',
          namespace: '',
          page: 1,
          size: 10,
        },
        env: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.params.cluster = newValue.clusterName;
            this.params.namespace = newValue.namespace;
            this.getBlackList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.tenant = this.Tenant();
      });
    },
    methods: {
      async getBlackList() {
        const params = deleteEmpty({ ...this.params });
        const data = await getPrometheusBlackList(params);
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.items = data.List || [];
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onRemoveBlack(item) {
        this.$store.commit('SET_CONFIRM', {
          title: '告警黑名单',
          content: {
            text: '是否确认将此条告警信息从告警黑名单中移除？',
            type: 'confirm',
          },
          doFunc: async () => {
            await deletePrometheusBlacklist(item.Fingerprint);
            this.getBlackList();
          },
        });
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
