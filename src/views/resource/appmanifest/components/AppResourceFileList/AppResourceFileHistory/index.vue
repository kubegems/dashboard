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
  <v-sheet>
    <v-data-table
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.page_size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.hash`]="{ item }">
        {{ item.hash.substr(0, 7) }}
      </template>
      <template #[`item.timestamp`]="{ item }">
        {{ item.timestamp ? $moment(item.timestamp).format('lll') : '' }}
      </template>
      <template #[`item.action`]="{ item }">
        <v-flex :id="`r${item.hash}`" />
        <v-menu :attach="`#r${item.hash}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex>
                <v-btn color="primary" small text @click="diff(item)"> {{ $t('operate.change_content') }} </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" small text @click="rollback(item)"> {{ $t('operate.rollback') }} </v-btn>
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
      @loaddata="appResourceFileHistorys"
    />

    <AppResourceFileDiff ref="appResourceFileDiff" />
  </v-sheet>
</template>

<script>
  import messages from '../../../i18n';
  import AppResourceFileDiff from './AppResourceFileDiff';
  import { getAppResourceFileHistorys, postRollbackAppResourceFile } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppResourceFileHistory',
    i18n: {
      messages: messages,
    },
    components: {
      AppResourceFileDiff,
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
          { text: 'CommitID', value: 'hash', align: 'start' },
          { text: this.$t('table.message'), value: 'message', align: 'start' },
          { text: this.$t('table.author'), value: 'author', align: 'start' },
          { text: this.$t('table.update_at'), value: 'timestamp', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.appResourceFileHistorys();
      });
    },
    methods: {
      async appResourceFileHistorys() {
        const data = await getAppResourceFileHistorys(
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
      diff(item) {
        this.$refs.appResourceFileDiff.init(this.app, item);
        this.$refs.appResourceFileDiff.open();
      },
      rollback(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.rollback'),
          content: { text: this.$t('tip.rollback_tip', [item.hash]), type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await postRollbackAppResourceFile(
              this.app.TenantID,
              this.app.ProjectID,
              this.ThisAppEnvironmentID,
              this.app.name,
              {
                hash: param.item.hash,
              },
            );
            this.$emit('refresh');
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
    },
  };
</script>
