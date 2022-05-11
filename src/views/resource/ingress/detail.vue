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
                    @click="updateIngress"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeIngress"
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
        <BasicResourceInfo :item="ingress" />
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
              class="rounded-t pl-2 pt-2"
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
              :item="ingress"
              :gateway="gateway"
              :selector="{
                topkind: 'Ingress',
                topname: ingress ? ingress.metadata.name : '',
              }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="ingress"
    />
    <UpdateIngress
      ref="updateIngress"
      @refresh="ingressDetail"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getIngressDetail, deleteIngress, getGatewayDetail } from '@/api'
import ResourceInfo from './components/ResourceInfo'
import Metadata from '@/views/resource/components/metadata/Metadata'
import EventList from '@/views/resource/components/common/EventList'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import UpdateIngress from './components/UpdateIngress'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'IngressDetail',
  components: {
    ResourceInfo,
    Metadata,
    EventList,
    ResourceYaml,
    BasicResourceInfo,
    UpdateIngress,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    ingress: null,
    gateway: null,
    tab: 0,
    tabItems: [
      { text: '路由信息', value: 'ResourceInfo' },
      { text: '元数据', value: 'Metadata' },
      { text: '事件', value: 'EventList' },
    ],
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Tenant', 'Cluster']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.ingressDetail()
      })
    }
  },
  methods: {
    async ingressDetail() {
      const data = await getIngressDetail(
        this.ThisCluster,
        this.$route.query.namespace,
        this.$route.params.name,
      )
      this.ingress = data
      if (data && data.spec && data.spec.ingressClassName) {
        this.gatewayDetail()
      }
    },
    async gatewayDetail() {
      const ingressClass = this.ingress.spec.ingressClassName
      const data = await getGatewayDetail(
        this.Tenant().ID,
        this.ThisClusterID,
        ingressClass,
        {
          ingressClass: ingressClass,
        },
      )
      this.gateway = data
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updateIngress() {
      this.$refs.updateIngress.init(this.ingress)
      this.$refs.updateIngress.open()
    },
    removeIngress() {
      const item = this.ingress
      this.$store.commit('SET_CONFIRM', {
        title: `删除路由`,
        content: {
          text: `删除路由 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteIngress(
            this.ThisCluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'ingress-list' })
        },
      })
    },
  },
}
</script>
