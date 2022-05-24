<template>
  <div
    id="log-table"
    class="log-table"
    @click="handleTableClickProxy"
  >
    <v-data-table
      disable-sort
      :headers="headers"
      :items="items"
      :loading="loading"
      hide-default-header
      hide-default-footer
      disable-pagination
      single-expand
      dense
      :show-expand="mode === 'normal'"
      :item-key="mode === 'context' ? 'info.timestamp' : 'info.index'"
      :no-data-text="mode === 'context' ? '' : '暂无数据'"
      loading-text="接收数据中..."
    >
      <template #[`item.info`]="{ item }">
        <div
          v-if="mode === 'normal'"
          :class="`log-table__item log-table__item--${item.info.level}`"
          :style="item.info.animation"
        >
          <span
            v-if="timestamp"
            class="success--text log-table__timestamp"
          >{{ item.info.timestampstr }}</span>
          <span
            class="v-chip v-size--small log-table__pod"
            :data-pod="item.stream.pod"
          >
            {{ item.stream.pod }}
          </span>
          <span v-html="item.info.message" />
        </div>
        <div
          v-else
          :class="`log-table__item log-table__item--${item.level}`"
        >
          <span
            class="success--text log-table__timestamp"
          >
            {{ $moment(parseInt(item.timestamp.substr(0, 13))).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span
            :class="`log-table__level--${item.level} white--text log-table__level pa-1 mr-2`"
          >
            {{ item.level }}
          </span>
          <span
            :class="{ 'log-table__highlight': highlight }"
            v-html="item.message"
          />
        </div>
        <v-btn
          v-if="context && mode === 'normal'"
          text
          x-small
          color="primary"
          @click.stop="handleShowContext(item)"
        >
          显示上下文
        </v-btn>
      </template>
      <template #expanded-item="{ headers, item }">
        <td
          :colspan="headers.length"
          class="pa-4"
        >
          <pre class="log-table__pre">{{ item.stream }}</pre>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'LogTable',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    timestamp: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'normal',
      validator: v => ['normal', 'context'].includes(v),
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {

    }
  },
  computed: {
    headers () {
      if (this.mode === 'normal') {
        return [
          { text: '', value: 'info', align: 'start' },
          { text: '', value: 'data-table-expand', align: 'end' },
        ]
      } else {
        return [
          { text: '', value: 'info', align: 'start' },
        ]
      }
    },
  },
  methods: {
    handleShowContext (item) {
      this.$emit('showContext', item)
    },

    // 表格点击代理
    handleTableClickProxy(e) {
      if (this.mode !== 'normal') return

      // 查询pod标签
      if (e.target.dataset.pod) {
        this.$emit('clickPod', e.target.dataset.pod)
        // this.$refs.logLabelFilter.setLabelValue('pod', e.target.dataset.pod) && this.logQueryRange()
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    goTo() {

    },
  },
}
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

  &__pre {
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__highlight {
    color: #1976d2;
    font-weight: 600;
  }
}
</style>
