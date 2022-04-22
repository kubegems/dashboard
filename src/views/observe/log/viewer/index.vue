<template>
  <v-container
    id="log-viewer"
    fluid
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <BaseDatetimePicker
            ref="dateRangePicker"
            v-model="date"
            :default-value="30"
            default-value-for-query
            query-start-time-key="start"
            query-end-time-key="end"
            @change="onDateChange"
          />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <LogQuery
        ref="logQuery"
        :date-timestamp="dateTimestamp"
        @search="handleSearch"
        @saveSnapshot="handleSaveSnapshot"
        @showHistroy="handleShowHistroy"
        @stopLogStream="handleStopLogStream"
        @receiveMessage="handleReceiveMessage"
        @initLoading="handleInitLoading"
        @removeLoading="handleRemoveLoading"
        @setCluster="handleSetCluster"
      />
    </v-card>

    <v-card class="pa-3 mt-3">
      <div class="log-viewer__toolbar">
        <div v-if="view.resultType === 'streams'">
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

        <div style="margin-left: auto;">
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
            @click="handleSwitchView('chartShow')"
          >
            图表
            <v-icon right>
              {{ view.chartShow ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
        </div>
      </div>

      <v-flex>
        <v-expand-transition>
          <v-flex v-show="view.chartShow">
            <v-flex v-if="view.resultType === 'streams'">
              <LogBar
                :chart="view.chart"
                class="pb-1"
              />
            </v-flex>
            <v-flex v-else-if="view.resultType === 'matrix'">
              <LogLine :chart="view.chart" />
            </v-flex>
          </v-flex>
        </v-expand-transition>
      </v-flex>

      <LogTable
        v-if="view.resultType === 'streams'"
        :items="ItemsFilterByLevel"
        :loading="loading"
        :timestamp="view.timestamp"
        :context="!!(params.regexp || params.levels.length)"
        @clickPod="handleAddPod"
        @showContext="handleShowContext"
      />
    </v-card>

    <v-btn
      fab
      color="primary"
      fixed
      right
      bottom
      small
      direction="left"
      transition="slide-x-reverse-transition"
      style="bottom: 65px !important;"
      @click="handleScrollTo"
    >
      <v-icon small>mdi-apple-keyboard-control</v-icon>
    </v-btn>

    <LogContext
      ref="logContext"
    />
    <LogSaveSnapshot ref="logSaveSnapshot" />
    <LogQueryHistory
      ref="logQueryHistory"
      @queryHistory="handleQueryHistroy"
    />
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getLogQueryRange, getLogExport, postAddLogQueryHistory } from '@/api'
import LogQuery from './components/LogQuery'
import LogLevelSelector from './components/LogLevelSelector'
import LogTable from './components/LogTable'
import LogContext from './components/LogContext'
import LogSaveSnapshot from './components/LogSaveSnapshot'
import LogQueryHistory from './components/LogQueryHistory'
import LogBar from './components/LogBar'
import LogLine from './components/LogLine'

export default {
  name: 'LogViewer',
  components: {
    LogQuery,
    LogLevelSelector,
    LogTable,
    LogContext,
    LogSaveSnapshot,
    LogQueryHistory,
    LogBar,
    LogLine,
  },
  data () {
    this.breadcrumb = {
      title: '日志查看器',
      tip: '基于Loki的日志查看面板，可进行日志实时查询，快照，过滤等等',
      icon: 'mdi-format-list-bulleted',
    }

    return {
      cluster: {},
      date: [],
      params: {
        limit: 1000,
        direction: 'backward',
        levels: [],
        logQL: '',
        regexp: '',
        pod: '',
      },
      items: [],
      view: {
        timestamp: false,
        chart: null,
        chartShow: false,
        resultType: 'streams',
      },
      loading: false,
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
    onDateChange () {
      if (this.cluster.value) {
        this.$refs.logQuery.getSeriesList()
        this.$refs.logQuery.search()
      }
    },

    handleSwitchView (type) {
      this.view[type] = !this.view[type]
    },

    handleSearch ({ logQL, regexp, projectName, environmentName }) {
      this.params.logQL = logQL
      this.params.regexp = regexp
      this.onLogQuery(projectName, environmentName)
    },

    // 查询
    async onLogQuery(projectName = '', environmentName = '') {
      if (!this.params.logQL || this.params.logQL === '{  }') {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }

      // 补充租户信息
      if (!this.AdminViewport && !new RegExp('tenant="([\\u4e00-\\u9fa5\\w-#\\(\\)\\*\\.@\\?&^$!%<>\\/]+)"', 'g').test(this.params.logQL)) {
        const index = this.params.logQL.indexOf('{')
        this.params.logQL = this.params.logQL.substr(0, index + 1) + `tenant="${this.Tenant().TenantName}",` + this.params.logQL.substr(index + 1)
      }

      this.$refs.dateRangePicker.refresh(false)
      const params = {
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        start: this.dateTimestamp[0],
        end: this.dateTimestamp[1],
        limit: this.params.limit,
        direction: this.params.direction,
        filters: this.params.regexp ? this.params.regexp.split('|~').filter(reg => { return reg.trim() }).map(reg => { return reg.trim().replaceAll('`', '').trim() }) : '',
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

      this.items = (data.query || []).sort((a, b) => {
        if (this.params.direction === 'backward') {
          return b.info.timestamp - a.info.timestamp
        } else {
          return a.info.timestamp - b.info.timestamp
        }
      })
      this.view.resultType = data.resultType
      this.chartData = data.chart

      // 填充图表数据
      this.view.chart = data.chart
      if (this.view.resultType === 'matrix') {
         this.view.chartShow = true
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
      this.saveLogQueryHistory()

      // 填充url
      if (this.view.resultType === 'streams') {
        this.$router.replace({
          name: this.$route.name,
          query: {
            ...this.$route.query,
            project: projectName,
            environment: environmentName,
            start: this.dateTimestamp[0]?.substr(0, 13),
            end: this.dateTimestamp[1]?.substr(0, 13),
            query: this.params.logQL,
            filters: params.filters,
          },
        })
      }
    },

    async saveLogQueryHistory() {
      await postAddLogQueryHistory({
        LogQL: this.params.logQL,
        CreateAt: new Date(),
        ClusterName: this.cluster.text,
        CreatorID: this.User.ID,
        ClusterID: this.cluster.value,
      })
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
          StartTime: new Date(parseInt(this.dateTimestamp[0].slice(0, 13))),
          EndTime: new Date(parseInt(this.dateTimestamp[1].slice(0, 13))),
          SourceFile: filename,
          SnapshotName: '',
          ClusterName: this.cluster.text,
          ClusterID: this.cluster.value,
        })
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    async handleDownloadLog() {
      if (!this.params.logQL) {
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
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        start: this.dateTimestamp[0],
        end: this.dateTimestamp[1],
        level: this.params.levels.join(','),
        pod: this.params.pod,
        direction: this.params.direction,
        query: encodeURIComponent(this.params.logQL),
      }
      const data = await getLogExport(getdata.ClusterName, getdata)
      if (data === null) {
        return null
      }
      if (data.exist) {
        const filename = data.filename
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
          color: 'success',
        })
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '该区间内没有数据',
          color: 'warning',
        })
        return null
      }
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
      const query = Object.keys(item.stream).filter(l => {
        return ['container', 'image', 'pod', 'namespace', 'project'].includes(l)
      }).reduce((pre, current) => `${pre}${current}="${item.stream[current]}",`, '{').slice(0, -1) + '}'
      this.$refs.logContext.showContext(item, {
        ClusterID: this.cluster.value,
        ClusterName: this.cluster.text,
        query: encodeURIComponent(query),
        timestamp: item.info.timestamp,
      })
    },

    handleInitLoading() {
      this.loading = true
    },

    handleRemoveLoading() {
      this.loading = false
    },

    handleStopLogStream() {
      this.items.forEach((item) => {
        if (item.info !== undefined) item.info.animation = ''
      })
      this.loading = false
    },

    handleReceiveMessage(data) {
      data.sort((a, b) => {
        return a.info.timestamp - b.info.timestamp
      })
      const instance = this
      data.forEach((item) => {
        this.items.unshift(item)
        if (this.items.length > this.limit) {
          this.items.pop()
        }
      })
      this.timeoutTimer = setTimeout(() => {
        for (var index = 0; index < data.length; index++) {
          instance.items[index].info.animation =
            'transition: background-color 2s;'
        }
        clearTimeout(this.timeoutTimer)
      }, 5)
    },

    handleScrollTo() {
      const container = document.getElementById('log-viewer')
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },

    handleSetCluster(cluster) {
      this.cluster = cluster
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

#log-viewer {
  height: 100vh;
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
