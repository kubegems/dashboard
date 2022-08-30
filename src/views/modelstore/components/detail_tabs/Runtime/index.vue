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
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="toEnvironmentModelList(item)">
            {{ item.name }}
          </a>
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
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.name}`" />
          <v-menu :attach="`#r${item.name}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="experienceModel(item)">
                    {{ $t('operate.experience') }}
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
        @loaddata="runtimeList"
      />
    </v-card-text>

    <ModelExperience ref="modelExperience" :item="item" />
  </v-card>
</template>

<script>
  import { Base64 } from 'js-base64';

  import messages from '../../../i18n';
  import ModelExperience from './components/ModelExperience';
  import { getModelRuntimeList } from '@/api';

  export default {
    name: 'RuntimeList',
    i18n: {
      messages: messages,
    },
    components: {
      ModelExperience,
    },
    props: {
      item: {
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
          { text: this.$t('table.deploy_instance'), value: 'name', align: 'start' },
          { text: this.$t('table.model_version'), value: 'modelVersion', align: 'start' },
          { text: this.$t('table.status'), value: 'phase', align: 'start' },
          { text: this.$root.$t('resource.cluster'), value: 'cluster', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.creator'), value: 'creator', align: 'start' },
          { text: 'Api', value: 'url', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20, sortable: false },
        ];
      },
    },
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
      experienceModel(item) {
        this.$refs.modelExperience.init(item);
        this.$refs.modelExperience.open();
      },
    },
  };
</script>
