<template>
  <v-card>
    <v-card-text>
      <BaseSubTitle
        title="资源分配"
        :pl="0"
        :divider="false"
      >
        <template #header>
          <span>
            <span class="ma-2 text-caption grey--text">
              CPU:
              <span class="text-subtitle-2">{{ allCpu }}</span>
              core
            </span>
            <span class="ma-2 text-caption grey--text">
              内存:
              <span class="text-subtitle-2">{{ allMem }}</span>
              Gi
            </span>
            <span class="ma-2 text-caption grey--text">
              存储:
              <span class="text-subtitle-2">{{ allStorage }}</span>
              Gi
            </span>
          </span>
        </template>
        <template #action>
          <v-btn
            small
            text
            color="primary"
            class="float-right mr-2"
            @click="addResource"
          >
            <v-icon
              left
              small
            >
              mdi-server-plus
            </v-icon>
            添加集群资源
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-data-table
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
      >
        <template #[`item.clusterName`]="{ item }">
          {{ item.Cluster.ClusterName }}
        </template>
        <template #[`item.cpu`]="{ item }"> {{ item.Cpu }} core </template>
        <template #[`item.memory`]="{ item }">
          {{ item.Memory }} Gi
        </template>
        <template #[`item.storage`]="{ item }">
          {{ item.Storage }} Gi
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`l${item.ID}`" />
          <v-menu
            left
            :attach="`#l${item.ID}`"
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
                    @click="scaleResource(item)"
                  >
                    资源调整
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="tenantMonitor(item)"
                  >
                    资源监控
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="recycleTenantResourceQuota(item)"
                  >
                    回收集群
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount > 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="tenantResourceQuotaList"
        @changesize="onClusterPageSizeChange"
        @changepage="onClusterPageIndexChange"
      />
    </v-card-text>

    <AddResource
      ref="addResource"
      :clusters="items"
      @refresh="tenantResourceQuotaList"
    />
    <TenantMonitor ref="tenantMonitor" />
    <ScaleResource
      ref="scaleResource"
      @refresh="tenantResourceQuotaList"
    />
  </v-card>
</template>

<script>
import {
  getTenantResourceQuotaList,
  deleteTenantResourceQuota,
} from '@/api'
import AddResource from './AddResource'
import TenantMonitor from './TenantMonitor'
import ScaleResource from './ScaleResource'
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'ResourceList',
  components: {
    AddResource,
    TenantMonitor,
    ScaleResource,
  },
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      items: [],
      headers: [
        { text: '集群', value: 'clusterName', align: 'start' },
        { text: 'CPU', value: 'cpu', align: 'start' },
        { text: '内存', value: 'memory', align: 'start' },
        { text: '存储', value: 'storage', align: 'start' },
        { text: '', value: 'action', align: 'center', width: 20 },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 50,
      },
      allCpu: 0,
      allMem: 0,
      allStorage: 0,
    }
  },
  watch: {
    tenant: {
      handler(newValue) {
        if (newValue) {
          this.tenantResourceQuotaList()
        }
      },
      deep: true,
    },
  },
  methods: {
    async tenantResourceQuotaList() {
      this.allCpu = 0
      this.allMem = 0
      this.allStorage = 0
      const data = await getTenantResourceQuotaList(this.tenant.ID, {
        noprocessing: true,
      })
      data.List.forEach((item) => {
        item.Cpu = item.Content['limits.cpu']
          ? sizeOfCpu(item.Content['limits.cpu'])
          : 0
        item.Memory = item.Content['limits.memory']
          ? sizeOfStorage(item.Content['limits.memory'])
          : 0
        item.Storage = item.Content['requests.storage']
          ? sizeOfStorage(item.Content['requests.storage'])
          : 0

        this.allCpu += item.Cpu
        this.allMem += item.Memory
        this.allStorage += item.Storage
      })
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    addResource() {
      this.$refs.addResource.init(this.tenant)
      this.$refs.addResource.open()
    },
    tenantMonitor(item) {
      this.$refs.tenantMonitor.init(item)
      this.$refs.tenantMonitor.open()
    },
    scaleResource(item) {
      this.$refs.scaleResource.init(item)
      this.$refs.scaleResource.open()
    },
    recycleTenantResourceQuota(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `回收集群资源`,
        content: {
          text: `回收集群资源 ${item.Cluster.ClusterName}`,
          type: 'delete',
          name: item.Cluster.ClusterName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteTenantResourceQuota(
            param.item.TenantID,
            param.item.ClusterID,
          )
          this.tenantDetail()
        },
      })
    },
    onClusterPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onClusterPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>

