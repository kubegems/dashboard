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
      <v-chip-group v-model="messageType" class="ml-2 align-center" column @change="onMessageTypeChange">
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
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
      </template>
      <template #[`item.title`]="{ item }">
        {{ item.Title }}
      </template>
      <template #[`item.messageType`]="{ item }">
        {{ $t(`message.filter.${item.MessageType}`) }}
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="messageList"
    />
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getMessageList } from '@/api';

  export default {
    name: 'MessageBox',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        items: [],
        pageCount: 0,
        messageType: null,
      };
    },
    computed: {
      ...mapState(['JWT', 'User']),
      params() {
        return {
          page: 1,
          size: 20,
          is_read: true,
          message_type:
            this.messageType || this.messageType === 0 ? this.messageTypeItems[this.messageType].value : null,
        };
      },
      headers() {
        return [
          { text: this.$t('message.table.time'), value: 'createdAt', align: 'start', width: 220 },
          { text: this.$t('message.table.message'), value: 'title', align: 'start' },
          { text: this.$t('message.table.type'), value: 'messageType', align: 'end', width: 50 },
          { text: '', value: '', align: 'end', width: 30 },
        ];
      },
      messageTypeItems() {
        return [
          { text: this.$t('message.filter.notify'), color: 'success', value: 'message' },
          { text: this.$t('message.filter.approval'), color: 'primary', value: 'approve' },
          { text: this.$t('message.filter.alert'), color: 'error', value: 'alert' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.messageList();
      }
    },
    methods: {
      onMessageTypeChange() {
        this.messageList();
      },
      async messageList(noprocess = false) {
        const data = await getMessageList(Object.assign(this.params, { noprocessing: noprocess }));
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
    },
  };
</script>
