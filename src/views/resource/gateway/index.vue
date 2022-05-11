<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="3"
      >
        <v-card
          v-if="item.add"
          class="full-height"
          min-height="211"
        >
          <v-card-text class="pa-0 full-height">
            <v-list-item
              three-line
              class="full-height"
            >
              <v-list-item-content>
                <v-btn
                  text
                  block
                  color="primary"
                  class="text-h6"
                  @click="addGateway"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建网关
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
        <v-hover
          v-else
          #default="{ hover }"
        >
          <v-card
            class="mx-auto gateway-pos"
            height="100%"
            :elevation="hover ? 5 : 0"
          >
            <v-list-item three-line>
              <v-list-item-avatar
                class="primary--text"
                tile
                size="80"
              >
                <Icon
                  icon="cib:nginx"
                  style="width: 80px; height: 80px; margin-left: 10px;"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a @click="gatewayDetail(item)">
                    {{ item && item.metadata ? item.metadata.name : '' }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 类型： </span>
                  {{
                    item && item.spec && item.spec.type === 'LoadBalancer'
                      ? '外部负载均衡网关(LoadBalancer)'
                      : '常规集群网关(NodePort)'
                  }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 实例数： </span>
                  {{
                    item && item.spec && item.spec.replicas === ''
                      ? '-'
                      : item.spec.replicas
                  }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 租户： </span>
                  {{
                    item && item.spec && item.spec.tenant === ''
                      ? '-'
                      : item.spec.tenant
                  }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2">
                    状态：
                    <v-icon
                      v-if="
                        item &&
                          item.spec &&
                          item.status &&
                          item.spec.replicas === item.status.availableReplicas
                      "
                      color="success"
                      small
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-icon
                      v-else-if="
                        item.status && item.status.availableReplicas === 0
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
                  </span>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 端口： </span>
                  <span
                    v-for="(port, index) in item
                      ? item && item.status && item.status.ports
                      : []"
                    :key="index"
                  >
                    {{ port.name === '' ? '-' : port.name }}:
                    {{ port.nodePort === '' ? '-' : port.nodePort }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                small
                color="primary"
                @click="gatewayDetail(item)"
              >
                详情
              </v-btn>
              <v-btn
                text
                small
                color="primary"
                @click="updateGateway(item)"
              >
                编 辑
              </v-btn>
              <v-btn
                v-if="item.spec.tenant !== 'notenant'"
                text
                small
                color="error"
                @click="removeGateway(item)"
              >
                删 除
              </v-btn>
            </v-card-actions>
            <v-flex
              v-if="item.spec.tenant === 'notenant'"
              class="gateway-watermark-bg"
            />
            <v-flex
              v-if="item.spec.tenant === 'notenant'"
              class="gateway-watermark font-weight-medium"
            >
              默认网关
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <AddGateway
      ref="addGateway"
      @refresh="gatewayList"
    />
    <UpdateGateway
      ref="updateGateway"
      @refresh="gatewayList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getGatewayList, deleteGateway } from '@/api'
import AddGateway from './components/AddGateway'
import UpdateGateway from './components/UpdateGateway'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'Gateway',
  components: {
    AddGateway,
    UpdateGateway,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    items: [],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    ...mapGetters(['Tenant', 'Cluster']),
  },
  mounted() {
    if (this.JWT) {
      if (this.ThisCluster === '') {
        this.$store.commit('SET_SNACKBAR', {
          text: `请创建或选择集群`,
          color: 'warning',
        })
        return
      }
      this.gatewayList()
    }
  },
  methods: {
    async gatewayList() {
      const data = await getGatewayList(
        this.AdminViewport ? '_all' : this.Tenant().ID,
        this.ThisClusterID,
        {
          size: 1000,
        },
      )
      this.items = data
      if (this.m_permisson_tenantAllow) {
        this.items.push({ add: true })
      }
    },
    addGateway() {
      this.$refs.addGateway.open()
    },
    updateGateway(item) {
      this.$refs.updateGateway.init(item.metadata.name)
      this.$refs.updateGateway.open()
    },
    gatewayDetail(item) {
      this.$router.push({
        name: 'gateway-detail',
        params: { name: item.metadata.name },
      })
    },
    removeGateway(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除网关`,
        content: {
          text: `删除网关 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteGateway(
              this.Tenant().ID,
              this.ThisClusterID,
              param.item.metadata.name,
            )
            this.gatewayList()
          }
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.gateway-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gateway-watermark-bg {
  position: absolute;
  width: 120px;
  height: 90px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.gateway-watermark {
  position: absolute;
  top: 17px;
  right: 1px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}

.full-height {
  height: 100%;
}
</style>
