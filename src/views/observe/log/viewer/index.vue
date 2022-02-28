<template>
  <v-container
    id="log-viewer"
    fluid
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <div class="d-flex justify-space-between pa-3">
        <ClusterSelect
          v-model="cluster"
          auto-select-first
          object-value
          :badge-values="clusterBadge"
          mode="badge"
          @change="onClusterChange"
        />
        <BaseDatetimePicker2
          ref="dateRangePicker"
          v-model="date"
          :default-value="30"
          @change="onDateChange"
        />
      </div>

      <LogQuery
        ref="logQuery"
        :cluster="cluster"
        :series="series"
        @search="handleSearch"
        @saveSnapshot="handleSaveSnapshot"
        @showHistroy="handleShowHistroy"
      />
    </v-card>

    <v-card class="pa-3 mt-3">
      <div class="log-viewer__toolbar">
        <div>
          <div class="d-inline-block">
            限制:
            <v-text-field
              v-model="params.limit"
              type="number"
              class="d-inline-block"
              style="width: 100px;"
              solo
              flat
              dense
              hide-details
            />
          </div>
          <div class="d-inline-block ml-3">结果: {{ ItemsFilterByLevel.length }}</div>
          <LogLevelSelector
            v-model="params.levels"
            class="ml-3"
          />
          <div class="d-inline-block ml-4">
            时间
            <v-switch
              v-model="view.timestamp"
              hide-details
              class="log-viewer__toolbar-switch"
            />
          </div>
          <div class="d-inline-block ml-3">
            倒序
            <v-switch
              v-model="params.direction"
              hide-details
              true-value="backward"
              false-value="forward"
              class="log-viewer__toolbar-switch"
              @change="onLogQuery"
            />
          </div>
        </div>

        <div>
          <v-btn
            text
            small
            color="primary"
            :disabled="view.resultType !== 'streams'"
            @click="handleDownloadLog"
          >
            <v-icon left>mdi-download</v-icon>
            下载日志
          </v-btn>
          <v-btn
            color="primary"
            small
            text
            @click="handleSwitchView('chart')"
          >
            图表
            <v-icon right>
              {{ view.chart ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
        </div>
      </div>

      <LogTable
        v-if="view.resultType === 'streams'"
        :items="ItemsFilterByLevel"
        :timestamp="view.timestamp"
        :context="!!(params.regexp || params.levels.length)"
        @clickPod="handleAddPod"
        @showContext="handleShowContext"
      />
    </v-card>

    <LogContext ref="logContext" />
    <LogSaveSnapshot ref="logSaveSnapshot" />
    <LogQueryHistory
      ref="logQueryHistory"
      @queryHistory="handleQueryHistroy"
    />
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getLogSeries, getLogQueryRange, getLogExport } from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import LogQuery from './components2/LogQuery.vue'
import LogLevelSelector from './components2/LogLevelSelector.vue'
import LogTable from './components2/LogTable.vue'
import LogContext from './components2/LogContext.vue'
import LogSaveSnapshot from './components2/LogSaveSnapshot.vue'
import LogQueryHistory from './components2/LogQueryHistory.vue'

export default {
  name: 'LogViewer',
  components: {
    ClusterSelect,
    LogQuery,
    LogLevelSelector,
    LogTable,
    LogContext,
    LogSaveSnapshot,
    LogQueryHistory,
  },
  data () {
    this.LABEL_CLUSTER_KEY = process.env.VUE_APP_LOG_LABEL_CLUSTER_KEY

    this.breadcrumb = {
      title: '日志查看器',
      tip: '基于Loki的日志查看面板，可进行日志实时查询，快照，过滤等等',
      icon: 'mdi-format-list-bulleted',
    }

    return {
      cluster: {},
      clusterBadge: {},
      series: [],
      date: [],
      params: {
        limit: 500,
        direction: 'backward',
        levels: [],
        logQL: '',
        regexp: '',
        pod: '',
      },
      items: [],
      view: {
        timestamp: false,
        chart: false,
        resultType: 'streams',
      },
    }
  },
  computed: {
    ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
    ...mapGetters(['Tenant', 'Cluster']),
    dateTimestamp () {
      return this.date.map(d => `${d}000000`)
    },
    step () {
      const m = (this.date[1] - this.date[0]) / 1000
      if (m / 60 < 5) {
        return '2s'
      } else if (m / 60 < 10) {
        return '4s'
      } else if (m / 60 < 30) {
        return '10s'
      } else if (m / 60 < 180) {
        return '1m'
      } else if (m / 60 < 360) {
        return '2m'
      } else if (m / 60 < 720) {
        return '5m'
      } else if (m / 60 < 1440) {
        return '10m'
      } else if (m / 60 < 2880) {
        return '20m'
      } else if (m / 60 < 7200) {
        return '30m'
      } else {
        return '1h'
      }
    },
    ItemsFilterByLevel () {
      const { levels } = this.params
      if (levels.length === 0) {
        return this.items
      } else {
        return this.items.filter(item => levels.includes(item.info.level))
      }
    },
  },
  methods: {
    // 获取Series并设置集群按钮徽标值
    async getSeriesList () {
      const { text: clusterName } = this.cluster
      const match = this.AdminViewport
        ? `{${this.LABEL_CLUSTER_KEY}="${clusterName}"}`
        : `{${this.LABEL_CLUSTER_KEY}="${clusterName}",tenant=~"^${this.Tenant().TenantName}$"}`

      const data = await getLogSeries(clusterName, {
        match,
        start: this.dateTimestamp[0],
        end: this.dateTimestamp[1],
        noprocessing: true,
      })
      this.series = data
      this.handleSetClusterBadge(clusterName, data.length)
    },

    onClusterChange () {
      this.$refs.dateRangePicker.refresh(false)
      this.getSeriesList()
    },
    onDateChange () {
      this.getSeriesList()
    },
    handleSetClusterBadge (cluster, total) {
      this.$set(this.clusterBadge, cluster, total > 5000 ? '5000+' : total.toString())
    },

    // 判断是否显示上下文
    // eslint-disable-next-line vue/no-unused-properties
    handleSetContext () {

    },

    handleSwitchView (type, value) {
      this.view[type] === value ?? !this.view[type]
    },

    handleSearch ({ logQL, regexp }) {
      this.params.logQL = logQL
      this.params.regexp = regexp
      this.onLogQuery()
    },

    // 查询
    async onLogQuery() {
      if (!this.params.logQL) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }
      // if (this.params.limit > 50000) {
      //   this.$store.commit('SET_SNACKBAR', {
      //     text: '最大支持单次50000条日志输出',
      //     color: 'warning',
      //   })
      //   return
      // }
      this.$refs.dateRangePicker.refresh(false)
      const params = {
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        start: this.dateTimestamp[0],
        end: this.dateTimestamp[1],
        limit: this.params.limit,
        direction: this.params.direction,
        filters: this.params.regexp ? [this.params.regexp] : '',
        query: encodeURIComponent(this.params.logQL),
        step: this.step,
      }
      this.items = []
      this.params.levels = []

      const data = await getLogQueryRange(params.ClusterName, params)

      if (data.resultType === '') {
        this.$store.commit('SET_SNACKBAR', {
          text: 'LogQL有误',
          color: 'warning',
        })
        return
      }

      // this.queryed = true
      this.items = (data.query || []).sort((a, b) => {
        if (this.params.direction === 'backward') {
          return b.info.timestamp - a.info.timestamp
        } else {
          return a.info.timestamp - b.info.timestamp
        }
      })
      this.view.resultType = data.resultType
      this.chartData = data.chart

      // 自动展开图表
      if (this.view.resultType !== 'streams') {
        this.view.chart = data.chart['xAxis-data'].length > 0 || this.view.chart
      }

      // 数据过多提示
      if (this.items.length / this.limit > 0.8) {
        this.$store.commit('SET_SNACKBAR', {
          text: '条目较多，请精确查询条件',
          color: 'warning',
        })
      }
      if (data.chart && data.chart.long) {
        this.$store.commit('SET_SNACKBAR', {
          text: '图表数据过多，仅展示50条',
          color: 'warning',
        })
      }

      // 保存值查询历史
    },

    async handleGetLogFilename () {
      if (this.Progress) return

      const params = {
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        start: this.dateTimestamp[0],
        end: this.dateTimestamp[1],
        level: this.params.levels.join(','),
        pod: this.params.pod,
        direction: this.params.direction,
        query: encodeURIComponent(this.params.logQL),
      }

      const data = await getLogExport(params.ClusterName, params)
      if (!data) return null

      if (data.exist) {
        return data.filename
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '该区间内没有数据',
          color: 'warning',
        })
        return null
      }
    },

    // 保存日志快照
    async handleSaveSnapshot () {
      if (this.Progress) return
      if (this.items.length === 0) {
        this.$store.commit('SET_SNACKBAR', {
          text: '无查询结果',
          color: 'warning',
        })
        return
      }

      this.$store.commit('SET_SNACKBAR', {
        text: '正在生成结果临时文件，请等待...',
        color: 'success',
      })
      const filename = await this.handleGetLogFilename()
      if (filename) {
        this.$refs.logSaveSnapshot.show({
          StartTime: this.dateTimestamp[0].slice(0, 13),
          EndTime: this.dateTimestamp[1].slice(0, 13),
          SourceFile: filename,
          SnapshotName: '',
          ClusterName: this.cluster.text,
          ClusterID: this.cluster.value,
        })
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    async handle(saving) {
      if (this.logqlIncomplete) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }
      if (this.Progress) {
        return
      }

      const getdata = {
        ClusterID: this.currentCluster.value,
        ClusterName: this.currentCluster.text,
        start: this.dateRangeTimestamp[0],
        end: this.dateRangeTimestamp[1],
        level: this.level.join(','),
        pod: this.params.pod,
        direction: this.params.direction,
        query: encodeURIComponent(this.logQL),
      }
      const data = await getLogExport(getdata.ClusterName, getdata)
      if (data === null) {
        return null
      }
      if (data.exist) {
        const filename = data.filename
        if (saving) {
          return filename
        }
        const link = document.createElement('a')
        link.addEventListener('click', function () {
          link.download = filename
          link.href = '/api/lokiExport/' + filename
        })
        const e = document.createEvent('MouseEvents')
        e.initEvent('click', false, false)
        link.dispatchEvent(e)
        this.$store.commit('SET_SNACKBAR', {
          text: '导出成功',
          color: 'warning',
        })
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '该区间内没有数据',
          color: 'warning',
        })
        return null
      }
    },

    handleDownloadLog () {

    },

    handleAddPod (pod) {
      this.$refs.logQuery.setSelectedValue('pod', pod)
    },

    handleShowHistroy () {
      this.$refs.logQueryHistory.show()
    },

    handleQueryHistroy () {
      this.$refs.logQuery.getValuesByPathQuery()
    },

    handleShowContext (item) {
      const query = Object.keys(item.stream).reduce((pre, current) => `${pre}${current}="${item.stream[current]}",`, '{').slice(0, -1) + '}'
      this.$refs.logContext.showContext(item, {
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        query: encodeURIComponent(query),
        timestamp: item.info.timestamp,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.log-viewer {
  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin-bottom: 12px;

    &-switch {
      display: inline-block;
      position: relative;
      top: 3px;
    }
  }
}
</style>
