<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-row class="mt-0">
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="3"
      >
        <v-card
          v-if="item.add"
          class="kubegems__full-height"
          min-height="168"
        >
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item
              three-line
              class="kubegems__full-height"
            >
              <v-list-item-content>
                <v-btn
                  text
                  block
                  color="primary"
                  class="text-h6"
                  @click="addCluster"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  添加集群
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
            class="mx-auto cluster-pos"
            height="100%"
            :elevation="hover ? 5 : 0"
          >
            <v-list-item three-line>
              <v-list-item-avatar
                class="primary--text"
                tile
                size="80"
              >
                <BaseLogo
                  :icon-name="item.Vendor"
                  :width="70"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a @click="clusterDetail(item)">{{ item.ClusterName }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> Kubernetes版本： </span>
                  {{ item.Version === '' ? '-' : item.Version }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> APIServer： </span>
                  {{ item.APIServer === '' ? '-' : item.APIServer }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 状态： </span>
                  <template v-if="!item.Status">
                    <v-progress-circular
                      size="16"
                      indeterminate
                      color="warning"
                    />
                  </template>
                  <v-icon
                    v-else-if="item.Status === 0"
                    small
                    color="error"
                  >
                    mdi-heart-broken
                  </v-icon>
                  <v-icon
                    v-else
                    small
                    color="success"
                  >
                    mdi-heart-pulse
                  </v-icon>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                small
                color="primary"
                :disabled="!item.Status"
                @click="clusterDetail(item)"
              >
                详情
              </v-btn>
              <v-btn
                text
                small
                color="primary"
                :disabled="!item.Status"
                @click="updateCluster(item)"
              >
                编辑
              </v-btn>
              <v-btn
                text
                small
                color="error"
                @click="removeCluster(item)"
              >
                删除
              </v-btn>
              <v-btn
                text
                small
                color="primary"
                :disabled="!item.Status"
                @click="kuberCtl(item)"
              >
                Kubectl
              </v-btn>
            </v-card-actions>

            <v-flex
              v-if="item.Primary"
              class="cluster-watermark-bg"
            />
            <v-flex
              v-if="item.Primary"
              class="cluster-watermark font-weight-medium"
            >
              控制集群
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <AddCluster
      ref="addCluster"
      :control="hasControllerCluster"
      @refresh="clusterList"
    />
    <UpdateCluster
      ref="updateCluster"
      @refresh="clusterList"
    />
    <Terminal ref="terminal" />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getClusterList, deleteCluster, getClusterStatus } from '@/api'
import AddCluster from './components/AddCluster'
import UpdateCluster from './components/UpdateCluster'
import Terminal from '@/views/resource/components/common/Terminal'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'

export default {
  name: 'Cluster',
  components: {
    AddCluster,
    UpdateCluster,
    Terminal,
  },
  mixins: [BaseSelect, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '集群列表',
      tip: '对多集群以及每个集群的基础资源，服务组件和应用资源等统一管理。',
      icon: 'mdi-server',
    },
    items: [],
    interval: null,
    hasControllerCluster: false,
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Cluster']),
  },
  destroyed() {
    if (this.interval) clearInterval(this.interval)
  },
  mounted() {
    if (this.JWT) {
      this.clusterList()
      this.$store.commit('SET_NAMESPACE_FILTER', null)
    }
  },
  methods: {
    async clusterList() {
      const data = await getClusterList({ noprocessing: true })
      this.items = data.List
      this.items.push({ add: true })
      this.hasControllerCluster = this.items.some((c) => {
        return c.Primary
      })
      this.$router.replace({
        name: this.$route.name,
        params: { ...this.$route.params },
        query: { ...this.$route.query, timestamp: Date.parse(new Date()) },
      })
      this.clusterStatus(false)
      if (this.interval) clearInterval(this.interval)
      this.interval = setInterval(() => {
        this.clusterStatus(true)
      }, 30 * 1000)
    },
    async clusterStatus(noprocess = false) {
      const data = await getClusterStatus({
        noprocessing: noprocess,
      })
      this.items.forEach((item, index) => {
        if (item.ClusterName) {
          item.Status = data[item.ClusterName]
          this.$set(this.items, index, item)
        }
      })
    },
    clusterDetail(item) {
      this.$router.push({
        name: 'cluster-detail',
        params: { name: item.ClusterName },
        query: { id: item.ID },
      })
    },
    addCluster() {
      this.$refs.addCluster.open()
    },
    updateCluster(item) {
      this.$refs.updateCluster.init(item)
      this.$refs.updateCluster.open()
    },
    kuberCtl(item) {
      this.$refs.terminal.init(null, item, 'kubectl')
      this.$refs.terminal.open()
    },
    removeCluster(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除集群`,
        content: {
          text: `删除集群 ${item.ClusterName}`,
          type: 'delete',
          name: item.ClusterName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteCluster(param.item.ID)
          this.$store.commit('CLEAR_CLUSTER')
          await this.$store.dispatch('UPDATE_VIRTUALSPACE_DATA')
          this.clusterList()
        },
      })
    },
  },
}
</script>

<style scoped>
.cluster-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cluster-watermark-bg {
  position: absolute;
  width: 120px;
  height: 90px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.cluster-watermark {
  position: absolute;
  top: 17px;
  right: 1px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}
</style>
