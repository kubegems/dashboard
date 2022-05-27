<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect v-model="tenant" />
      </template>
    </BaseBreadcrumb>

    <v-row class="kubegems__h-24 mt-0">
      <v-col
        cols="4"
        class="pt-0"
      >
        <ValueCard
          name="今日告警"
          :value="alert ? alert.total.todayCount : 0"
          :compare-value="alert ? alert.total.yesterdayCount : 0"
          icon="mdi-bell"
        />
      </v-col>
      <v-col
        cols="4"
        class="pt-0"
      >
        <ValueCard
          name="已消除"
          :value="alert ? alert.resolved.todayCount : 0"
          :compare-value="alert ? alert.resolved.yesterdayCount : 0"
          icon="mdi-fire-extinguisher"
        />
      </v-col>
      <v-col
        cols="4"
        class="pt-0"
      >
        <ValueCard
          name="正在告警"
          :value="alert ? alert.firing.todayCount : 0"
          :compare-value="alert ? alert.firing.yesterdayCount : 0"
          icon="mdi-fire-alert"
        />
      </v-col>
      <v-col
        cols="12"
        class="pt-0"
      >
        <AlertHistoryLine :tenant="tenant" />
      </v-col>
      <v-col
        cols="6"
        class="pt-0"
      >
        <AlertCategoryBar :tenant="tenant" />
      </v-col>
      <v-col
        cols="6"
        class="pt-0"
      >
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
import TenantSelect from '../../components/TenantSelect'
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
  data() {
    return {
      tenant: null,
      alert: null,
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport']),
  },
  watch: {
    tenant: {
      handler: function () {
        this.alertTodayMetrics()
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.tenant = this.Tenant()
      }
    })
  },
  methods: {
    async alertTodayMetrics() {
      this.alert = await getAlertToday(this.tenant.ID)
    },
  },
}
</script>
