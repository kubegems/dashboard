<template>
  <v-container
    id="log-viewer"
    fluid
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-text
        class="pl-4 py-1"
        :disabled="disableQuery"
      >
        <v-row class="mb-1 pa-0 mt-3">
          <v-col
            cols="9"
            class="pa-0 pl-1"
          >
            <ClusterSelect
              ref="clusterSelect"
              :cluster-total-streams-num="clusterTotalStreamsNum"
              :disabled="disableQuery"
              @clusterChange="clusterChange"
              @refresh="refresh"
            />
          </v-col>
          <v-col
            cols="3"
            class="pa-1 d-flex align-center justify-end"
          >
            <v-card-title class="pa-0 my-card-title">
              <v-sheet class="text-body-2 text--darken-1">
                <BaseDatetimePicker
                  ref="dateRangePicker"
                  :disabled="disableQuery"
                  @date="changeDate"
                />
              </v-sheet>
            </v-card-title>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card
        :elevation="showLogLabelFilter ? 3 : 0"
        :min-height="showLogLabelFilter ? 150 : ''"
      >
        <v-card-title class="mx-0 py-2 pl-2 pr-1">
          <span class="px-0 mr-1">
            <v-btn
              color="primary"
              text
              :disabled="disableQuery"
              @click="showLogLabelFilter = !showLogLabelFilter"
            >
              查询
              <v-icon>
                {{ showLogLabelFilter ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </span>
          <LogFilter
            v-if="!advanced"
            ref="logFilter"
            class="pr-0"
            :match="match"
            @updateRegex="updateRegex"
            @deleteLabelValue="deleteLabelValue"
            @enterdown="querying"
          />
          <v-spacer v-if="advanced" />
          <span class="px-1">
            <v-btn
              color="primary"
              text
              :disabled="disableQuery"
              @click="querying"
            >
              <v-icon left>mdi-magnify</v-icon>
              运行
            </v-btn>
          </span>
          <span
            v-if="advanced === false"
            class="px-1"
          >
            <v-btn
              color="primary"
              text
              :disabled="disableQuery"
              @click="saveQueryResult"
            >
              <v-icon left>mdi-content-save</v-icon>
              保存
            </v-btn>
          </span>
          <span
            v-if="advanced === false"
            class="px-1"
          >
            <v-btn
              color="primary"
              text
              :disabled="disableQuery"
              @click="openLogHistory"
            >
              <v-icon left>mdi-history</v-icon>
              历史
            </v-btn>
          </span>
          <span
            v-if="resultType === 'streams'"
            class="px-1"
          >
            <v-btn
              color="primary"
              text
              @click="liveQuerying"
            >
              <v-icon left>{{
                wsLoading
                  ? 'mdi-stop-circle-outline'
                  : 'mdi-play-circle-outline'
              }}</v-icon>
              流式传输
            </v-btn>
          </span>
          <span class="px-1">
            <v-btn
              color="primary"
              text
              :loading="filterChangeLoading"
              :disabled="disableQuery"
              @click="changeAdvance"
            >
              <v-icon left>mdi-sync</v-icon>
              {{ advanced ? '标签查询' : '高级查询' }}
            </v-btn>
          </span>
        </v-card-title>

        <div
          v-show="showLogLabelFilter && !disableQuery"
          class="ml-2 mr-2"
        >
          <LogLabelFilter
            v-if="advanced === false"
            ref="logLabelFilter"
            :current-cluster="currentCluster"
            @updateMatch="updateMatch"
            @confirmLabels="confirmLabels"
            @closeExpand="closeExpand"
            @refresh="refresh"
            @logqlReset="logqlReset"
          />
          <LogFilterAdvance
            v-if="advanced === true"
            ref="logFilterAdvance"
            :queryed.sync="queryed"
            :result-type.sync="resultType"
            :current-cluster="currentCluster"
            @updateQueryed="queryedFunc"
            @updateAdvanceFilter="advanceFilter"
            @advanceUpdateLogQL="advanceUpdateLogQL"
          />
        </div>
      </v-card>

      <v-flex>
        <v-card-title
          class="py-2 pl-1 pr-5 pb-1"
          :disabled="disableQuery"
          @click="showLogLabelFilter = !showLogLabelFilter"
        >
          <span class="text-body-2 ml-1"> LogQL: {{ logQL }} </span>
        </v-card-title>
      </v-flex>
    </v-card>
    <v-flex
      xs12
      md12
    >
      <v-card
        id="log-card"
        :disabled="disableQuery"
        class="mt-2"
      >
        <v-flex>
          <v-expand-transition>
            <v-flex v-show="showChart">
              <v-flex v-if="resultType === 'streams'">
                <LogBar
                  ref="logBar"
                  class="pb-1"
                  @refresh="logQueryRange"
                />
              </v-flex>
              <v-flex v-else-if="resultType === 'matrix'">
                <LogLine ref="logLine" />
              </v-flex>
            </v-flex>
          </v-expand-transition>
        </v-flex>
        <v-card-title
          v-if="resultType === 'streams'"
          class="my-card-title py-0 pl-2 pr-2"
        >
          限制:
          <span class="pr-4">
            <v-text-field
              v-model="limit"
              type="number"
              style="width: 100px; margin-left: 5px;"
              solo
              flat
              dense
              class="mt-6"
            />
          </span>
          <span class="pr-4">结果: {{ items.length }}</span>

          <LogLevelSelect
            v-model="level"
            class="mr-4"
            @change="onFilterLevelChange"
          />

          时间
          <span
            class="mt-4"
            style="margin-left: 10px;"
          >
            <v-switch v-model="timestamp" />
          </span>
          倒序
          <span
            class="mt-4"
            style="margin-left: 10px;"
          >
            <v-switch
              v-model="dsc"
              @change="onLogResultChange"
            />
          </span>
          <v-spacer />
          <v-btn
            v-if="resultType === 'streams'"
            text
            small
            color="primary"
            :disabled="disableQuery"
            @click="logExport(false)"
          >
            <v-icon left>mdi-download</v-icon>
            下载日志
          </v-btn>
          <v-btn
            color="primary"
            small
            text
            :disabled="disableQuery"
            @click="showChart = !showChart"
          >
            图表
            <v-icon right>
              {{ showChart ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text
          v-if="resultType === 'streams'"
          class="my-0 py-0"
          @click="onTableClickProxy"
        >
          <v-data-table
            disable-sort
            :headers="headers"
            :items="items"
            :expanded.sync="expanded"
            item-key="info.index"
            disable-pagination
            single-expand
            show-expand
            hide-default-footer
            no-data-text=""
            loading-text="接收数据中..."
            dense
            class="hidden-header"
            :loading="wsLoading"
          >
            <template #[`item.info`]="{ item }">
              <div
                :class="`v-list-item-html v-list-item-${item.info.level}`"
                :style="item.info.animation"
              >
                <span
                  v-if="timestamp"
                  class="success--text timestamp-span"
                >{{
                  item.info.timestampstr
                }}</span>
                <span
                  class="v-chip v-size--small pod-span"
                  :data-pod="item.stream.pod"
                >
                  {{ item.stream.pod }}
                </span>
                <span v-html="item.info.message" />
              </div>
              <v-btn
                v-if="filtered || level.length || advancedFilterd"
                text
                x-small
                color="primary"
                @click.stop="showLogContext(item)"
              >
                显示上下文
              </v-btn>
            </template>
            <template #expanded-item="{ item }">
              <td colspan="2">
                <pre class="pre">{{ item.stream }}</pre>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>

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
      @click="goTo"
    >
      <v-icon small>mdi-apple-keyboard-control</v-icon>
    </v-btn>
    <LogSave ref="logSave" />
    <LogContext
      ref="logContext"
      :current-cluster="currentCluster"
    />
    <LogHistory
      ref="logHistory"
      @queryLogQueryHistory="queryLogQueryHistory"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getLogQueryRange, getLogExport, postAddLogQueryHistory, getLogSeries } from '@/api'
import LogBar from './components/LogBar'
import LogLine from './components/LogLine'
import LogContext from './components/LogContext'
import LogFilter from './components/LogFilter'
import LogLabelFilter from './components/LogLabelFilter'
import LogFilterAdvance from './components/LogFilterAdvance'
import LogSave from './components/LogSave'
import LogLevelSelect from './components/LogLevelSelect'
import LogHistory from './components/LogHistory'
import ClusterSelect from './components/ClusterSelect'
import BaseSelect from '@/mixins/select'
import { formatDatetime, parserDatetime } from '@/utils/helpers'

export default {
  name: 'LogViewer',
  components: {
    LogBar,
    LogContext,
    LogLabelFilter,
    LogSave,
    LogFilterAdvance,
    LogLine,
    LogFilter,
    LogHistory,
    ClusterSelect,
    LogLevelSelect,
  },
  mixins: [BaseSelect],
  data() {
    this.cacheAllItems = [] // 用于缓存请求结果，用于前端过滤
    this.headers = [
      { text: '', value: 'info', align: 'start' },
      { text: '', value: 'data-table-expand', align: 'end' },
    ]
    return {
      breadcrumb: {
        title: '日志查看器',
        tip: '基于Loki的日志查看面板，可进行日志实时查询，快照，过滤等等',
        icon: 'mdi-format-list-bulleted',
      },
      items: [],
      expanded: [],
      level: [],
      filtered: false,
      advancedFilterd: false,
      dateRangeTimestamp: [],
      selectedLevels: [], // 选中告警级别
      limit: 500,
      size: 20,
      pods: [],
      duration: 500,
      offset: 0,
      easing: 'easeInOutCubic',
      pod: '',
      websocket: null,
      wsLoading: false,
      timeoutTimer: null,
      timestamp: false,
      dsc: true,
      advanced: false,
      filterChangeLoading: false,
      resultType: 'streams',
      queryed: false,
      showLogLabelFilter: false,
      showChart: false,
      match: '',
      regexStr: '',
      advanceLogQL: '',
      disableQuery: false,
      currentCluster: {},
      clusterTotalStreamsNum: {},
      initSeries: {},
      refreshTime: false,
    }
  },
  computed: {
    ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
    ...mapGetters(['Tenant', 'Cluster']),
    logLabelClusterKey() {
      return process.env.VUE_APP_LOG_LABEL_CLUSTER_KEY
    },
    // 方向/顺序
    direction() {
      return this.dsc ? 'backward' : 'forward'
    },
    filters() {
      const tmp = []
      if (!this.advanced) {
        this.$refs.logFilter.model.forEach((item) => {
          if (item.text && item.text.indexOf('正则') > -1) {
            tmp.push(item.value)
          }
        })
      }
      return tmp
    },
    logqlIncomplete() {
      return this.logqlReset()
    },
    labelFilterLogQL() {
      if (!this.match && this.regexStr === '') {
        return ''
      } else if (!this.match && this.regexStr !== '') {
        return '{}' + ' ' + this.regexStr
      } else if (this.match && this.regexStr === '') {
        return this.match
      } else {
        return this.match + ' ' + this.regexStr
      }
    },
    logQL() {
      if (this.advanced) {
        return this.advanceLogQL
      } else {
        return this.labelFilterLogQL
      }
    },
  },
  created() {
    window.addEventListener('beforeunload', this.close)
    window.addEventListener('unload', this.close)
  },
  destroyed() {
    this.close()
    window.removeEventListener('beforeunload', this.close)
    window.removeEventListener('unload', this.close)
  },
  async mounted() {
    if (this.JWT) {
      await this.$refs.clusterSelect.generateClusters()
    }
  },
  methods: {
    async refresh() {
      await this.getLabels()
      this.getTotalStreamsNum(this.currentCluster)
    },
    async getLabels() {
      if (
        Object.keys(this.currentCluster).length > 0 &&
        this.$refs.logLabelFilter
      ) {
        await this.$refs.logLabelFilter.getLabels(this.currentCluster)
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '请选择集群',
          color: 'warning',
        })
      }
    },
    async clusterChange(cluster) {
      if (
        !Object.keys(this.currentCluster).length > 0 ||
        this.currentCluster.value !== cluster.value
      ) {
        this.$set(this.currentCluster, 'text', cluster.text)
        this.$set(this.currentCluster, 'value', cluster.value)
        this.$refs.clusterSelect.activeCluster(cluster)
        if (!this.advanced) {
          this.$refs.logLabelFilter.labels = {}
          this.$refs.logLabelFilter.updateMatch()
          this.$refs.logFilter.model = []
          await this.getLabels()
        }
        this.getTotalStreamsNum(cluster)
      }
    },
    logqlReset() {
      if (!this.logQL) return true
      // 必须带上租户标签
      if (this.advanced) {
        return (
          this.logQL.length === 0 ||
          this.logQL === '{}' ||
          this.logQL === `{tenant="${this.Tenant().TenantName}"}`
        )
      } else {
        return (
          this.logQL.length === 0 ||
          this.logQL === '{}' ||
          this.logQL === `{tenant="${this.Tenant().TenantName}"}` ||
          this.match === '' ||
          this.match === '{}'
        )
      }
    },
    async getTotalStreamsNum(cluster) {
      if (!this.dateRangeTimestamp[0] || !this.dateRangeTimestamp[1]) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入起止时间',
          color: 'warning',
        })
        return
      }
      let match = `{${this.logLabelClusterKey}="${cluster.text}"}`
      if (!this.AdminViewport) {
        match = `{${this.logLabelClusterKey}="${cluster.text}",tenant=~"^${
          this.Tenant().TenantName
        }$"}`
      }
      const data = await getLogSeries(cluster.text, {
        match: match,
        start: this.dateRangeTimestamp[0],
        end: this.dateRangeTimestamp[1],
        noprocessing: true,
      })
      let num = ''
      if (data.length > 0) {
        if (data.length >= 5000) {
          num = '5000+'
        } else if (data.length === 0) {
          num = '0'
        } else {
          num = data.length.toString()
        }
      } else {
        num = '0'
      }
      this.$set(this.clusterTotalStreamsNum, cluster.text, num)
      if (!this.advanced) {
        this.$nextTick(() => {
          if (this.$refs.logLabelFilter) {
            this.$refs.logLabelFilter.initLogLabelValues(data)
            this.initSeries = data
          }
        })
      }
    },
    changeDate(start, end) {
      this.$set(
        this.dateRangeTimestamp,
        0,
        Date.parse(this.$moment(start).utc()) + '000000',
      )
      this.$set(
        this.dateRangeTimestamp,
        1,
        Date.parse(this.$moment(end).utc()) + '000000',
      )
      if (Object.keys(this.currentCluster).length > 0 && !this.refreshTime) {
        this.getTotalStreamsNum(this.currentCluster)
      }
    },
    deleteLabelValue(label, value) {
      if (!this.advanced) {
        this.$refs.logLabelFilter.deleteLabelValue(label, value)
      }
    },
    confirmLabels(selectedLabelValueList) {
      if (!this.advanced) {
        this.$refs.logFilter.confirmLabels(selectedLabelValueList)
      }
    },
    calculationStep() {
      const s = new Date(this.dateRangeTimestamp[0] / 1000000)
      const e = new Date(this.dateRangeTimestamp[1] / 1000000)
      const m = (e - s) / 1000.0
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
    onLogResultChange() {
      this.logQueryRange()
    },
    // 日志范围查询
    async logQueryRange(save = true) {
      if (this.logqlIncomplete) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }
      this.showLogLabelFilter = false
      if (this.limit > 50000) {
        this.$store.commit('SET_SNACKBAR', {
          text: '最大支持单次50000条日志输出',
          color: 'warning',
        })
        return
      }
      // [3m]
      if (/\[\d+m\]/.test(this.logQL)) {
        this.resultType = 'matrix'
      } else {
        this.resultType = 'streams'
      }
      // update time
      this.$refs.dateRangePicker.refresh()
      const getdata = {
        ClusterID: this.currentCluster.value,
        ClusterName: this.currentCluster.text,
        start: this.dateRangeTimestamp[0],
        end: this.dateRangeTimestamp[1],
        limit: this.limit,
        size: this.size,
        pod: this.pod,
        direction: this.direction,
        filters: this.filters,
        query: encodeURIComponent(this.logQL),
        step: this.calculationStep(),
      }
      this.filtered =
        Object.prototype.hasOwnProperty.call(getdata, 'filters') &&
        getdata.filters.length > 0

      // 重置items及级别选择
      this.items = []
      this.cacheAllItems = []
      this.selectedLevels = []
      const data = await getLogQueryRange(getdata.ClusterName, getdata)
      if (data.resultType === '') {
        this.$store.commit('SET_SNACKBAR', {
          text: 'LogQL有误',
          color: 'warning',
        })
        return
      }
      this.queryed = true
      this.resultType = data.resultType
      this.cacheAllItems =
        data.query?.sort((a, b) =>
          this.direction === 'backward'
            ? b.info.timestamp - a.info.timestamp
            : a.info.timestamp - b.info.timestamp,
        ) || []
      this.onFilterLevelChange(this.level)
      if ((this.items.length * 1.0) / this.limit > 0.8) {
        this.$store.commit('SET_SNACKBAR', {
          text: '条目较多，请精确查询条件',
          color: 'warning',
        })
      }
      if (
        Object.prototype.hasOwnProperty.call(data.chart, 'long') &&
        data.chart['long']
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: '数据过多，仅展示50条',
          color: 'warning',
        })
      }
      const xAxisData = []
      data.chart['xAxis-data'].forEach((item) => {
        const timeSecond = item.toString().length === 10 ? item + '000' : item
        xAxisData.push(
          formatDatetime(new Date(parseInt(timeSecond)), 'yyyy-MM-dd hh:mm:ss'),
        )
      })
      data.chart['xAxis-data'] = xAxisData
      if (this.resultType === 'streams') {
        this.$refs.logBar.chartData = data.chart
      } else {
        if (data.chart['xAxis-data'].length > 0 && !this.showChart) {
          this.showChart = true
        }
        this.$refs.logLine.chartData = data.chart
      }
      if (data.pod !== undefined) {
        this.pods = data.pod
      }
      const pod = this.$route.query['pod']
      if (pod !== undefined) {
        this.pod = pod
        this.pods = [{ text: pod, selected: true }]
      }
      // 每次点击查询后自动保存查询历史
      if (save) {
        this.addLogQueryHistory()
      }
    },
    // 前端过滤日志级别
    onFilterLevelChange(levels) {
      this.items = this.cacheAllItems.filter(
        (item) => !levels.length || levels.includes(item.info.level),
      )
    },
    async logExport(saving) {
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
        pod: this.pod,
        direction: this.direction,
        filters: this.filters,
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
    async saveQueryResult() {
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
      const filename = await this.logExport(true)
      if (filename !== null) {
        const item = {
          StartTime: parserDatetime(this.$refs.dateRangePicker.dateRange[0]),
          EndTime: parserDatetime(this.$refs.dateRangePicker.dateRange[1]),
        }
        const logSaveRef = this.$refs.logSave
        logSaveRef.item = item
        logSaveRef.obj.SourceFile = filename
        logSaveRef.obj.SnapshotName = ''
        logSaveRef.currentCluster = this.currentCluster
        logSaveRef.open()
      }
    },
    // 新版本查询后自动保存到查询历史中
    async querying() {
      this.refreshTime = true
      this.size = 20
      this.pod = ''
      this.pods = []
      if (this.logqlIncomplete) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }
      if (this.showLogLabelFilter && !this.advanced) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请确认查询条件',
          color: 'warning',
        })
        return
      }
      setTimeout(() => {
        this.logQueryRange()
      }, 300)
    },
    gotoOptions() {
      return {
        duration: this.duration,
        offset: this.offset,
        easing: this.easing,
      }
    },
    goTo() {
      const container = document.getElementById('log-viewer')
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
    constructParams() {
      const data = {
        start: Date.parse(new Date()).toString() + '000000',
        level: this.level.join(','),
        filter: this.filters.join(','),
        query: encodeURIComponent(this.logQL),
        stream: true,
      }
      const paramArray = []
      for (var item in data) {
        paramArray.push(item + '=' + data[item])
      }
      return paramArray.join('&')
    },
    initWebSocket() {
      const params = this.constructParams()
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.host
      const wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${this.currentCluster.text}/custom/loki/v1/tail?${params}&token=${this.JWT}`
      this.websocket = new WebSocket(wsuri)
      this.websocket.binaryType = 'arraybuffer'
      this.websocket.onmessage = this.onWebsocketMessage
      this.websocket.onopen = this.onWebsocketOpen
      this.websocket.onerror = this.onWebsocketError
      this.websocket.onclose = this.onWebsocketClose
    },
    onWebsocketOpen() {
      this.wsLoading = true
      if (this.advanced) {
        this.$refs.logFilterAdvance.disabled = true
        this.disableQuery = true
      } else {
        if (this.$refs.logFilter) this.$refs.logFilter.disabled = true
        this.disableQuery = true
      }
      this.$vuetify.goTo('#log-card', this.gotoOptions())
    },
    onWebsocketError() {
      this.wsLoading = false
      this.$store.commit('SET_SNACKBAR', {
        text: 'websocket连接失败',
        color: 'warning',
      })
      this.websocket = null
    },
    onWebsocketMessage(e) {
      const data = JSON.parse(e.data)
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
    onWebsocketClose() {
      this.wsLoading = false
      if (this.advanced) {
        this.$refs.logFilterAdvance.disabled = false
        this.disableQuery = false
      } else {
        if (this.$refs.logFilter) this.$refs.logFilter.disabled = false
        this.disableQuery = false
      }
      this.items.forEach((item) => {
        if (item.info !== undefined) item.info.animation = ''
      })
    },
    close() {
      this.wsLoading = false
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
        if (this.advanced) {
          this.$refs.logFilterAdvance.disabled = false
          this.disableQuery = false
        } else {
          if (this.$refs.logFilter) this.$refs.logFilter.disabled = false
          this.disableQuery = false
        }
      }
    },
    liveQuerying() {
      if (this.logqlIncomplete) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询条件',
          color: 'warning',
        })
        return
      }
      if (this.showLogLabelFilter && !this.advanced) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请确认查询条件',
          color: 'warning',
        })
        return
      }
      if (!this.Progress && !this.wsLoading) {
        this.initWebSocket()
      } else {
        this.close()
      }
    },
    changeAdvance() {
      this.filterChangeLoading = true
      // 将当前vue实例赋值给vue变量
      const self = this
      setTimeout(() => {
        self.advanced = !self.advanced
        self.filterChangeLoading = false
        if (!self.advanced) {
          // 标签查询
          self.advancedFilterd = false
          self.$nextTick(async () => {
            if (this.$refs.logLabelFilter) {
              await this.$refs.logLabelFilter.getLabels(this.currentCluster)
              this.$refs.logLabelFilter.initLogLabelValues(this.initSeries)
            }
            this.$refs.logFilter.model = []
            this.updateRegex('')
          })
        } else {
          // 高级查询
          // 高级组件挂在前拿到普通查询语句
          const oldLogQL = this.labelFilterLogQL
          self.$nextTick(() => {
            const clusterStr = `${this.logLabelClusterKey}="${this.currentCluster.text}"`
            const reg = new RegExp(',?(s?)+' + clusterStr + '(s?)+,?')
            self.$refs.logFilterAdvance.logQL = oldLogQL.replace(reg, '')
            this.showLogLabelFilter = true
          })
        }
      }, 300)
    },
    advanceUpdateLogQL(logQL) {
      this.advanceLogQL = logQL
    },
    queryedFunc(queryed) {
      this.queryed = queryed
    },
    advanceFilter(filterd) {
      this.advancedFilterd = filterd
    },
    showLogContext(item) {
      const logContextRef = this.$refs.logContext
      logContextRef.timestamp = item.info.timestamp
      const labels = Object.keys(item.stream)
      logContextRef.logQL =
        labels.reduce(
          (pre, current, index) =>
            `${pre}${current}="${item.stream[current]}"${
              index === labels.length - 1 ? '' : ','
            }`,
          '{',
        ) + '}'
      logContextRef.items = [
        {
          message: item.info.message,
          timestamp: item.info.timestamp,
          level: item.info.level,
        },
      ]
      logContextRef.loadPreview()
      logContextRef.loadNext()
      logContextRef.open()
    },
    async addLogQueryHistory() {
      if (this.logqlIncomplete) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请输入查询',
          color: 'warning',
        })
        return
      }
      await postAddLogQueryHistory({
        LogQL: this.logQL,
        CreateAt: new Date(),
        ClusterName: this.currentCluster.text,
        CreatorID: this.User.ID,
        ClusterID: this.currentCluster.value,
      })
    },
    updateMatch(match) {
      this.match = match
    },
    updateRegex(regexStr) {
      this.regexStr = regexStr
    },
    closeExpand() {
      this.showLogLabelFilter = false
    },
    openLogHistory() {
      this.$refs.logHistory.open()
      this.$refs.logHistory.init()
    },
    async queryLogQueryHistory(params, currentCluster) {
      if (this.currentCluster.value !== currentCluster.value) {
        // 响应式设置
        this.$set(this.currentCluster, 'text', currentCluster.text)
        this.$set(this.currentCluster, 'value', currentCluster.value)
      }
      // 激活集群
      this.$refs.clusterSelect.activeCluster(currentCluster)
      const pod = params['pod'] ? params['pod'] : ''
      const advanced = params['advanced'] ? params['advanced'] : ''
      const logQL = params['logQL'] ? params['logQL'] : ''
      let filters = params['filters'] ? params['filters'] : ''
      const labels = params['labels'] ? params['labels'] : ''
      if (!Array.isArray(filters) || typeof labels !== 'object') return
      if (advanced !== undefined && advanced !== '') {
        this.advanced = advanced
      }
      if (labels.length === 0) {
        this.advanced = true
      }
      if (pod !== undefined) {
        this.pod = pod
        this.pods = [{ text: pod, selected: true }]
      }
      // 高级查询
      if (this.advanced) {
        if (logQL) {
          this.filterChangeLoading = true
          const vue = this
          setTimeout(() => {
            vue.advanced = true
            vue.filterChangeLoading = false
            if (vue.advanced) {
              vue.$nextTick(() => {
                vue.$refs.logFilterAdvance.logQL = logQL
                this.showLogLabelFilter = true
                this.advanceLogQL = logQL
                this.logQueryRange(false)
              })
            }
          }, 300)
        }
      } else {
        // 普通查询
        this.showLogLabelFilter = !!logQL
        this.$refs.logLabelFilter.clearLabels()
        if (JSON.stringify(this.$refs.logLabelFilter.labels) === '{}') {
          await this.$refs.logLabelFilter.logLabels({
            ClusterID: this.currentCluster.value,
            ClusterName: this.currentCluster.text,
            noprocessing: true,
          })
        }
        if (
          labels !== undefined &&
          JSON.stringify(this.$refs.logLabelFilter.labels) !== '{}'
        ) {
          for (var key in labels) {
            if (this.$refs.logLabelFilter.labels[key]) {
              this.$refs.logLabelFilter.labels[key].selected = true
              labels[key].forEach((labelValue) => {
                this.$refs.logLabelFilter.labels[key].labelValues[labelValue] =
                  {
                    selected: true,
                  }
              })
            }
          }
          this.$refs.logLabelFilter.confirmLabels()
        }
        if (filters !== undefined) {
          if (typeof filters === 'string') {
            filters = filters.split(',')
          }
          filters.forEach((item) => {
            this.$refs.logFilter.model.push({
              text: `正则:${item}`,
              value: item,
            })
          })
        }
        // 更新一次查询语句, 关闭自动保存
        await this.$refs.logLabelFilter.updateMatch()
        if (logQL) {
          this.logQueryRange(false)
        }
      }
    },
    // 表格点击代理
    onTableClickProxy(e) {
      // 查询pod标签
      if (e.target.dataset.pod && this.$refs.logLabelFilter) {
        this.$refs.logLabelFilter.setLabelValue('pod', e.target.dataset.pod) &&
          this.logQueryRange()
      }
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
#logviewer .v-speed-dial {
  position: fixed;
}

#logviewer .v-btn--floating {
  position: relative;
}
.logql-font {
  height: auto;
  padding: 0 20px !important;
}

.overlay {
  opacity: 0.1;
  background-color: rgb(33, 33, 33);
  border-color: rgb(33, 33, 33);
  position: absolute;
  z-index: 10;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.pre {
  white-space: pre-wrap;
  word-break: break-all;
}

/* This is for documentation purposes and will not be needed in your application */
.v-btn--logbar-expand {
  top: 0;
  bottom: 5px;
  right: 0;
  position: absolute;
  margin: 2px;
}
.my-card-title {
  font-size: 13px;
  font-weight: normal;
}

#log-viewer {
  height: 100vh;
  overflow: auto;
}

#log-viewer::-webkit-scrollbar {
  display: block !important;
}
#log-viewer::-webkit-scrollbar-thumb {
  width: 10px;
  border-radius: 5px;
  background: grey;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
#log-viewer::-webkit-scrollbar:vertical {
  width: 10px;
}

.timestamp-span {
  display: inline-block;
  white-space: nowrap;
  width: 164px;
  font-weight: 600;
}

.pod-span {
  cursor: pointer;
  background-color: rgba($primary, 0.3);
  margin-right: 8px;
  margin-top: -2px;
  padding: 0 8px;
  color: #000000;
}

.hidden-header.v-data-table {
  ::v-deep {
    th {
      height: 0 !important;
      opacity: 0;
      overflow: hidden;
      border-bottom: none !important;
    }
    td {
      padding: 0 4px !important;
    }
  }
}
</style>
