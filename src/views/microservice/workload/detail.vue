<template>
  <v-container fluid>
    <BaseMicroServiceHeader :selectable="false" />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-card flat>
      <v-card-text class="pa-0">
        <v-tabs
          v-model="tab"
          height="40"
          class="rounded-t pa-2"
        >
          <v-tab
            v-for="item in tabItems"
            :key="item.value"
          >
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>
    <component
      :is="tabItems[tab].value"
      :ref="tabItems[tab].value"
      :item="workload"
      :services="services"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getMicroAppWorkoladDetail } from '@/api'
import ResourceInfo from '@/views/microservice/components/ResourceInfo'
import NetworkTopologyIframe from '@/views/microservice/components/NetworkTopologyIframe'
import WorkloadLog from './components/WorkloadLog'
import InboundTrafficIframe from '@/views/microservice/components/InboundTrafficIframe'
import OutboundTrafficIframe from '@/views/microservice/components/OutboundTrafficIframe'
import TraceIframe from '@/views/microservice/components/TraceIframe'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'WorkloadDetail',
  components: {
    ResourceInfo,
    NetworkTopologyIframe,
    WorkloadLog,
    InboundTrafficIframe,
    OutboundTrafficIframe,
    TraceIframe,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '工作负载',
      tip: '工作负载 (Workload) 通常是访问服务的载体, 是对一组容器组 (Pod) 的抽象。',
      icon: 'mdi-vector-arrange-above',
    },
    tab: 0,
    tabItems: [
      { text: '概览', value: 'ResourceInfo' },
      { text: '流量拓扑', value: 'NetworkTopologyIframe' },
      { text: '日志', value: 'WorkloadLog' },
      { text: '入口流量', value: 'InboundTrafficIframe' },
      { text: '出口流量', value: 'OutboundTrafficIframe' },
      { text: '链路追踪', value: 'TraceIframe' },
    ],
    workload: null,
    services: null,
  }),
  computed: {
    ...mapState(['JWT', 'EnvironmentFilter']),
    ...mapGetters(['VirtualSpace']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.microAppWorkoladDetail()
      })
    }
  },
  methods: {
    async microAppWorkoladDetail() {
      const data = await getMicroAppWorkoladDetail(
        this.VirtualSpace().ID,
        this.$route.query.environmentid,
        this.$route.params.name,
        { noprocessing: true },
      )
      if (data) {
        this.workload = data.Object
        this.services = data.services
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.waiting-flashing {
  animation-name: animate-waiting-flash;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes animate-waiting-flash {
  from {
    background-color: #fb8c00;
  }
  to {
    background-color: white;
  }
}
</style>
