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
  <BaseFullScreenDialog v-model="visible" icon="mdi-note-text" title="日志上下文" @dispose="handleDispose">
    <template #content>
      <v-card class="log-context" flat>
        <div class="text-center py-3">
          <v-btn color="primary" :loading="loading.preview" text x-small @click="handleLoadPreview">
            {{ $t('operate.prev_10') }}
          </v-btn>
        </div>

        <LogTable :items="items.preview" mode="context" />

        <LogTable highlight :items="items.current" mode="context" />

        <LogTable :items="items.next" mode="context" />

        <div class="text-center py-3">
          <v-btn color="primary" :loading="loading.next" text x-small @click="handleLoadNext">
            {{ $t('operate.next_10') }}
          </v-btn>
        </div>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import messages from '../../i18n';
  import LogTable from './LogTable';
  import { getLogContext } from '@/api';

  export default {
    name: 'LogContext',
    i18n: {
      messages: messages,
    },
    components: {
      LogTable,
    },
    data() {
      return {
        visible: false,
        items: {
          current: [],
          preview: [],
          next: [],
        },
        loading: {
          next: false,
          preview: false,
        },
        params: {},
      };
    },
    methods: {
      showContext(item, params) {
        this.visible = true;
        this.items.current = [
          {
            message: item.info.message,
            timestamp: item.info.timestamp,
            level: item.info.level,
          },
        ];
        this.params = params;
        this.handleLoadPreview();
        this.handleLoadNext();
      },
      async getLogContext(startTime, endTime, direction) {
        const params = {
          ClusterID: this.params.ClusterID,
          ClusterName: this.params.ClusterName,
          query: this.params.query,
          start: startTime,
          end: endTime,
          limit: 11,
          noprocessing: true,
          direction: direction,
        };
        const data = await getLogContext(this.params.ClusterName, params);
        data.sort((a, b) => a.timestamp - b.timestamp);
        return await data;
      },
      async handleLoadPreview() {
        this.loading.preview = true;
        const timestamp = (
          this.items.preview.length ? this.items.preview[0].timestamp : this.params.timestamp
        ).toString();
        const start = new Date(parseInt(timestamp.substr(0, 13)) - 1000 * 60 * 60 * 3).getTime() + '000000';
        const end = parseInt(timestamp).toString();
        const data = await this.getLogContext(start, end, 'backward');
        data.shift();
        this.items.preview = [...data, ...this.items.preview];
        this.loading.preview = false;
      },
      async handleLoadNext() {
        this.loading.next = true;
        const timestamp = (
          this.items.next.length ? this.items.next[this.items.next.length - 1].timestamp : this.params.timestamp
        ).toString();
        const start = parseInt(timestamp).toString();
        const end = new Date(parseInt(timestamp.substr(0, 13)) + 1000 * 60 * 60 * 3).getTime() + '000000';
        const data = await this.getLogContext(start, end, 'forward');
        data.shift();
        this.items.next = [...this.items.next, ...data];
        this.loading.next = false;
      },
      handleDispose() {
        this.items.current = [];
        this.items.preview = [];
        this.items.next = [];
        this.loading.preview = false;
        this.loading.next = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-context {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;

    &::-webkit-scrollbar {
      display: block !important;
    }
    &::-webkit-scrollbar-thumb {
      width: 10px;
      border-radius: 5px;
      background: grey;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }
    &::-webkit-scrollbar:vertical {
      width: 10px;
    }
  }
</style>
