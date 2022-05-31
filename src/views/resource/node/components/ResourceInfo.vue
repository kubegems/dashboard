<template>
  <div>
    <v-card>
      <BaseSubTitle
        title="资源统计"
        :divider="false"
        class="pt-2"
      />
      <v-row class="mt-2">
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="cpuOptions"
            :series="cpuSeries"
          />
        </v-col>
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="memoryOptions"
            :series="memorySeries"
          />
        </v-col>
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="podOptions"
            :series="podSeries"
          />
        </v-col>
      </v-row>

      <v-row
        v-if="showMore &&
          item &&
          item.metadata &&
          item.metadata.labels['tencent.com/vcuda'] &&
          item.metadata.labels['tencent.com/vcuda'] === 'true'
        "
      >
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="gpuTkeOptions"
            :series="gpuTkeSeries"
          />
        </v-col>
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="gpuTkeMemoryOptions"
            :series="gpuTkeMemorySeries"
          />
        </v-col>
      </v-row>

      <v-row
        v-if="showMore &&
          item &&
          item.metadata &&
          item.metadata.labels['nvidia.com/gpu'] &&
          item.metadata.labels['nvidia.com/gpu'] === 'true'
        "
      >
        <v-col cols="4">
          <VueApexCharts
            type="radialBar"
            height="300"
            :options="gpuNvidiaOptions"
            :series="gpuNvidiaSeries"
          />
        </v-col>
      </v-row>

      <div
        v-if="item &&
          item.metadata &&
          ((item.metadata.labels['tencent.com/vcuda'] &&
            item.metadata.labels['tencent.com/vcuda'] === 'true') ||
            (item.metadata.labels['nvidia.com/gpu'] &&
              item.metadata.labels['nvidia.com/gpu'] === 'true'))
        "
        class="mb-2 text-center"
      >
        <v-btn
          text
          small
          color="primary"
          @click="showMore=!showMore"
        >
          {{ showMore ? '折叠GPU' : '显示更多' }}
        </v-btn>
      </div>
    </v-card>

    <v-card class="mt-6">
      <v-sheet class="pa-2">
        <BaseListItemForDetail
          title="架构"
          class="pt-0"
          :mt="0"
        >
          <template #content>
            {{ node ? node.status.nodeInfo.architecture : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="bootID">
          <template #content>
            {{ node ? node.status.nodeInfo.bootID : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="容器运行时版本">
          <template #content>
            {{ node ? node.status.nodeInfo.containerRuntimeVersion : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="内核版本">
          <template #content>
            {{ node ? node.status.nodeInfo.kernelVersion : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="kubeProxy版本">
          <template #content>
            {{ node ? node.status.nodeInfo.kubeProxyVersion : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="kubelet版本">
          <template #content>
            {{ node ? node.status.nodeInfo.kubeletVersion : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="machineID">
          <template #content>
            {{ node ? node.status.nodeInfo.machineID : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="操作系统">
          <template #content>
            {{ node ? node.status.nodeInfo.operatingSystem : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="操作系统版本">
          <template #content>
            {{ node ? node.status.nodeInfo.osImage : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="系统UUID">
          <template #content>
            {{ node ? node.status.nodeInfo.systemUUID : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="镜像数量">
          <template #content>
            {{ node && node.status.images ? node.status.images.length : 0 }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="podCIDR">
          <template #content>
            <v-chip
              color="success"
              text-color="white"
              class="mx-1 font-weight-medium"
              small
            >
              {{ node ? node.spec.podCIDR : '' }}
            </v-chip>
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="podCIDRs">
          <template #content>
            <v-chip
              v-for="(item, index) in node ? node.spec.podCIDRs : []"
              :key="index"
              color="success"
              text-color="white"
              class="mx-1 font-weight-medium"
              small
            >
              {{ item }}
            </v-chip>
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="卷">
          <template #content>
            attached :
            {{
              node && node.status.volumesAttached
                ? node.status.volumesAttached.length
                : 0
            }}/ inuse :
            {{
              node && node.status.volumesInUse
                ? node.status.volumesInUse.length
                : 0
            }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle
        title="状况"
        :divider="false"
        class="pt-2"
      />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Reason</th>
              <th class="text-left">状态</th>
              <th class="text-left">Type</th>
              <th class="text-left">Message</th>
              <th class="text-left">上次更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in node ? node.status.conditions : []"
              :key="item.type"
            >
              <td>{{ item.reason }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon
                    small
                    color="primary"
                  > fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon
                    small
                    color="error"
                  >fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.message }}</td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
import { getNodeResourceAllocated } from '@/api'
import VueApexCharts from 'vue-apexcharts'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import { NODE_ONE_POD_RUNNING_COUNT_PROMQL } from '@/utils/prometheus'
import { sizeOfStorage, sizeOfCpu, deepCopy } from '@/utils/helpers'
import { generateRadialBarChartOptions } from '@/utils/chart'

export default {
  name: 'ResourceInfo',
  components: {
    VueApexCharts,
  },
  mixins: [BaseResource, BasePermission],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    totalLimits: {},
    totalRequests: {},
    podCount: 0,
    node: null,
    showMore: false,
  }),
  computed: {
    cpuSeries() {
      return this.totalRequests['cpu'] && this.item.status.capacity['cpu']
        ? [
            sizeOfCpu(this.item.status.capacity['cpu']) === 0
              ? 0
              : (sizeOfCpu(this.totalRequests['cpu']) /
                  sizeOfCpu(this.item.status.capacity['cpu'])) *
                100,
          ]
        : [0]
    },
    cpuOptions() {
      return generateRadialBarChartOptions(
        'CPU',
        ['CPU'],
        this.totalRequests['cpu'] ? sizeOfCpu(this.item.status.capacity['cpu']) : 0,
        'core',
      )
    },
    memorySeries() {
      return this.totalRequests['memory'] && this.item.status.capacity['memory']
        ? [
            sizeOfStorage(this.item.status.capacity['memory']) === 0
              ? 0
              : (sizeOfStorage(this.totalRequests['memory']) /
                  sizeOfStorage(this.item.status.capacity['memory'])) *
                100,
          ]
        : [0]
    },
    memoryOptions() {
      return generateRadialBarChartOptions(
        '内存',
        ['内存'],
        this.totalRequests['memory']
          ? sizeOfStorage(this.item.status.capacity['memory'])
          : 0,
        'Gi',
      )
    },
    gpuTkeSeries() {
      return this.totalRequests['tencent.com/vcuda-core'] &&
        this.item.status.capacity['tencent.com/vcuda-core']
        ? [
            parseInt(this.item.status.capacity['tencent.com/vcuda-core']) === 0
              ? 0
              : (parseInt(this.totalRequests['tencent.com/vcuda-core']) /
                  parseInt(this.item.status.capacity['tencent.com/vcuda-core'])) *
                100,
          ]
        : [0]
    },
    gpuTkeOptions() {
      return generateRadialBarChartOptions(
        'TKE vcuda',
        ['TKE vcuda'],
        this.totalRequests['tencent.com/vcuda-core']
          ? parseInt(this.item.status.capacity['tencent.com/vcuda-core'])
          : 0,
        '',
      )
    },
    gpuNvidiaSeries() {
      return this.totalRequests['nvidia.com/gpu'] &&
        this.totalLimits['nvidia.com/gpu']
        ? [
            parseInt(this.totalLimits['nvidia.com/gpu']) === 0
              ? 0
              : (parseInt(this.totalRequests['nvidia.com/gpu']) /
                  parseInt(this.totalLimits['nvidia.com/gpu'])) *
                100,
          ]
        : [0]
    },
    gpuNvidiaOptions() {
      return generateRadialBarChartOptions(
        'Nvidia GPU',
        ['Nvidia GPU'],
        this.totalRequests['nvidia.com/gpu']
          ? parseInt(this.totalLimits['nvidia.com/gpu'])
          : 0,
        '',
      )
    },
    gpuTkeMemorySeries() {
      return this.totalRequests['tencent.com/vcuda-memory'] &&
        this.item.status.capacity['tencent.com/vcuda-memory']
        ? [
            parseInt(this.item.status.capacity['tencent.com/vcuda-memory']) === 0
              ? 0
              : (parseInt(this.totalRequests['tencent.com/vcuda-memory']) /
                  parseInt(this.item.status.capacity['tencent.com/vcuda-memory'])) *
                100,
          ]
        : [0]
    },
    gpuTkeMemoryOptions() {
      return generateRadialBarChartOptions(
        'TKE显存',
        ['TKE显存'],
        this.totalRequests['tencent.com/vcuda-memory']
          ? parseInt(this.item.status.capacity['tencent.com/vcuda-memory'])
          : 0,
        '',
      )
    },
    podSeries() {
      return this.item
        ? parseInt(this.item.status.capacity.pods) === 0
          ? [0]
          : [(this.podCount / parseInt(this.item.status.capacity.pods)) * 100]
        : [0]
    },
    podOptions() {
      return generateRadialBarChartOptions(
        '容器组',
        ['容器组'],
        this.item ? parseInt(this.item.status.capacity.pods) : 0,
        '',
      )
    },
  },
  watch: {
    item() {
      this.node = deepCopy(this.item)
      this.loadMetrics()
    },
  },
  mounted() {
    if (this.item) {
      this.loadMetrics()
      this.node = deepCopy(this.item)
    }
  },
  methods: {
    async loadMetrics() {
      this.nodeAllocated()
      this.nodePodCountOne()
    },
    async nodeAllocated() {
      const data = await getNodeResourceAllocated(
        this.ThisCluster,
        this.$route.params.name,
        { noprocessing: true },
      )
      this.totalLimits = data.TotalLimits
      this.totalRequests = data.TotalRequests
    },
    async nodePodCountOne() {
      const data = await this.m_permission_vector(this.ThisCluster, {
        query: NODE_ONE_POD_RUNNING_COUNT_PROMQL.replaceAll(
          '$1',
          this.item.metadata.name,
        ),
        noprocessing: true,
      })
      data.forEach((d) => {
        this.podCount = parseInt(d?.value[1] || 0)
      })
    },
  },
}
</script>
