<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <div
        slot="extend"
        class="float-right"
      >
        <BaseDatetimePicker2 v-model="date" />
      </div>
    </BaseBreadcrumb>

    <v-row class="kubegems__h-24">
      <v-col cols="4">
        <ValueCard
          name="今日告警"
          :value="241"
          :compare-value="123"
          icon="mdi-bell"
        />
      </v-col>
      <v-col cols="4">
        <ValueCard
          name="已消除"
          :value="241"
          :compare-value="123"
          icon="mdi-fire-extinguisher"
        />
      </v-col>
      <v-col cols="4">
        <ValueCard
          name="正在告警"
          :value="241"
          :compare-value="123"
          icon="mdi-fire-alert"
        />
      </v-col>
      <v-col cols="12">
        <AlertHistoryLine />
      </v-col>
      <v-col cols="6">
        <AlertCategoryBar />
      </v-col>
      <v-col cols="6">
        <AlertTopBar />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ValueCard from './components/ValueCard.vue'
import AlertHistoryLine from './components/AlertHistoryLine.vue'
import AlertCategoryBar from './components/AlertCategoryBar.vue'
import AlertTopBar from './components/AlertTopBar.vue'

export default {
  name: 'ObserveMonitor',
  components: {
    ValueCard,
    AlertHistoryLine,
    AlertCategoryBar,
    AlertTopBar,
  },
  data () {
    this.breadcrumb = {
      title: '监控中心概览',
      tip: '指标、日志、追溯',
      icon: 'mdi-monitor-dashboard',
    }

    return {
      date: [],
    }
  },
  methods: {

  },
}
</script>
