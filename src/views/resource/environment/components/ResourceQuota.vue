<template>
  <v-card>
    <BaseSubTitle
      class="pt-2"
      title="资源分配"
      :divider="false"
    />
    <v-card-text
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    >
      <v-row>
        <v-col
          cols="3"
          class="py-0"
        >
          <VueApexCharts
            type="radialBar"
            height="250"
            :options="cpuOptions"
            :series="cpuSeries"
          />
        </v-col>
        <v-col
          cols="3"
          class="py-0"
        >
          <VueApexCharts
            type="radialBar"
            height="250"
            :options="memoryOptions"
            :series="memorySeries"
          />
        </v-col>
        <v-col
          cols="3"
          class="py-0"
        >
          <VueApexCharts
            type="radialBar"
            height="250"
            :options="storageOptions"
            :series="storageSeries"
          />
        </v-col>
        <v-col
          cols="3"
          class="py-0"
        >
          <VueApexCharts
            type="radialBar"
            height="250"
            :options="podOptions"
            :series="podSeries"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getEnvironmentQuota,
} from '@/api'
import VueApexCharts from 'vue-apexcharts'
import BaseResource from '@/mixins/resource'
import {
  sizeOfCpu,
  sizeOfStorage,
} from '@/utils/helpers'
import { generateRadialBarChartOptions } from '@/utils/chart'

export default {
  name: 'ResourceQuota',
  components: {
    VueApexCharts,
  },
  mixins: [BaseResource],
  data() {
    return {
      quota: null,
    }
  },
  computed: {
    ...mapState(['JWT', 'Scale']),
    ...mapGetters(['Environment', 'Project']),
    cpuSeries() {
      return this.quota
        ? [
            this.quota.Cpu === 0
              ? 0
              : (this.quota.UsedCpu / this.quota.Cpu) * 100,
          ]
        : [0]
    },
    cpuOptions() {
      return generateRadialBarChartOptions(
        'CPU',
        ['CPU'],
        this.quota ? this.quota.Cpu : 0,
        'core',
      )
    },
    memorySeries() {
      return this.quota
        ? [
            this.quota.Memory === 0
              ? 0
              : (this.quota.UsedMemory / this.quota.Memory) * 100,
          ]
        : [0]
    },
    memoryOptions() {
      return generateRadialBarChartOptions(
        '内存',
        ['内存'],
        this.quota ? this.quota.Memory : 0,
        'Gi',
      )
    },
    storageSeries() {
      return this.quota
        ? [
            this.quota.Storage === 0
              ? 0
              : (this.quota.UsedStorage / this.quota.Storage) * 100,
          ]
        : [0]
    },
    storageOptions() {
      return generateRadialBarChartOptions(
        '存储',
        ['存储'],
        this.quota ? this.quota.Storage : 0,
        'Gi',
      )
    },
    podSeries() {
      return this.quota
        ? [
            this.quota.Pod === 0
              ? 0
              : (this.quota.UsedPod / this.quota.Pod) * 100,
          ]
        : [0]
    },
    podOptions() {
      return generateRadialBarChartOptions(
        '容器组',
        ['容器组'],
        this.quota ? this.quota.Pod : 0,
        '',
      )
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.environmentQuota()
    })
  },
  methods: {
    async environmentQuota() {
      const data = await getEnvironmentQuota(
        this.Project().ID,
        this.Environment().ID,
        {
          noprocessing: true,
        },
      )
      if (data.quota.status.hard) {
        this.quota = {
          Cpu: data.quota.status.hard['limits.cpu']
            ? parseFloat(sizeOfCpu(data.quota.status.hard['limits.cpu']))
            : 0,
          Memory: data.quota.status.hard['limits.memory']
            ? parseFloat(sizeOfStorage(data.quota.status.hard['limits.memory']))
            : 0,
          Storage: data.quota.status.hard['requests.storage']
            ? parseFloat(
                sizeOfStorage(data.quota.status.hard['requests.storage']),
              )
            : 0,
          Pod: data.quota.status.hard['count/pods']
            ? parseInt(data.quota.status.hard['count/pods'])
            : 5120,
          UsedCpu: data.quota.status.used['limits.cpu']
            ? parseFloat(sizeOfCpu(data.quota.status.used['limits.cpu']))
            : 0,
          UsedMemory: data.quota.status.used['limits.memory']
            ? parseFloat(sizeOfStorage(data.quota.status.used['limits.memory']))
            : 0,
          UsedStorage: data.quota.status.used['requests.storage']
            ? parseFloat(
                sizeOfStorage(data.quota.status.used['requests.storage']),
              )
            : 0,
          UsedPod: data.quota.status.used.pods
            ? parseFloat(data.quota.status.used.pods)
            : 0,
        }
      } else {
        this.quota = {
          Cpu: 0,
          Memory: 0,
          Storage: 0,
          Pod: 0,
          UsedCpu: 0,
          UsedMemory: 0,
          UsedStorage: 0,
          UsedPod: 0,
        }
      }
      this.$emit('ready')
    },
  },
}
</script>

