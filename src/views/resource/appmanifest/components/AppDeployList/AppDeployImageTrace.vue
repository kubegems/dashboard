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
  <BasePanel
    v-model="panel"
    icon="mdi-selection-search"
    :title="$t('tip.image_trace')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="primary--text ml-2 text-subtitle-2">
        {{ item ? item.ImageName : '' }}
      </span>
    </template>
    <template #content>
      <v-card-text class="mt-1 py-0 px-2">
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
          <template #[`item.publisher`]="{ item }">
            {{ item.publisher.indexOf(' ') > -1 ? item.publisher.split(' ')[0] : item.publisher }}
          </template>
          <template #[`item.publishAt`]="{ item }">
            {{ item.publishAt ? $moment(item.publishAt).format('lll') : '' }}
          </template>
          <template #[`item.dev`]="{ item }">
            <v-icon v-if="item.type === 'dev'" color="primary" small> mdi-check </v-icon>
          </template>
          <template #[`item.test`]="{ item }">
            <v-icon v-if="item.type === 'test'" color="primary" small> mdi-check </v-icon>
          </template>
          <template #[`item.prod`]="{ item }">
            <v-icon v-if="item.type === 'prod'" color="primary" small> mdi-check </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import { getDeployEnvironmentAppImageTrace } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppDeployImageTrace',
    i18n: {
      messages: messages,
    },
    data: () => ({
      panel: false,
      item: null,
      items: [],
      app: null,
      pageCount: 0,
      params: {
        page: 1,
        size: 1000,
      },
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      height() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
      headers() {
        return [
          { text: this.$t('table.publish_at'), value: 'publishAt', align: 'start' },
          { text: this.$t('table.task'), value: 'id', align: 'start' },
          { text: this.$t('table.publisher'), value: 'publisher', align: 'start' },
          { text: this.$t('table.image'), value: 'image', align: 'start', width: 300 },
          { text: this.$t('table.dev'), value: 'dev', align: 'start' },
          { text: this.$t('table.test'), value: 'test', align: 'start' },
          { text: this.$t('table.production'), value: 'prod', align: 'start' },
        ];
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(app, item) {
        this.item = deepCopy(item);
        this.app = deepCopy(app);
        this.deployEnvironmentAppImageTrace();
      },
      async deployEnvironmentAppImageTrace() {
        const data = await getDeployEnvironmentAppImageTrace(
          this.app.TenantID,
          this.app.ProjectID,
          this.ThisAppEnvironmentID,
          this.app.name,
          Object.assign(this.params, {
            image: this.item.images[0],
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      dispose() {
        this.items = [];
      },
    },
  };
</script>
