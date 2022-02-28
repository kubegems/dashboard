<template>
  <BasePanel
    v-model="panel"
    :title="title"
    :width="`50%`"
    icon="mdi-view-list"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3">
        {{ Environment().Namespace }}
      </span>
    </template>
    <template #action>
      <v-flex class="mt-n1">
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatePicker @date="updateDate" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card-text>
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon
            left
            class="mr-2 primary--text"
          >
            mdi-memory
          </v-icon>
          CPU
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headersCpu"
          :items="itemsObj.cpuItems"
          no-data-text="暂无数据"
          hide-default-footer
          class="mb-8"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon
            left
            class="mr-2 primary--text"
          >
            mdi-sd
          </v-icon>
          内存
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headersCpu"
          :items="itemsObj.memoryItems"
          no-data-text="暂无数据"
          hide-default-footer
          class="mb-8"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon
            left
            class="mr-2 primary--text"
          >
            mdi-database
          </v-icon>
          存储
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headersCpu"
          :items="itemsObj.storageItems"
          no-data-text="暂无数据"
          hide-default-footer
          class="mb-8"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon
            left
            class="mr-2 primary--text"
          >
            mdi-earth
          </v-icon>
          网络流量
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headersNetwork"
          :items="itemsObj.networkItems"
          no-data-text="暂无数据"
          hide-default-footer
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getEnvironmentResourceUsage, getProjectResourceUsage } from '@/api'
import { ResourceBeatifulMixin } from '@/views/resource/environment/mixins/resourcebeatiful'

export default {
  name: 'ResourceUseList',
  mixins: [ResourceBeatifulMixin],
  props: {
    type: {
      type: String,
      default: () => '',
    },
    title: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    panel: false,
    resourceUseDetail: {},
    headersCpu: [
      { text: '最大', value: 'max', align: 'start' },
      { text: '最小', value: 'min', align: 'start' },
      { text: '平均', value: 'avg', align: 'start' },
    ],
    headersNetwork: [
      { text: '发送', value: 'out', align: 'start' },
      { text: '接收', value: 'in', align: 'start' },
    ],
    itemsObj: {},
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    ...mapGetters(['Environment', 'Project']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    updateDate(currentDate) {
      const queryDate = this.$moment(currentDate).format()
      this.getResourceUsage(queryDate)
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const yestodayBasicFormatUTC = this.$moment(yesterday).format()
      this.getResourceUsage(yestodayBasicFormatUTC)
    },
    async getResourceUsage(queryDate) {
      this.tableData = []
      this.tableDataNetworkFlow = []
      const params = { date: queryDate, noprocessing: true }
      if (this.type === 'env') {
        this.resourceUseDetail = await getEnvironmentResourceUsage(
          this.Environment().ID,
          params,
        )
      } else {
        this.resourceUseDetail = await getProjectResourceUsage(
          this.Project().ID,
          params,
        )
      }
      if (this.resourceUseDetail) {
        this.itemsObj = this.getResourceBeatiful(this.resourceUseDetail)
      }
    },
    dispose() {
      this.tableData = []
    },
  },
}
</script>
