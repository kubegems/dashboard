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
  <BaseFullScreenDialog v-model="visible" icon="mdi-note-text" :title="$t('tip.log_context')" @dispose="handleDispose">
    <template #content>
      <v-card id="log__context" class="log-context" flat>
        <div v-scroll:#log__context="$_.debounce(onScroll, 50)">
          <div v-if="loading.preview" class="text-center py-3 log-context__loading">
            <BaseDropProgress />
          </div>

          <div id="log__pre" class="my-3" />

          <LogTable :items="items.preview" mode="context" />

          <LogTable id="log__target" highlight :items="items.current" mode="context" />

          <LogTable :items="items.next" mode="context" />

          <div v-if="loading.next" class="text-center py-3 log-context__loading">
            <BaseDropProgress />
          </div>
        </div>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { sleep } from '@kubegems/libs/utils/helpers';

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
      async getLogContext(startTime, endTime, direction, limit = 10) {
        const params = {
          ClusterID: this.params.ClusterID,
          ClusterName: this.params.ClusterName,
          query: this.params.query,
          start: startTime,
          end: endTime,
          limit: limit,
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
        const data = await this.getLogContext(start, end, 'backward', 20);
        if (!this.items.preview.length) data.pop();
        const uniqueArray = Array.from(
          new Set(
            [...data, ...this.items.preview].map((d) => {
              return JSON.stringify(d);
            }),
          ),
        );
        this.items.preview = uniqueArray.map((d) => {
          return JSON.parse(d);
        });
        this.loading.preview = false;
        await sleep(200);
        document.getElementById('log__context').scrollTo({
          top: 350,
          behavior: 'smooth',
        });
      },
      async handleLoadNext() {
        this.loading.next = true;
        const timestamp = (
          this.items.next.length ? this.items.next[this.items.next.length - 1].timestamp : this.params.timestamp
        ).toString();
        const start = parseInt(timestamp).toString();
        const end = new Date(parseInt(timestamp.substr(0, 13)) + 1000 * 60 * 60 * 3).getTime() + '000000';
        const data = await this.getLogContext(start, end, 'forward', 20);
        const uniqueArray = Array.from(
          new Set(
            [...this.items.next, ...data].map((d) => {
              return JSON.stringify(d);
            }),
          ),
        );
        this.items.next = uniqueArray.map((d) => {
          return JSON.parse(d);
        });
        this.loading.next = false;
      },
      handleDispose() {
        this.items.current = [];
        this.items.preview = [];
        this.items.next = [];
        this.loading.preview = false;
        this.loading.next = false;
      },
      async onScroll(e) {
        if (e.target.scrollTop + document.getElementById('log__context').clientHeight >= e.target.scrollHeight - 1) {
          await this.handleLoadNext();
        } else if (e.target.scrollTop === 0) {
          await this.handleLoadPreview();
        }
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
    padding: 8px;

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

    &__loading {
      position: relative;
      height: 70px;
    }
  }
</style>
