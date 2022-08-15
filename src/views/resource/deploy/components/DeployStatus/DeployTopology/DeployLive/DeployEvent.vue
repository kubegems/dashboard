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
  <v-flex class="px-2">
    <v-data-table
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.reason`]="{ item }">
        {{ item.reason }}
      </template>
      <template #[`item.type`]="{ item }">
        <v-badge
          v-if="item.count > 1"
          bordered
          :color="$EVENT_STATUS_COLOR[item.type]"
          :content="item.count > 99 ? '99+' : item.count"
          overlap
        >
          <v-chip class="mx-1 white--text" :color="$EVENT_STATUS_COLOR[item.type]" label small>
            <span>{{ item.type }}</span>
          </v-chip>
        </v-badge>
        <v-chip v-else class="mx-1 white--text" :color="$EVENT_STATUS_COLOR[item.type]" label small>
          <span>{{ item.type }}</span>
        </v-chip>
      </template>
      <template #[`item.kind`]="{ item }">
        {{ item.involvedObject.kind }}
      </template>
      <template #[`item.firstAt`]="{ item }">
        {{
          item.firstTimestamp
            ? $moment(item.firstTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
            : item.eventTime
            ? $moment(item.eventTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
            : ''
        }}
      </template>
      <template #[`item.lastAt`]="{ item }">
        {{ item.lastTimestamp ? $moment(item.lastTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
      </template>
      <template #[`item.message`]="{ item }">
        {{ item.message }}
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="eventList"
    />
  </v-flex>
</template>

<script>
  import messages from '../../../../i18n';
  import { getEventList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployEvent',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      resource: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
    computed: {
      headers() {
        return [
          { text: 'Reason', value: 'reason', align: 'start' },
          { text: 'Kind', value: 'kind', align: 'start' },
          { text: this.$t('table.first_trigger_at'), value: 'firstAt', align: 'start', width: 120 },
          { text: this.$t('table.last_trigger_at'), value: 'lastAt', align: 'start', width: 120 },
          { text: this.$root.$t('resource.type'), value: 'type', align: 'start' },
          { text: this.$t('table.message'), value: 'message', align: 'start' },
        ];
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.eventList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async eventList() {
        const data = await getEventList(
          this.ThisCluster,
          this.resource.namespace,
          Object.assign({ topkind: this.resource.kind, topname: this.resource.name }, this.params),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      dispose() {},
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
