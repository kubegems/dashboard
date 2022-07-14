<template>
  <v-container fluid>
    <BaseMicroServiceHeader :selectable="false" />
    <BaseBreadcrumb />

    <PluginPass v-model="pass">
      <template #default>
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="workload"
          :services="services"
        />
      </template>
    </PluginPass>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import WorkloadLog from './components/WorkloadLog';
  import { getMicroAppWorkoladDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import InboundTrafficIframe from '@/views/microservice/components/InboundTrafficIframe';
  import NetworkTopologyIframe from '@/views/microservice/components/NetworkTopologyIframe';
  import OutboundTrafficIframe from '@/views/microservice/components/OutboundTrafficIframe';
  import PluginPass from '@/views/microservice/components/PluginPass';
  import ResourceInfo from '@/views/microservice/components/ResourceInfo';
  import TraceIframe from '@/views/microservice/components/TraceIframe';

  export default {
    name: 'WorkloadDetail',
    components: {
      InboundTrafficIframe,
      NetworkTopologyIframe,
      OutboundTrafficIframe,
      PluginPass,
      ResourceInfo,
      TraceIframe,
      WorkloadLog,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
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
      pass: false,
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
    },
    watch: {
      pass: {
        handler(newValue) {
          if (newValue) {
            this.microAppWorkoladDetail();
          }
        },
        deep: true,
      },
    },
    methods: {
      async microAppWorkoladDetail() {
        const data = await getMicroAppWorkoladDetail(
          this.VirtualSpace().ID,
          this.$route.query.environmentid,
          this.$route.params.name,
          {
            noprocessing: true,
            kind: this.$route.query.type,
          },
        );
        if (data) {
          this.workload = data.Object;
          this.services = data.services;
        }
      },
    },
  };
</script>
