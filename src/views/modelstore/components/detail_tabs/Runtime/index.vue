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
  <v-card class="mt-3" flat>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="name"
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2" @click.stop="toEnvironmentModelList(item)">{{ item.name }}</a>
        </template>
        <template #[`item.phase`]="{ item }">
          <span
            :class="`v-avatar mr-2 ${['Pending'].indexOf(item.phase) > -1 ? 'kubegems__waiting-flashing' : ''}`"
            :style="{
              height: '10px',
              minWidth: '10px',
              width: '10px',
              backgroundColor: `${$POD_STATUS_COLOR[item.phase] || '#ff5252'}`,
            }"
          />
          <span>
            {{ item.phase || 'No Status' }}
          </span>
        </template>
        <template #[`item.url`]="{ item }">
          <a :href="item.url" target="_blank" @click.stop>{{ item.url }}</a>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="runtimeList"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { Base64 } from 'js-base64';

  import { getModelRuntimeList } from '@/api';

  export default {
    name: 'RuntimeList',
    data: () => ({
      items: [],
      headers: [
        { text: '部署实例', value: 'name', align: 'start' },
        { text: '模型版本', value: 'modelVersion', align: 'start' },
        { text: '状态', value: 'phase', align: 'start' },
        { text: '集群', value: 'cluster', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '创建人', value: 'creator', align: 'start' },
        { text: 'Api', value: 'url', align: 'start' },
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
        this.runtimeList();
      });
    },
    methods: {
      async runtimeList() {
        const data = await getModelRuntimeList(
          this.$route.query.registry,
          Base64.encode(this.$route.params.name),
          this.params,
        );
        this.items = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
        this.$router.replace({ query: { ...this.$route.query } });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      toEnvironmentModelList(item) {
        this.$router.push({
          name: 'app-list',
          params: {
            tenant: item.tenant,
            project: item.project,
            environment: item.environment,
          },
          query: {
            kind: 'modelstore',
            tab: 'modelstore',
          },
        });
      },
    },
  };
</script>
