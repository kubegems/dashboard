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
  <v-card>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.name`]="{ item }">
          {{ item.metadata.name }}
        </template>
        <template #[`item.status`]="{ item }">
          <span v-if="item.status.succeeded !== undefined">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ $t('status.success') }}
          </span>
          <span v-else-if="item.status.failed !== undefined">
            <v-icon color="error" small> mdi-minus-circle </v-icon>
            {{ $t('status.failed') }}
          </span>
          <span v-else-if="item.status.active !== undefined">
            <v-icon color="success" small> mdi-record-circle-outline </v-icon>
            {{ $t('status.running') }}
          </span>
        </template>
        <template #[`item.startAt`]="{ item }">
          {{ item.status.startTime ? $moment(item.status.startTime).format('lll') : '' }}
        </template>
        <template #[`item.endAt`]="{ item }">
          {{ item.status.completionTime ? $moment(item.status.completionTime).format('lll') : '' }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="jobList"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { getJobList } from '@kubegems/api/direct';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { convertResponse2Pagination } from '@kubegems/api/utils';

  export default {
    name: 'JobList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
          noprocessing: true,
        },
      };
    },
    computed: {
      ...mapState(['JWT']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start' },
          { text: this.$t('table.start_at'), value: 'startAt', align: 'start' },
          { text: this.$t('table.end_at'), value: 'endAt', align: 'start' },
        ];
      },
    },
    mounted() {
      this.$nextTick(() => {
        Object.assign(this.params, this.$route.query);
        this.jobList();
      });
    },
    methods: {
      async jobList() {
        const data = await getJobList(
          this.ThisCluster,
          this.$route.query.namespace,
          Object.assign(this.params, {
            topkind: 'CronJob',
            topname: this.item ? this.item.metadata.name : this.$route.params.name,
          }),
        );
        const pagination = convertResponse2Pagination(data);
        this.items = pagination.items;
        this.pageCount = pagination.pageCount;
        this.params.page = pagination.page;
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
