<template>
  <v-card class="my-3">
    <BaseSubTitle
      title="集群"
      :divider="false"
    />
    <v-data-table
      disable-sort
      class="px-2"
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      hide-default-footer
    >
      <template #[`item.clusterName`]="{ item }">
        {{ item.Cluster.ClusterName }}
        <template
          v-if="
            item.TenantResourceQuotaApply &&
              item.TenantResourceQuotaApply.Status === 'pending'
          "
        >
          <v-icon
            color="warning"
            small
            right
          >
            mdi-alert-circle
          </v-icon>
          <span class="warning--text text-caption font-weight-medium">
            资源申请中
          </span>
        </template>
      </template>
      <template #[`item.cpu`]="{ item }">
        {{ item.Cpu ? item.Cpu : 0 }} core
      </template>
      <template #[`item.memory`]="{ item }">
        {{ item.Memory ? item.Memory : 0 }} Gi
      </template>
      <template #[`item.storage`]="{ item }">
        {{ item.Storage ? item.Storage : 0 }} Gi
      </template>
      <template #[`item.allocatedCpu`]="{ item }">
        {{ item.AllocatedCpu ? item.AllocatedCpu.toFixed(1) : 0 }} core
        <span class="text-subtitle-2">
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.CpuPercentage"
            height="15"
            :color="
              item.CpuPercentage
                ? item.CpuPercentage < 60
                  ? 'primary'
                  : item.CpuPercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text">{{ item.CpuPercentage }}% </span>
          </v-progress-linear>
        </span>
      </template>
      <template #[`item.allocatedMemory`]="{ item }">
        {{ item.AllocatedMemory ? item.AllocatedMemory.toFixed(1) : 0 }} Gi
        <span class="text-subtitle-2">
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.MemoryPercentage"
            height="15"
            :color="
              item.MemoryPercentage
                ? item.MemoryPercentage < 60
                  ? 'primary'
                  : item.MemoryPercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text">{{ item.MemoryPercentage }}% </span>
          </v-progress-linear>
        </span>
      </template>
      <template #[`item.allocatedStorage`]="{ item }">
        {{ item.AllocatedStorage ? item.AllocatedStorage.toFixed(1) : 0 }} Gi
        <span class="text-subtitle-2">
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.StoragePercentage"
            height="15"
            :color="
              item.StoragePercentage
                ? item.StoragePercentage < 60
                  ? 'primary'
                  : item.StoragePercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text">{{ item.StoragePercentage }}% </span>
          </v-progress-linear>
        </span>
      </template>
      <template #[`item.action`]="{ item }">
        <span class="pa-2">
          <v-btn
            color="primary"
            text
            small
            @click="scaleResource(item)"
          >
            申请资源
          </v-btn>
        </span>
      </template>
    </v-data-table>

    <Pagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @loaddata="tenantResourceQuotaList"
      @changepage="onPageIndexChange"
    />

    <ScaleResource
      ref="scaleResource"
      @refresh="tenantResourceQuotaList"
    />
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getTenantResourceQuotaList, getTenantResourceQuota } from '@/api'
import ScaleResource from './ScaleResource'
import Pagination from '../Pagination'
import BasePermission from '@/mixins/permission'
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'ResourceList',
  components: {
    ScaleResource,
    Pagination,
  },
  mixins: [BasePermission],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 5,
    },
  }),
  computed: {
    ...mapState(['JWT', 'Admin']),
    ...mapGetters(['Tenant']),
    headers() {
      const items = [
        { text: '集群', value: 'clusterName', align: 'start' },
        { text: '总CPU', value: 'cpu', align: 'start' },
        { text: '总内存', value: 'memory', align: 'start' },
        { text: '总存储', value: 'storage', align: 'start' },
        {
          text: '已分配CPU',
          value: 'allocatedCpu',
          align: 'start',
          width: 150,
        },
        {
          text: '已分配内存',
          value: 'allocatedMemory',
          align: 'start',
          width: 150,
        },
        {
          text: '已分配存储',
          value: 'allocatedStorage',
          align: 'start',
          width: 150,
        },
      ]
      if (this.m_permisson_tenantAllow) {
        items.push({
          text: '操作',
          value: 'action',
          align: 'center',
          width: 100,
        })
      }
      return items
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        if (this.Tenant().ID > 0) {
          this.tenantResourceQuotaList(false)
        }
      })
    }
  },
  methods: {
    async tenantResourceQuotaList(noprocessing = true) {
      const data = await getTenantResourceQuotaList(this.Tenant().ID, Object.assign(this.params, {
        noprocessing: noprocessing,
      }))
      data.List.forEach((item, index) => {
        this.tenantResourceQuota(item, index)
      })
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    async tenantResourceQuota(resourceQuota, index) {
      const data = await getTenantResourceQuota(
        resourceQuota.Cluster.ClusterName,
        resourceQuota.Tenant.TenantName,
        { noprocessing: true },
      )
      const item = this.items[index]
      item.Cpu = parseFloat(sizeOfCpu(data.spec.hard['limits.cpu']))
      item.Memory = parseFloat(sizeOfStorage(data.spec.hard['limits.memory']))
      item.Storage = parseFloat(
        sizeOfStorage(data.spec.hard[`requests.storage`]),
      )
      item.AllocatedCpu = parseFloat(
        sizeOfCpu(data.status.allocated['limits.cpu']),
      )
      item.AllocatedMemory = parseFloat(
        sizeOfStorage(data.status.allocated['limits.memory']),
      )
      item.AllocatedStorage = parseFloat(
        sizeOfStorage(data.status.allocated[`requests.storage`]),
      )
      item.CpuPercentage =
        item.Cpu > 0 ? ((item.AllocatedCpu / item.Cpu) * 100).toFixed(1) : 0
      item.MemoryPercentage =
        item.Memory > 0
          ? ((item.AllocatedMemory / item.Memory) * 100).toFixed(1)
          : 0
      item.StoragePercentage =
        item.Storage > 0
          ? ((item.AllocatedStorage / item.Storage) * 100).toFixed(1)
          : 0
      this.$set(this.items, index, item)
    },
    scaleResource(item) {
      this.$refs.scaleResource.init(item)
      this.$refs.scaleResource.open()
    },
  },
}
</script>
