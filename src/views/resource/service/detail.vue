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
                    @click="updateService"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeService"
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
        <BasicResourceInfo :item="service" />
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card flat>
          <v-card-text class="pa-0">
            <template v-if="service">
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
                :item="service"
                :selector="selector"
              />
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="service"
    />
    <UpdateService
      ref="updateService"
      @refresh="serviceDetail"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getServiceDetail, deleteService } from '@/api'
import ResourceInfo from './components/ResourceInfo'
import Metadata from '@/views/resource/components/metadata/Metadata'
import PodList from '@/views/resource/components/common/PodList'
import EventList from '@/views/resource/components/common/EventList'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import UpdateService from './components/UpdateService'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'ServiceDetail',
  components: {
    ResourceInfo,
    Metadata,
    PodList,
    EventList,
    ResourceYaml,
    BasicResourceInfo,
    UpdateService,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    service: null,
    tab: 0,
  }),
  computed: {
    ...mapState(['JWT']),
    selector() {
      if (this.tabItems[this.tab].value === 'PodList') {
        if (this.service) {
          const selector = {}
          for (const key in this.service.spec.selector) {
            selector[`labels[${key}]`] = this.service.spec.selector[key]
          }
          return selector
        }
      } else if (this.tabItems[this.tab].value === 'EventList') {
        return {
          topkind: 'Service',
          topname: this.service ? this.service.metadata.name : '',
        }
      }
      return {}
    },
    tabItems() {
      const items = [
        { text: '资源信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
        { text: '事件', value: 'EventList' },
      ]
      if (this.service && this.service.spec.type !== 'ExternalName') {
        items.splice(2, 0, { text: '容器组', value: 'PodList' })
      }
      return items
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.serviceDetail()
      })
    }
  },
  methods: {
    async serviceDetail() {
      const data = await getServiceDetail(
        this.ThisCluster,
        this.$route.query.namespace,
        this.$route.params.name,
      )
      this.service = data
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updateService() {
      this.$refs.updateService.init(this.service)
      this.$refs.updateService.open()
    },
    removeService() {
      const item = this.service
      this.$store.commit('SET_CONFIRM', {
        title: `删除服务`,
        content: {
          text: `删除服务 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteService(
            this.ThisCluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'service-list', params: this.$route.params })
        },
      })
    },
  },
}
</script>
