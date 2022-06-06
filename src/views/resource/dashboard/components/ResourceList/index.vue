<template>
  <v-card class="my-3">
    <BaseSubTitle
      class="pt-2"
      title="集群"
      :divider="false"
    />
    <v-data-table
      disable-sort
      class="px-4"
      :headers="headers"
      :items="items"
      :page.sync="params.page"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      hide-default-footer
    >
      <template #[`item.clusterName`]="{ item }">
        <v-flex
          class="float-left resource__tr"
        >
          {{ item.Cluster.ClusterName }}
        </v-flex>
        <v-flex
          v-if="item.TkeGpu"
          class="float-left ml-2 resource__icon"
        >
          <GpuTip
            type="tke"
            :item="item"
          />
        </v-flex>
        <v-flex
          v-if="item.NvidiaGpu"
          class="float-left ml-2 resource__icon"
        >
          <GpuTip
            type="nvidia"
            :item="item"
          />
        </v-flex>
        <template
          v-if="
            item.TenantResourceQuotaApply &&
              item.TenantResourceQuotaApply.Status === 'pending'
          "
        >
          <v-flex
            class="float-left ml-2 resource__tr"
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
          </v-flex>
        </template>
        <div class="kubegems__clear-float" />
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
            :color="getColor(item.CpuPercentage)"
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
            :color="getColor(item.MemoryPercentage)"
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
            :color="getColor(item.StoragePercentage)"
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
import GpuTip from '@/views/resource/components/common/GpuTip'
import BasePermission from '@/mixins/permission'
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'ResourceList',
  components: {
    ScaleResource,
    Pagination,
    GpuTip,
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

      if (Object.prototype.hasOwnProperty.call(data.spec.hard, 'limits.nvidia.com/gpu')) {
        item.NvidiaGpu = parseFloat(data.spec.hard['limits.nvidia.com/gpu'])
        item.AllocatedNvidiaGpu = parseFloat(data.status.allocated['limits.nvidia.com/gpu'])
        item.NvidiaGpuPercentage =
          item.NvidiaGpu > 0 ? ((item.AllocatedNvidiaGpu / item.NvidiaGpu) * 100).toFixed(1) : 0
      }

      if (Object.prototype.hasOwnProperty.call(data.spec.hard, 'tencent.com/vcuda-core' ||
        Object.prototype.hasOwnProperty.call(data.spec.hard, 'tencent.com/vcuda-memory'))) {
        item.TkeGpu = parseFloat(data.spec.hard['tencent.com/vcuda-core'])
        item.AllocatedTkeGpu = parseFloat(data.status.allocated['tencent.com/vcuda-core'])
        item.TkeGpuPercentage =
          item.TkeGpu > 0 ? ((item.AllocatedTkeGpu / item.TkeGpu) * 100).toFixed(1) : 0

        item.TkeMemory = parseFloat(data.spec.hard['tencent.com/vcuda-memory'])
        item.AllocatedTkeMemory = parseFloat(data.status.allocated['tencent.com/vcuda-memory'])
        item.TkeMemoryPercentage =
          item.TkeMemory > 0 ? ((item.AllocatedTkeMemory / item.TkeMemory) * 100).toFixed(1) : 0
      }

      this.$set(this.items, index, item)
    },
    scaleResource(item) {
      this.$refs.scaleResource.init(item)
      this.$refs.scaleResource.open()
    },
    getColor(percentage) {
      return percentage
        ? percentage < 60
          ? 'primary'
          : percentage < 80
            ? 'warning'
            : 'red darken-1'
        : 'primary'
    },
  },
}
</script>

<style lang="scss" scoped>
.resource {
  &__tr {
    line-height: 48px;
  }

  &__icon {
    margin-top: 10px;
  }
}
</style>

