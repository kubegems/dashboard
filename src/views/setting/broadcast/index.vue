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
                <v-btn color="primary" text @click="addBroadcast">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$t('resource.broadcast')]) }}
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
        <template #[`item.startAt`]="{ item }">
          {{ item.startAt ? $moment(item.startAt).format('lll') : '' }}
        </template>
        <template #[`item.endAt`]="{ item }">
          {{ item.endAt ? $moment(item.endAt).format('lll') : '' }}
        </template>
        <template #[`item.expried`]="{ item }">
          {{ $moment(item.endAt).format('lll') > new Date() ? $t('status.expried') : $t('status.active') }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.id}`" />
          <v-menu :attach="`#r${item.id}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateBroadcast(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeBroadcast(item)">
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
        @loaddata="broadcastList"
      />
    </v-card>

    <AddBroadcast ref="addBroadcast" @refresh="broadcastList" />
    <UpdateBroadcast ref="updateBroadcast" @refresh="broadcastList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddBroadcast from './components/AddBroadcast';
  import UpdateBroadcast from './components/UpdateBroadcast';
  import messages from './i18n';
  import { deleteBroadcast, getBroadcastlist } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'Broadcast',
    i18n: {
      messages: messages,
    },
    components: {
      AddBroadcast,
      UpdateBroadcast,
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
          { text: this.$t('table.message'), value: 'message', align: 'start' },
          { text: this.$t('table.type'), value: 'type', align: 'start' },
          { text: this.$t('table.start_at'), value: 'startAt', align: 'start' },
          { text: this.$t('table.end_at'), value: 'endAt', align: 'start' },
          { text: this.$t('table.expried'), value: 'expried', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        Object.assign(this.params, convertStrToNum(this.$route.query));
        this.broadcastList();
      }
    },
    methods: {
      async broadcastList() {
        const data = await getBroadcastlist(this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      removeBroadcast(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('resource.broadcast')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('resource.broadcast')])}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteBroadcast(param.item.id);
            this.broadcastList();
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
      addBroadcast() {
        this.$refs.addBroadcast.open();
      },
      updateBroadcast(item) {
        this.$refs.updateBroadcast.init(item);
        this.$refs.updateBroadcast.open();
      },
    },
  };
</script>
