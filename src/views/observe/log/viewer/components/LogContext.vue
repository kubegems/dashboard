<template>
  <BaseFullScreenDialog
    v-model="panel"
    title="日志上下文"
    icon="mdi-note-text"
    @dispose="dispose"
  >
    <template #content>
      <v-card
        id="log-context"
        :style="`height: ${height}px; overflow: auto;`"
      >
        <v-card-title class="pa-1">
          <v-spacer />
          <v-btn
            text
            x-small
            :loading="loadingPreview"
            color="primary"
            @click="loadPreview"
          >
            向前加载10条数据
          </v-btn>
          <v-spacer />
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="itemsPreview"
          loading-text="载入中..."
          item-key="info.timestamp"
          disable-pagination
          hide-default-header
          hide-default-footer
          no-data-text="暂无数据"
          dense
        >
          <template #[`item.info`]="{ item }">
            <div
              :class="'v-list-item-html v-list-item-' + item.level"
              v-html="item.message"
            />
          </template>
        </v-data-table>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="items"
          item-key="info.timestamp"
          disable-pagination
          hide-default-header
          hide-default-footer
          no-data-text="无数据"
          dense
        >
          <template #[`item.info`]="{ item }">
            <div
              :class="'v-list-item-html v-list-item-' + item.level"
              style="color: #1976d2 !important;"
              v-html="item.message"
            />
          </template>
        </v-data-table>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="itemsNext"
          loading-text="载入中..."
          item-key="info.timestamp"
          disable-pagination
          hide-default-header
          hide-default-footer
          no-data-text="暂无数据"
          dense
        >
          <template #[`item.info`]="{ item }">
            <div
              :class="'v-list-item-html v-list-item-' + item.level"
              v-html="item.message"
            />
          </template>
        </v-data-table>
        <v-card-title class="pa-1">
          <v-spacer />
          <v-btn
            text
            x-small
            :loading="loadingNext"
            color="primary"
            @click="loadNext"
          >
            向后加载10条数据
          </v-btn>
          <v-spacer />
        </v-card-title>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getLogContext } from '@/api'

export default {
  name: 'LogViewerContext',
  props: {
    currentCluster: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    timestamp: '',
    logQL: '',
    panel: false,
    loadingPreview: false,
    loadingNext: false,
    itemsPreview: [],
    itemsNext: [],
    items: [],
    headers: [{ text: '', value: 'info', align: 'start' }],
  }),
  computed: {
    ...mapState(['Scale']),
    height() {
      return (window.innerHeight - 64) / this.Scale
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    async logContext(getdata) {
      const data = await getLogContext(
        getdata.ClusterName,
        Object.assign(getdata, { noprocessing: true }),
      )
      if (getdata.direction === 'backward') {
        data.sort((a, b) => {
          return a.timestamp - b.timestamp
        })
        if (getdata.append) {
          data.reverse()
          this.itemsPreview.reverse()
          data.forEach((item) => {
            this.itemsPreview.push(item)
          })
          this.itemsPreview.reverse()
        } else {
          this.itemsPreview = data
        }
      } else if (getdata.direction === 'forward') {
        data.sort((a, b) => {
          return a.timestamp - b.timestamp
        })
        if (getdata.append) {
          data.forEach((item) => {
            this.itemsNext.push(item)
          })
        } else {
          this.itemsNext = data
        }
      }
    },
    async loadPreview() {
      this.loadingPreview = true
      let timestamp = (' ' + this.timestamp).slice(1)
      if (this.itemsPreview.length > 0) {
        timestamp = (' ' + this.itemsPreview[0].timestamp).slice(1)
      }
      const previewStart =
        Date.parse(
          new Date(
            new Date(parseInt(timestamp.substr(0, 13))).setHours(
              new Date(parseInt(timestamp.substr(0, 13))).getHours() - 3,
            ),
          ),
        ) + '000000'
      const previewEnd = (parseInt(timestamp) - 100000).toString()
      await this.logContext({
        ClusterID: this.currentCluster.value,
        ClusterName: this.currentCluster.text,
        query: this.logQL,
        direction: 'backward',
        start: previewStart,
        end: previewEnd,
        append: true,
        limit: 20,
      })
      this.loadingPreview = false
    },
    async loadNext() {
      this.loadingNext = true
      let timestamp = (' ' + this.timestamp).slice(1)
      if (this.itemsNext.length > 0) {
        timestamp = (
          ' ' + this.itemsNext[this.itemsNext.length - 1].timestamp
        ).slice(1)
      }
      const nextStart = (parseInt(timestamp) + 100000).toString()
      const nextEnd =
        Date.parse(
          new Date(
            new Date(parseInt(timestamp.substr(0, 13))).setHours(
              new Date(parseInt(timestamp.substr(0, 13))).getHours() + 3,
            ),
          ),
        ) + '000000'
      await this.logContext({
        ClusterID: this.currentCluster.value,
        ClusterName: this.currentCluster.text,
        query: this.logQL,
        direction: 'forward',
        start: nextStart,
        end: nextEnd,
        append: true,
        limit: 20,
      })
      this.loadingNext = false
    },
    dispose() {
      this.itemsPreview = []
      this.itemsNext = []
    },
  },
}
</script>

<style lang="scss" scoped>
.v-list-item-html {
  font-size: 13px;
  font-weight: normal;
  padding: 1px 10px;
  margin: 2px 0;
  line-height: 1.2 !important;
  word-break: break-all;
  min-height: 0 !important;
}
.v-list-item-warn {
  border-left: 3px solid #fb8c00 !important;
}
.v-list-item-info {
  border-left: 3px solid #00bcd4 !important;
}
.v-list-item-debug {
  border-left: 3px solid #1e88e5 !important;
}
.v-list-item-error {
  border-left: 3px solid #ff5252 !important;
}
.v-list-item-unknown {
  border-left: 3px solid #607d8b !important;
}
.v-list--dense .v-list-item,
.v-list-item--dense {
  min-height: 0 !important;
}

#log-context::-webkit-scrollbar {
  display: block !important;
}
#log-context::-webkit-scrollbar-thumb {
  width: 10px;
  border-radius: 5px;
  background: grey;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
#log-context::-webkit-scrollbar:vertical {
  width: 10px;
}
</style>
