<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect v-model="tenant" />
      </template>
    </BaseBreadcrumb>
    <IntroSteps />
    <OverviewList
      class="mt-4"
      :tenant="tenant"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import IntroSteps from './components/IntroSteps'
import OverviewList from './components/OverviewList'
import TenantSelect from '../components/TenantSelect'

export default {
  name: 'Observe',
  components: {
    IntroSteps,
    OverviewList,
    TenantSelect,
  },
  data () {
    this.breadcrumb = {
      title: '可观测性',
      tip: '提供日志采集，查看，告警/监控指标采集，告警/告警中心，历史/链路追踪等所有功能',
      icon: 'mdi-view-dashboard',
    }

    return {
      tenant: null,
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport']),
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.tenant = this.Tenant()
      }
    })
  },
  methods: {

  },
}
</script>
