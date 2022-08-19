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
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.template_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addMonitorDashboardTemplate">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.monitor_template')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
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
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="monitorTemplateDetail(item)">
            {{ item.name }}
          </a>
        </template>
        <template #[`item.graphCount`]="{ item }">
          {{ item.graphs.length }}
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
                  <v-btn color="error" small text @click="removeMonitorDashboardTemplate(item)">
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
        @loaddata="monitorTemplateList"
      />
    </v-card>

    <AddMonitorTemplate ref="addMonitorTemplate" @refresh="monitorTemplateList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddMonitorTemplate from './components/AddMonitorTemplate';
  import messages from './i18n';
  import { deleteMonitorDashboardTemplate, getMonitorDashboardTemplate } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'MonitorTemplate',
    i18n: {
      messages: messages,
    },
    components: {
      AddMonitorTemplate,
    },
    mixins: [BaseFilter],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.description'), value: 'description', align: 'start' },
          { text: this.$t('table.refresh'), value: 'refresh', align: 'start' },
          { text: this.$t('table.graph_count'), value: 'graphCount', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
      filters() {
        return [{ text: this.$t('filter.template_name'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        Object.assign(this.params, convertStrToNum(this.$route.query));
        this.monitorTemplateList();
      }
    },
    methods: {
      async monitorTemplateList() {
        const data = await getMonitorDashboardTemplate(this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      removeMonitorDashboardTemplate(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.monitor_template')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.monitor_template')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteMonitorDashboardTemplate(param.item.ID);
            this.monitorTemplateList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      monitorTemplateDetail(item) {
        this.$router.push({
          name: 'monitor-template-detail',
          params: {
            name: item.name,
          },
        });
      },
      addMonitorDashboardTemplate() {
        this.$refs.addMonitorTemplate.open();
      },
    },
  };
</script>
