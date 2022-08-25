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
    <ScopeResourceLayout>
      <BaseBreadcrumb flat>
        <template #extend>
          <v-flex class="kubegems__full-right">
            <v-btn class="primary--text" small text @click="addTemplate">
              <v-icon left small> mdi-plus-box </v-icon>
              {{ $root.$t('operate.create_c', [$root.$t('resource.template')]) }}
            </v-btn>
          </v-flex>
        </template>
      </BaseBreadcrumb>

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
        <template #[`item.rule`]="{ item }">
          {{ item.showName }}
        </template>
        <template #[`item.unit`]="{ item }">
          {{ item.unit }}
        </template>
        <template #[`item.label`]="{ item, index }">
          <BaseCollapseChips :id="`p_label_${index}`" :chips="item.labels || []" icon="mdi-label" single-line />
        </template>
        <template #[`item.action`]="{ item, index }">
          <v-flex :id="`r${index}`" />
          <v-menu :attach="`#r${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateTemplate(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeTemplate(item)">
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
        @loaddata="ruleList"
      />
    </ScopeResourceLayout>

    <AddTemplate ref="addTemplate" @refresh="ruleList" />
    <UpdateTemplate ref="updateTemplate" @refresh="ruleList" />
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex';

  import AddTemplate from './components/AddTemplate';
  import ScopeResourceLayout from './components/ScopeResourceLayout';
  import UpdateTemplate from './components/UpdateTemplate';
  import messages from './i18n';
  import { deleteAddRule, getRuleList } from '@/api';

  export default {
    name: 'PrometheusTemplate',
    i18n: {
      messages: messages,
    },
    components: {
      AddTemplate,
      ScopeResourceLayout,
      UpdateTemplate,
    },
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapGetters(['Tenant']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.rule'), value: 'rule', align: 'start' },
          { text: 'Expr', value: 'expr', align: 'start' },
          { text: this.$t('table.unit'), value: 'unit', align: 'start' },
          { text: this.$t('table.label'), value: 'label', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    watch: {
      '$route.query': {
        handler(newValue) {
          if (newValue?.resourceId) {
            this.params.page = 1;
            this.ruleList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async ruleList() {
        const data = await getRuleList(this.Tenant().ID, this.$route.query.resourceId, { ...this.params });
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      addTemplate() {
        if (!this.$route.query.resourceId) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_resource'),
            color: 'warning',
          });
          return;
        }
        this.$refs.addTemplate.open();
      },
      updateTemplate(item) {
        this.$refs.updateTemplate.init(item);
        this.$refs.updateTemplate.open();
      },
      removeTemplate(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.template')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.template')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteAddRule(this.Tenant().ID, param.item.id);
            this.ruleList();
          },
        });
      },
    },
  };
</script>
