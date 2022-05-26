<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn
            text
            small
            class="primary--text"
            @click="resourceYaml"
          >
            <v-icon
              left
              small
            >
              fas fa-code
            </v-icon>
            Yaml
          </v-btn>
          <v-menu
            v-if="m_permisson_resourceAllow"
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
                    @click="updateGateway"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex v-if="gateway && gateway.spec.tenant !== 'notenant'">
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeGateway"
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
            {{ gateway ? gateway.metadata.name : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                集群
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ gateway ? ThisCluster : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                租户
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ gateway ? gateway.spec.tenant : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                创建时间
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{
                  gateway && gateway.metadata.creationTimestamp
                    ? $moment(gateway.metadata.creationTimestamp).format('lll')
                    : ''
                }}
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
              class="rounded-t pa-3"
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
          class="mt-3"
          :item="gateway"
          :selector="{
            topkind: 'TenantGateway',
            topname: gateway ? gateway.metadata.name : '',
            ingressClassName: gateway ? gateway.spec.ingressClass : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="gateway"
    />
    <UpdateGateway
      ref="updateGateway"
      @refresh="gatewayDetail"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getGatewayDetail, deleteGateway } from '@/api'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import UpdateGateway from './components/UpdateGateway'
import ResourceInfo from './components/ResourceInfo'
import Metadata from '@/views/resource/components/metadata/Metadata'
import PodList from '@/views/resource/components/common/PodList'
import EventList from '@/views/resource/components/common/EventList'
import IngressList from './components/IngressList'
import GatewayMonitor from './components/GatewayMonitor'
import GatewayConfigmap from './components/GatewayConfigmap'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'GatewayDetail',
  components: {
    ResourceYaml,
    UpdateGateway,
    ResourceInfo,
    Metadata,
    PodList,
    EventList,
    IngressList,
    GatewayMonitor,
    GatewayConfigmap,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    gateway: null,
    tab: 0,
    tabItems: [
      { text: '资源信息', value: 'ResourceInfo' },
      { text: '元数据', value: 'Metadata' },
      { text: '配置', value: 'GatewayConfigmap' },
      { text: '容器组', value: 'PodList' },
      { text: '路由', value: 'IngressList' },
      { text: '事件', value: 'EventList' },
      { text: '监控', value: 'GatewayMonitor' },
    ],
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.gatewayDetail()
      })
    }
  },
  methods: {
    async gatewayDetail() {
      const data = await getGatewayDetail(
        this.Tenant().ID,
        this.ThisClusterID,
        this.$route.params.name,
      )
      this.gateway = data
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updateGateway() {
      this.$refs.updateGateway.init(this.gateway.metadata.name)
      this.$refs.updateGateway.open()
    },
    removeGateway() {
      const item = this.gateway
      this.$store.commit('SET_CONFIRM', {
        title: `删除网关`,
        content: {
          text: `删除网关 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteGateway(
            this.Tenant().ID,
            this.ThisClusterID,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'gateway-list', params: this.$route.params })
        },
      })
    },
  },
}
</script>
