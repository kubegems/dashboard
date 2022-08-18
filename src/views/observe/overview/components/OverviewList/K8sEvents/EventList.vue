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
  <div :style="{ height: `${height}px`, overflowY: `auto`, position: `relative` }">
    <v-data-table
      class="mx-4 kubegems__table-row-pointer"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="index"
      :items="items"
      :items-per-page="itemsPerPage"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="page"
      show-expand
      single-expand
      @click:row="onRowClick"
      @page-count="pageCount = $event"
    >
      <template #[`item.reason`]="{ item }">
        {{ item.stream.reason }}
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip
          class="font-weight-medium chip-width"
          :color="item.stream.type === 'Normal' ? 'success' : 'warning'"
          small
        >
          <span>{{ item.stream.type }}</span>
        </v-chip>
      </template>
      <template #[`item.count`]="{ item }">
        {{ item.stream.count }}
      </template>
      <template #[`item.namespace`]="{ item }">
        {{ item.stream.metadata_namespace ? item.stream.metadata_namespace : '' }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.stream.metadata_name ? item.stream.metadata_name : '' }}
      </template>
      <template #[`item.component`]="{ item }">
        {{ item.stream.source_component ? item.stream.source_component : '' }}
      </template>
      <template #[`item.host`]="{ item }">
        {{ item.stream.source_host ? item.stream.source_host : '' }}
      </template>
      <template #[`item.firstAt`]="{ item }">
        {{
          item.stream.firstTimestamp
            ? $moment(item.stream.firstTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? $moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #[`item.lastAt`]="{ item }">
        {{
          item.stream.lastTimestamp
            ? $moment(item.stream.lastTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? $moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #[`item.message`]="{ item }">
        {{ item.stream.message.length > 100 ? item.stream.message.substr(0, 100) + '......' : item.stream.message }}
      </template>
      <template #expanded-item="{ headers, item }">
        <td class="text-left" :colspan="headers.length">
          <pre class="kubegems__word-all-break">{{ item.stream.message }}</pre>
        </td>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="page"
      :front-page="true"
      :page-count="pageCount"
      pid="page_event"
      :size="itemsPerPage"
      :visible-num="4"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="onDatetimeChange"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';

  export default {
    name: 'EventList',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        items: [],

        page: 1,
        itemsPerPage: 10,
        pageCount: 0,
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 110) / this.Scale);
      },
      headers() {
        return [
          { text: this.$t('table.origin_component'), value: 'component', align: 'start', width: 150 },
          { text: this.$t('table.origin_host'), value: 'host', align: 'start', width: 250 },
          { text: this.$root.$t('resource.service'), value: 'name', align: 'start', width: 200 },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start', width: 150 },
          { text: this.$root.$t('resource.type'), value: 'type', align: 'start', width: 150 },
          { text: 'Reason', value: 'reason', align: 'start', width: 100 },
          { text: this.$t('table.message'), value: 'message', align: 'start', width: 200 },
          { text: this.$t('table.count'), value: 'count', align: 'start', width: 50 },
          { text: this.$t('table.first_at'), value: 'firstAt', align: 'start', width: 150 },
          { text: this.$t('table.last_at'), value: 'lastAt', align: 'start', width: 150 },
          { text: '', value: 'data-table-expand' },
        ];
      },
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            const itemIndex = this.items.length;
            newValue.forEach((event, index) => {
              const tmp = {
                index: itemIndex + index,
                ...event,
              };
              this.items.push(tmp);
            });
            this.items.sort((a, b) => {
              return parseInt(b.values[0]) - parseInt(a.values[0]);
            });
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onPageSizeChange(size) {
        this.page = 1;
        this.itemsPerPage = size;
      },
      onPageIndexChange(page) {
        this.page = page;
      },
      onDatetimeChange() {
        this.$emit('loadData');
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
