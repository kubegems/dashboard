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
      :height="height"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.kind`]="{ item }">
        {{ item.kind }}
      </template>
      <template #[`item.namespace`]="{ item }">
        {{ item.namespace }}
      </template>
      <template #[`item.name`]="{ item }">
        {{ item.name }}
      </template>
      <template #[`item.status`]="{ item }">
        {{ item.status }}
      </template>
      <template #[`item.message`]="{ item }">
        {{ item.message }}
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployResult',
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
      params: {
        page: 1,
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 64 - 45) / this.Scale);
      },
      headers() {
        return [
          { text: 'Kind', value: 'kind', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start' },
          { text: this.$t('table.message'), value: 'message', align: 'start', width: 350 },
        ];
      },
    },
    watch: {
      resource: {
        handler: function () {
          if (this.resource) {
            this.resultList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async resultList() {
        const data = this.resource?.liveState?.status?.operationState?.syncResult?.resources || [];
        this.items = data;
      },
      dispose() {},
    },
  };
</script>
