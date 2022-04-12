<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect @loadMetrics="loadMetrics" />
      </template>
    </BaseBreadcrumb>

    <v-row class="kubegems__h-24">
      <v-col cols="4">
        <ValueCard
          name="今日告警"
          :value="alert ? alert.total.todayCount : 0"
          :compare-value="alert ? alert.total.yesterdayCount : 0"
          icon="mdi-bell"
        />
      </v-col>
      <v-col cols="4">
        <ValueCard
          name="已消除"
          :value="alert ? alert.resolved.todayCount : 0"
          :compare-value="alert ? alert.resolved.yesterdayCount : 0"
          icon="mdi-fire-extinguisher"
        />
      </v-col>
      <v-col cols="4">
        <ValueCard
          name="正在告警"
          :value="alert ? alert.firing.todayCount : 0"
          :compare-value="alert ? alert.firing.yesterdayCount : 0"
          icon="mdi-fire-alert"
        />
      </v-col>
      <v-col cols="12">
        <AlertHistoryLine :tenant="tenant" />
      </v-col>
      <v-col cols="6">
        <AlertCategoryBar :tenant="tenant" />
      </v-col>
      <v-col cols="6">
        <AlertTopBar :tenant="tenant" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getAlertToday } from '@/api'
import ValueCard from './components/ValueCard'
import AlertHistoryLine from './components/AlertHistoryLine'
import AlertCategoryBar from './components/AlertCategoryBar'
import AlertTopBar from './components/AlertTopBar'
import TenantSelect from './components/TenantSelect'
import BaseSelect from '@/mixins/select'

export default {
  name: 'ObserveMonitor',
  components: {
    ValueCard,
    AlertHistoryLine,
    AlertCategoryBar,
    AlertTopBar,
    TenantSelect,
  },
  mixins: [BaseSelect],
  data () {
    this.breadcrumb = {
      title: '监控中心',
      tip: '监控指标告警大盘统计',
      icon: 'mdi-monitor-dashboard',
    }

    return {
      tenant: '',
      alert: null,
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport']),
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.loadMetrics(this.Tenant().TenantName)
      }
    })
  },
  methods: {
    loadMetrics(tenant) {
      this.tenant = tenant
      this.alertTodayMetrics()
    },
    async alertTodayMetrics() {
      this.alert = await getAlertToday({
        tenant: this.tenant,
      })
    },
  },
}
</script>
