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
  <div id="log-table" class="log-table" @click="handleTableClickProxy">
    <v-data-table
      :class="mode === 'context' ? 'log-table__data' : ''"
      dense
      disable-pagination
      disable-sort
      :headers="headers"
      hide-default-footer
      hide-default-header
      :item-key="mode === 'context' ? 'info.timestamp' : 'info.index'"
      :items="items"
      :loading="loading"
      :loading-text="$t('tip.loading')"
      :no-data-text="mode === 'context' ? '' : $root.$t('data.no_data')"
      :show-expand="mode === 'normal'"
      single-expand
      :style="{ maxHeight: `${height}px`, overflowY: 'auto' }"
    >
      <template #[`item.info`]="{ item }">
        <div
          v-if="mode === 'normal'"
          :class="`log-table__item log-table__item--${item.info.level}`"
          :style="item.info.animation"
        >
          <span v-if="timestamp" class="success--text log-table__timestamp">
            {{ item.info.timestampstr }}
          </span>
          <span class="v-chip v-size--small log-table__pod" :data-pod="item.stream.pod">
            <v-btn class="log-table__btn" icon small @click="showPodMonitor(item)">
              <v-icon small>mdi-chart-areaspline</v-icon>
            </v-btn>
            {{ item.stream.pod }}
          </span>
          <span v-html="item.info.message" />
        </div>
        <div v-else :class="`log-table__item log-table__item--${item.level}`">
          <span class="success--text log-table__timestamp">
            {{ $moment(parseInt(item.timestamp.substr(0, 13))).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span :class="`log-table__level--${item.level} white--text log-table__level pa-1 mr-2`">
            {{ item.level }}
          </span>
          <span :class="{ 'log-table__highlight': highlight }" v-html="item.message" />
        </div>
        <v-btn v-if="context && mode === 'normal'" color="primary" text x-small @click.stop="handleShowContext(item)">
          {{ $t('operate.show_context') }}
        </v-btn>
      </template>
      <template #expanded-item="{ headers, item }">
        <td class="pa-4" :colspan="headers.length">
          <pre class="log-table__pre">{{ item.stream }}</pre>
        </td>
      </template>
    </v-data-table>

    <LogPodMonitor ref="logPodMonitor" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import LogPodMonitor from './LogPodMonitor';

  export default {
    name: 'LogTable',
    i18n: {
      messages: messages,
    },
    components: {
      LogPodMonitor,
    },
    props: {
      context: {
        type: Boolean,
        default: false,
      },
      highlight: {
        type: Boolean,
        default: false,
      },
      items: {
        type: Array,
        default: () => [],
      },
      loading: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        default: 'normal',
        validator: (v) => ['normal', 'context'].includes(v),
      },
      timestamp: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {};
    },
    computed: {
      ...mapState(['Scale']),
      headers() {
        if (this.mode === 'normal') {
          return [
            { text: '', value: 'info', align: 'start' },
            { text: '', value: 'data-table-expand', align: 'end' },
          ];
        } else {
          return [{ text: '', value: 'info', align: 'start' }];
        }
      },
      height() {
        return parseInt((window.innerHeight - 320) / this.Scale);
      },
    },
    methods: {
      handleShowContext(item) {
        this.$emit('showContext', item);
      },
      // 表格点击代理
      handleTableClickProxy(e) {
        if (this.mode !== 'normal') return;
        // 查询pod标签
        if (e.target.dataset.pod) {
          this.$emit('clickPod', e.target.dataset.pod);
          // this.$refs.logLabelFilter.setLabelValue('pod', e.target.dataset.pod) && this.logQueryRange()
        }
      },
      showPodMonitor(item) {
        this.$refs.logPodMonitor.init({
          timestamp: item.timestamp,
          cluster: item.stream?.cluster,
          namespace: item.stream?.namespace,
          pod: item.stream?.pod,
        });
        this.$refs.logPodMonitor.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-table {
    &__item {
      font-size: 13px;
      font-weight: normal;
      padding: 4px 8px;
      line-height: 1.2;
      word-break: break-all;
      min-height: 0;

      &--warn {
        border-left: 3px solid #fb8c00;
      }
      &--info {
        border-left: 3px solid #00bcd4;
      }
      &--debug {
        border-left: 3px solid #1e88e5;
      }
      &--error {
        border-left: 3px solid #ff5252;
      }
      &--unknown {
        border-left: 3px solid #607d8b;
      }
    }

    &__timestamp {
      display: inline-block;
      white-space: nowrap;
      width: 164px;
      font-weight: 600;
    }

    &__level {
      display: inline-block;
      white-space: nowrap;
      width: 70px;
      font-weight: 600;
      text-align: center;
      border-radius: 3px;

      &--warn {
        background-color: #fb8c00;
      }
      &--info {
        background-color: #00bcd4;
      }
      &--debug {
        background-color: #1e88e5;
      }
      &--error {
        background-color: #ff5252;
      }
      &--unknown {
        background-color: #607d8b;
      }
    }

    &__pod {
      cursor: pointer;
      background-color: rgba($primary, 0.3);
      margin-right: 8px;
      margin-top: -2px;
      padding: 0 8px;
      color: #000000;
    }

    &__btn {
      color: rgba($primary, 0.3);
    }

    &__pre {
      white-space: pre-wrap;
      word-break: break-all;
    }

    &__highlight {
      color: #1976d2;
      font-weight: 600;
    }

    &__data {
      max-height: none !important;
      overflow-y: auto !important;
    }
  }
</style>
