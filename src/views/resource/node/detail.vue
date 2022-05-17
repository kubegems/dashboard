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
          <v-menu left>
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
                <template v-if="node">
                  <v-flex v-if="node.spec.unschedulable">
                    <v-btn
                      color="primary"
                      text
                      small
                      @click="allowSchedule"
                    >
                      允许调度
                    </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn
                      color="error"
                      text
                      small
                      @click="stopSchedule"
                    >
                      停止调度
                    </v-btn>
                  </v-flex>
                </template>
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
            {{ node ? node.metadata.name : '' }}

            <template
              v-if="node &&
                node.metadata &&
                node.metadata.labels['tencent.com/vcuda'] &&
                node.metadata.labels['tencent.com/vcuda'] === 'true'
              "
            >
              <v-menu
                top
                open-on-hover
                :close-delay="200"
              >
                <template #activator="{ on }">
                  <span
                    class="mt-1 mr-2"
                    v-on="on"
                  >
                    <BaseLogo icon-name="tke" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> tke </v-card-text>
                </v-card>
              </v-menu>
            </template>
            <template
              v-if="node &&
                node.metadata &&
                node.metadata.labels['nvidia.com/gpu'] &&
                node.metadata.labels['nvidia.com/gpu'] === 'true'
              "
            >
              <v-menu
                top
                open-on-hover
                :close-delay="200"
              >
                <template #activator="{ on }">
                  <span
                    class="mt-1 mr-2"
                    v-on="on"
                  >
                    <BaseLogo icon-name="nvidia" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> nvidia </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                集群
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? Cluster().ClusterName : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                IP
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? node.status.addresses[0].address : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                Hostname
              </v-list-item-title>
              <v-list-item-subtitle class="kubegems__break-all text-body-2">
                {{ node ? node.status.addresses[1].address : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__detail">
              <v-list-item-title class="text-subtitle-2">
                OS
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? node.status.nodeInfo.osImage : '' }}
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
                  node && node.metadata.creationTimestamp
                    ? $moment(node.metadata.creationTimestamp).format('lll')
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
              :item="node"
              :readonly="false"
              :selector="{
                topkind: 'Node',
                topname: node ? node.metadata.name : '',
              }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="node"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getNodeDetail, patchCordonNode } from '@/api'
import VueApexCharts from 'vue-apexcharts'
import ResourceInfo from './components/ResourceInfo'
import Metadata from '@/views/resource/components/metadata/Metadata'
import PodList from '@/views/resource/components/common/PodList'
import NodeMonitor from './components/NodeMonitor'
import EventList from '@/views/resource/components/common/EventList'
import Taint from './components/Taint'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BaseResource from '@/mixins/resource'

export default {
  name: 'NodeDetail',
  components: {
    VueApexCharts,
    ResourceInfo,
    Metadata,
    PodList,
    NodeMonitor,
    EventList,
    Taint,
    ResourceYaml,
  },
  mixins: [BaseResource],
  data: () => ({
    tab: 0,
    node: null,
  }),
  computed: {
    ...mapState(['JWT', 'Plugins']),
    ...mapGetters(['Cluster']),
    tabItems() {
      const items = [
        { text: '资源信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
        { text: '亲和性', value: 'Taint' },
        { text: '容器组', value: 'PodList' },
        { text: '事件', value: 'EventList' },
      ]
      if (this.Plugins?.node_exporter) {
        items.splice(5, 0, { text: '监控', value: 'NodeMonitor' })
      }
      return items
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.nodeDetail()
      })
    }
  },
  methods: {
    async nodeDetail() {
      const data = await getNodeDetail(this.ThisCluster, this.$route.params.name)
      this.node = data
    },
    stopSchedule() {
      const item = this.node
      this.$store.commit('SET_CONFIRM', {
        title: '停止调度节点',
        content: {
          text: `停止调度节点 ${item.metadata.name}`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
            Unschedulable: true,
          })
          this.nodeDetail()
        },
      })
    },
    allowSchedule() {
      const item = this.node
      this.$store.commit('SET_CONFIRM', {
        title: '允许调度节点',
        content: {
          text: `允许调度节点 ${item.metadata.name}`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
            Unschedulable: false,
          })
          this.nodeDetail()
        },
      })
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
  },
}
</script>
