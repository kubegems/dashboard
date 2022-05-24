<template>
  <v-container fluid>
    <BaseMicroServiceHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu
            v-if="m_permisson_virtualSpaceAllow"
            left
          >
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateIstioGatewayInstance"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeIstioGatewayInstance"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="2"
        class="pt-0"
      >
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ gateway ? gateway.Name : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                集群
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ $route.query.cluster }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                应用环境
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ $route.query.environment }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                状态
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                <v-icon
                  v-if="
                    gateway &&
                      gateway.status &&
                      gateway.status.replicas === gateway.status.availableReplicas
                  "
                  color="success"
                  small
                >
                  mdi-check-circle
                </v-icon>
                <v-icon
                  v-else-if="
                    gateway &&
                      gateway.status &&
                      gateway.status.availableReplicas === 0
                  "
                  color="error"
                  small
                >
                  mdi-close-circle
                </v-icon>
                <v-icon
                  v-else
                  color="warning"
                  small
                >
                  mdi-alert-circle
                </v-icon>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs
              v-model="tab"
              height="40"
              class="rounded-t pl-4 pt-4"
            >
              <v-tab
                v-for="item in tabItems"
                :key="item.value"
              >
                {{ item.text }}
              </v-tab>
            </v-tabs>

            <component
              :is="tabItems[tab].value"
              :ref="tabItems[tab].value"
              :gateway="gateway"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <UpdateIstioGateway
      ref="updateIstioGateway"
      @refresh="istioGatewayInstanceDetail"
    />
  </v-container>
</template>

<script>
import { getIstioGatewayInstanceDetail, deleteIstioGatewayInstance } from '@/api'
import UpdateIstioGateway from './components/UpdateIstioGateway'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import { mapGetters, mapState } from 'vuex'
import GatewayList from './components/GatewayList'
import GatewayPodList from './components/GatewayPodList'
import GatewayMonitor from './components/GatewayMonitor'
import VirtualServiceList from './components/VirtualServiceList'

export default {
  name: 'IstioGatewayDetail',
  components: {
    UpdateIstioGateway,
    GatewayList,
    GatewayMonitor,
    GatewayPodList,
    VirtualServiceList,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    gateway: null,
    tab: 0,
    tabItems: [
      { text: '网关资源', value: 'GatewayList' },
      { text: '虚拟服务', value: 'VirtualServiceList' },
      { text: '网关容器组', value: 'GatewayPodList' },
      { text: '网关监控', value: 'GatewayMonitor' },
    ],
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['VirtualSpace']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.istioGatewayInstanceDetail()
      })
    }
  },
  methods: {
    async istioGatewayInstanceDetail() {
      const data = await getIstioGatewayInstanceDetail(
        this.VirtualSpace().ID,
        this.$route.query.clusterid,
        this.$route.params.name,
      )
      this.gateway = data
    },
    updateIstioGatewayInstance() {
      this.$refs.updateIstioGateway.init(this.gateway)
      this.$refs.updateIstioGateway.open()
    },
    removeIstioGatewayInstance() {
      const item = this.gateway
      this.$store.commit('SET_CONFIRM', {
        title: `删除istio网关实例`,
        content: {
          text: `删除istio网关实例 ${item.Name}`,
          type: 'delete',
          name: item.Name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.Name.length > 0) {
            await deleteIstioGatewayInstance(
              this.VirtualSpace().ID,
              this.EnvironmentFilter.ClusterID,
              param.item.Name,
            )
            this.istioGatewayInstanceDetail()
          }
        },
      })
    },
  },
}
</script>
