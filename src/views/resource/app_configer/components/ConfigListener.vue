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
  <BasePanel v-model="panel" icon="mdi-wrench" :title="$t('tip.listen_list')">
    <template #content>
      <v-data-table
        :headers="headers"
        hide-default-footer
        :items="listeners"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
        @page-count="pageCount = $event"
      />
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :front-page="true"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="open"
      />
    </template>
  </BasePanel>
</template>

<script>
  import messages from '../i18n';
  import { configListener } from '@/api';

  export default {
    name: 'ConfigListener',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        panel: false,
        listeners: [],
        headers: [
          { text: 'ip', value: 'ip' },
          { text: 'md5', value: 'md5' },
        ],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
      };
    },
    methods: {
      async open(item) {
        const ret = await configListener(item.tenant, item.project, item.application, item.environment, item.key);
        let listeners = [];
        for (let key in ret) {
          listeners.push({ ip: key, md5: ret[key] });
        }
        this.listeners = listeners;
        this.panel = true;
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
