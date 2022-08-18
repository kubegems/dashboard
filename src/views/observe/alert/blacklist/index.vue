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
  <v-container class="alert-history" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ProjectEnvSelectCascade v-model="env" first reverse :tenant="tenant" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card class="mt-3 pa-4" flat>
      <v-data-table
        class="kubegems__table-row-pointer"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="Fingerprint"
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
        show-expand
        single-expand
        @click:row="onRowClick"
      >
        <template #[`item.summary`]="{ item }">
          {{ item.Summary }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.Namespace }}
        </template>
        <template #[`item.fingerprint`]="{ item }">
          {{ item.Fingerprint }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.SilenceCreator }}
        </template>
        <template #[`item.silenceEndsAt`]="{ item }">
          {{ item.SilenceEndsAt ? $moment(item.SilenceEndsAt).format('yyyy/MM/DD hh:mm:ss') : $t('tip.forever') }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="pa-4" :colspan="headers.length">
            <pre class="pre">{{ item.Labels }}</pre>
          </td>
        </template>
        <template #[`item.action`]="{ item }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2" flat>
              <v-btn color="primary" small text @click.stop="onRemoveBlack(item)">
                {{ $t('operate.remove_blacklist') }}
              </v-btn>
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
        @loaddata="getBlackList"
      />
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { deletePrometheusBlacklist, getPrometheusBlackList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deleteEmpty } from '@/utils/helpers';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'AlertHistroy',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    data() {
      return {
        items: [],
        pageCount: 0,
        tenant: null,
        params: {
          cluster: '',
          namespace: '',
          page: 1,
          size: 10,
        },
        env: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.summary'), value: 'summary', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.fingerprint'), value: 'fingerprint', align: 'start' },
          { text: this.$t('table.creator'), value: 'silenceCreator', align: 'start' },
          { text: this.$t('table.expired_at'), value: 'silenceEndsAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
          { text: '', value: 'data-table-expand', align: 'end' },
        ];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.params.cluster = newValue.clusterName;
            this.params.namespace = newValue.namespace;
            this.getBlackList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.tenant = this.Tenant();
      });
    },
    methods: {
      async getBlackList() {
        const params = deleteEmpty({ ...this.params });
        const data = await getPrometheusBlackList(params);
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.items = data.List || [];
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onRemoveBlack(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.remove_blacklist'),
          content: {
            text: this.$t('tip.confirm_remove_blacklist'),
            type: 'confirm',
          },
          doFunc: async () => {
            await deletePrometheusBlacklist(item.Fingerprint);
            this.getBlackList();
          },
        });
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
