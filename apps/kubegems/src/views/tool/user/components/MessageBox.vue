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
  <v-card class="pa-2" flat>
    <v-card-title class="pa-0">
      <v-chip-group v-model="messageType" class="ml-2 align-center" column @change="messageTypeChange">
        <v-chip
          v-for="(item, index) in messageTypeItems"
          :key="index"
          class="font-weight-medium"
          :color="item.color"
          label
          :outlined="messageType !== index"
          small
          :text-color="`${messageType !== index ? item.color : 'white'}`"
        >
          {{ item.text }}
        </v-chip>
      </v-chip-group>
    </v-card-title>
    <v-data-table
      calculate-widths
      class="mx-2"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.createdAt="{ item }">
        {{ item.CreatedAt ? moment(item.CreatedAt).format('lll') : '' }}
      </template>
      <template #item.title="{ item }">
        {{ item.Title }}
      </template>
      <template #item.messageType="{ item }">
        {{ i18nLocal.t(`message.filter.${item.MessageType}`) }}
      </template>
    </v-data-table>
    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getMessageList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useMessagePagination } from '@kubegems/api/hooks/message';
  import { Message } from '@kubegems/api/typed/message';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import moment from 'moment';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const headers = [
    { text: i18nLocal.t('message.table.time'), value: 'createdAt', align: 'start', width: 220 },
    { text: i18nLocal.t('message.table.message'), value: 'title', align: 'start' },
    { text: i18nLocal.t('message.table.type'), value: 'messageType', align: 'end', width: 50 },
    { text: '', value: '', align: 'end', width: 30 },
  ];

  const messageType = ref<number>(undefined);
  const messageTypeItems = [
    { text: i18nLocal.t('message.filter.notify'), color: 'success', value: 'message' },
    { text: i18nLocal.t('message.filter.approval'), color: 'primary', value: 'approve' },
    { text: i18nLocal.t('message.filter.alert'), color: 'error', value: 'alert' },
  ];

  let pagination: Pagination<Message> = reactive<Pagination<Message>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getMessageList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Message> = await useMessagePagination(new Message(), params.page, params.size);
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const messageTypeChange = (): void => {
    getMessageList();
  };

  onMounted(() => {
    getMessageList();
  });
</script>
