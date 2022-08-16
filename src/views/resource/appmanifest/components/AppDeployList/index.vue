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
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.images`]="{ item }">
        <v-flex v-for="(image, index) in item.images" :key="index">
          {{ image }}
        </v-flex>
      </template>
      <template #[`item.gitVersion`]="{ item }">
        {{ item.gitVersion.substr(0, 7) }}
      </template>
      <template #[`item.publisher`]="{ item }">
        {{ item.publisher.indexOf(' ') > -1 ? item.publisher.split(' ')[0] : item.publisher }}
      </template>
      <template #[`item.publishAt`]="{ item }">
        {{ item.publishAt ? $moment(item.publishAt).format('lll') : '' }}
      </template>
      <template #[`item.status`]="{ item }">
        {{ item.status }}
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
              <v-flex v-if="item.images">
                <v-btn color="primary" small text @click="appDeployImageTrace(item)">
                  {{ $t('operate.image_trace') }}
                </v-btn>
              </v-flex>
              <v-flex v-else> {{ $t('tip.no_operate') }} </v-flex>
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
      @loaddata="deployEnvironmentAppsStatus"
    />

    <AppDeployImageTrace ref="appDeployImageTrace" />
  </v-card>
</template>

<script>
  import messages from '../../i18n';
  import AppDeployImageTrace from './AppDeployImageTrace';
  import { getDeployEnvironmentAppsStatus } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppDeployList',
    i18n: {
      messages: messages,
    },
    components: {
      AppDeployImageTrace,
    },
    mixins: [BaseResource],
    props: {
      app: {
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
          { text: this.$t('table.task'), value: 'id', align: 'start' },
          { text: this.$t('table.image_version'), value: 'images', align: 'start' },
          { text: this.$t('table.git_version'), value: 'gitVersion', align: 'start' },
          { text: this.$root.$t('resource.environment'), value: 'environment', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start' },
          { text: this.$t('table.publisher'), value: 'publisher', align: 'start' },
          { text: this.$t('table.publish_at'), value: 'publishAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    watch: {
      app() {
        this.deployEnvironmentAppsStatus();
      },
    },
    mounted() {
      if (this.app) {
        this.deployEnvironmentAppsStatus();
      }
    },
    methods: {
      async deployEnvironmentAppsStatus() {
        const data = await getDeployEnvironmentAppsStatus(
          this.app.TenantID,
          this.app.ProjectID,
          this.ThisAppEnvironmentID,
          this.app.name,
          this.params,
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      appDeployImageTrace(item) {
        this.$refs.appDeployImageTrace.init(this.app, item);
        this.$refs.appDeployImageTrace.open();
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
