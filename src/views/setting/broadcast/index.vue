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
                  {{ i18n.t('operate.create_c', [i18nLocal.t('resource.broadcast')]) }}
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
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.startAt="{ item }">
          {{ item.startAt ? moment(item.startAt).format('lll') : '' }}
        </template>
        <template #item.endAt="{ item }">
          {{ item.endAt ? moment(item.endAt).format('lll') : '' }}
        </template>
        <template #item.expried="{ item }">
          {{ moment(item.endAt) < moment() ? i18nLocal.t('status.expried') : i18nLocal.t('status.active') }}
        </template>
        <template #item.action="{ item }">
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
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeBroadcast(item)">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getBroadcastList"
      />
    </v-card>

    <BroadcastForm ref="broadcast" @refresh="getBroadcastList" />
  </v-container>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onMounted, reactive, ref } from 'vue';

  import BroadcastForm from './components/BroadcastForm.vue';
  import { useI18n } from './i18n';
  import { useBroadcastPagination } from '@/composition/broadcast';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Broadcast } from '@/types/broadcast';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.message'), value: 'message', align: 'start' },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start' },
    { text: i18nLocal.t('table.start_at'), value: 'startAt', align: 'start' },
    { text: i18nLocal.t('table.end_at'), value: 'endAt', align: 'start' },
    { text: i18nLocal.t('table.expried'), value: 'expried', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Broadcast> = reactive<Pagination<Broadcast>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getBroadcastList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Broadcast> = await useBroadcastPagination(new Broadcast(), params.page, params.size);
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  onMounted(() => {
    getBroadcastList();
  });

  const removeBroadcast = (item: Broadcast): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.broadcast')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.broadcast')])}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Broadcast(param.item).deleteBroadcast();
        getBroadcastList();
      },
    });
  };

  const broadcast = ref(null);
  const addBroadcast = (): void => {
    broadcast.value.open();
  };

  const updateBroadcast = (item: Broadcast): void => {
    broadcast.value.init(item);
    broadcast.value.open();
  };
</script>
