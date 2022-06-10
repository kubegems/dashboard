<template>
  <v-flex>
    <v-row>
      <v-col
        cols="3"
        class="pb-0 pt-6"
      >
        <v-text-field
          v-model="obj.ResourceQuota['limits.cpu']"
          label="CPU限制值"
          suffix="core"
          type="number"
          :rules="resourceQuotaRules['limits.cpu']"
        />
      </v-col>
      <v-col
        cols="3"
        class="pb-0 pt-6"
      >
        <v-text-field
          v-model="obj.ResourceQuota['limits.memory']"
          label="内存限制值"
          suffix="Gi"
          type="number"
          :rules="resourceQuotaRules['limits.memory']"
        />
      </v-col>
      <v-col
        cols="3"
        class="pb-0 pt-6"
      >
        <v-text-field
          v-model="obj.ResourceQuota['requests.storage']"
          label="存储限制值"
          suffix="Gi"
          type="number"
          :rules="resourceQuotaRules['requests.storage']"
        />
      </v-col>
      <v-col
        cols="3"
        class="pb-0 pt-6"
      >
        <v-text-field
          v-model="obj.ResourceQuota['count/pods']"
          label="容器组限制值"
          suffix=""
          type="number"
          :rules="resourceQuotaRules['count/pods']"
        />
      </v-col>

      <v-col
        v-if="nvidia"
        cols="3"
        class="py-0"
      >
        <v-text-field
          v-model="obj.ResourceQuota['limits.nvidia.com/gpu']"
          label="Nvidia Gpu限制值"
          suffix="Gpu"
          type="number"
          :rules="resourceQuotaRules['limits.nvidia.com/gpu']"
        />
      </v-col>

      <template v-if="tke">
        <v-col
          cols="3"
          class="py-0"
        >
          <v-text-field
            v-model="obj.ResourceQuota['tencent.com/vcuda-core']"
            label="Tke Gpu限制值"
            :suffix="`${parseInt(obj.ResourceQuota['tencent.com/vcuda-core']||0)/100}Gpu`"
            type="number"
            :rules="resourceQuotaRules['tencent.com/vcuda-core']"
          />
        </v-col>

        <v-col
          cols="3"
          class="py-0"
        >
          <v-text-field
            v-model="obj.ResourceQuota['tencent.com/vcuda-memory']"
            label="Tke显存限制值"
            :suffix="`${parseInt(obj.ResourceQuota['tencent.com/vcuda-memory']||0)*256/1024}Gi`"
            type="number"
            :rules="resourceQuotaRules['tencent.com/vcuda-memory']"
          />
        </v-col>
      </template>
    </v-row>
  </v-flex>
</template>

<script>
import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers'
import { positiveInteger } from '@/utils/rules'

export default {
  name: 'ResourceQuota',
  props: {
    data: {
      type: Object,
      default: () => null,
    },
    statistics: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      obj: {
        ResourceQuota: {
          'requests.cpu': 0,
          'limits.cpu': 0,
          'requests.memory': 0,
          'limits.memory': 0,
          'requests.storage': 0,
          'count/pods': 100,
        },
      },
      apply: {
        ApplyCpu: 10000,
        ApplyMemory: 10000,
        ApplyStorage: 10000,
        ApplyPod: 5120,
        ApplyNvidiaGpu: 0,
        ApplyTkeGpu: 0,
        ApplyTkeMemory: 0,
      },
      now: {
        'requests.cpu': 0,
        'limits.cpu': 0,
        'requests.memory': 0,
        'limits.memory': 0,
        'requests.storage': 0,
        'count/pods': 5120,
        'limits.nvidia.com/gpu': 0,
        'tencent.com/vcuda-core': 0,
        'tencent.com/vcuda-memory': 0,
      },
    }
  },
  computed: {
    nvidia() {
      if (this.statistics) {
        return Object.prototype.hasOwnProperty.call(this.statistics, 'NvidiaGpu')
      }
      return false
    },
    tke() {
      if (this.statistics) {
        return Object.prototype.hasOwnProperty.call(this.statistics, 'TkeGpu') ||
          Object.prototype.hasOwnProperty.call(this.statistics, 'TkeMemory')
      }
      return false
    },
    resourceQuotaRules() {
      return {
        'limits.cpu': [
          (v) => parseFloat(v) > 0 || '低于最小值限制',
          positiveInteger,
          (v) =>
            parseFloat(v) <= this.apply.ApplyCpu + this.now['limits.cpu'] ||
            '最大值超出可用资源',
        ],
        'limits.memory': [
          (v) => parseFloat(v) > 0 || '低于最小值限制',
          positiveInteger,
          (v) =>
            parseFloat(v) <=
              this.apply.ApplyMemory + this.now['limits.memory'] ||
            '最大值超出可用资源',
        ],
        'requests.storage': [
          (v) => parseFloat(v) > 0 || '低于最小值限制',
          positiveInteger,
          (v) =>
            parseFloat(v) <=
              this.apply.ApplyStorage + this.now['requests.storage'] ||
            '最大值超出可用资源',
        ],
        'count/pods': [
          (v) => parseFloat(v) > 0 || '低于最小值限制',
          positiveInteger,
          (v) =>
            parseFloat(v) <=
              this.apply.ApplyPod +
                (this.now['count/pods']
                  ? parseInt(this.now['count/pods'])
                  : 5120) || '最大值超出可用资源',
        ],
        'limits.nvidia.com/gpu': [
          positiveInteger,
          (v) =>
            parseFloat(v) <= this.apply.ApplyNvidiaGpu + this.now['limits.nvidia.com/gpu'] ||
            '最大值超出可用资源',
        ],
        'tencent.com/vcuda-core': [
          positiveInteger,
          (v) =>
            parseFloat(v) <= this.apply.ApplyTkeGpu + this.now['tencent.com/vcuda-core'] ||
            '最大值超出可用资源',
        ],
        'tencent.com/vcuda-memory': [
          positiveInteger,
          (v) =>
            parseFloat(v) <= this.apply.ApplyTkeMemory + this.now['tencent.com/vcuda-memory'] ||
            '最大值超出可用资源',
        ],
      }
    },
  },
  watch: {
    data: {
      handler(newValue) {
        if (newValue) {
          this.obj = deepCopy(newValue)
          if (!this.obj.ResourceQuota['count/pods']) {
            this.obj.ResourceQuota['count/pods'] = 5120
          }
          this.removeUnit()
          if (this.edit) {
            this.now = deepCopy(this.obj.ResourceQuota)
          }
        }
      },
      deep: true,
      immediate: true,
    },
    statistics: {
      handler(newValue) {
        if (newValue) {
          this.apply = deepCopy(newValue)
          if (!this.edit) {
            if (newValue.NvidiaGpu) {
              this.obj.ResourceQuota['limits.nvidia.com/gpu'] = 0
            } else {
              delete this.obj.ResourceQuota['limits.nvidia.com/gpu']
            }
            if (newValue.TkeGpu || newValue.TkeMemory) {
              this.obj.ResourceQuota['tencent.com/vcuda-core'] = 0
              this.obj.ResourceQuota['tencent.com/vcuda-memory'] = 0
            } else {
              delete this.obj.ResourceQuota['tencent.com/vcuda-core']
              delete this.obj.ResourceQuota['tencent.com/vcuda-memory']
            }
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    generateUnit() {
      const resourceQuota = deepCopy(this.obj.ResourceQuota)
      resourceQuota['requests.cpu'] = `${sizeOfCpu(
        resourceQuota['limits.cpu'],
      )}`
      resourceQuota['limits.cpu'] = `${sizeOfCpu(resourceQuota['limits.cpu'])}`
      resourceQuota['requests.memory'] = `${sizeOfStorage(
        `${resourceQuota['limits.memory']}Gi`,
      )}Gi`
      resourceQuota['limits.memory'] = `${sizeOfStorage(
        `${resourceQuota['limits.memory']}Gi`,
      )}Gi`
      resourceQuota['requests.storage'] = `${sizeOfStorage(
        `${resourceQuota['requests.storage']}Gi`,
      )}Gi`
      if (resourceQuota['tencent.com/vcuda-core']) {
        resourceQuota['tencent.com/vcuda-core'] = `${resourceQuota['tencent.com/vcuda-core']}`
      }
      if (resourceQuota['tencent.com/vcuda-memory']) {
        resourceQuota['tencent.com/vcuda-memory'] = `${resourceQuota['tencent.com/vcuda-memory']}`
      }
      return resourceQuota
    },
    removeUnit() {
      const resourceQuota = deepCopy(this.obj.ResourceQuota)
      resourceQuota['requests.cpu'] = sizeOfCpu(resourceQuota['requests.cpu'])
      resourceQuota['limits.cpu'] = sizeOfCpu(resourceQuota['limits.cpu'])
      resourceQuota['requests.memory'] = sizeOfStorage(
        resourceQuota['requests.memory'],
      )
      resourceQuota['limits.memory'] = sizeOfStorage(
        resourceQuota['limits.memory'],
      )
      resourceQuota['requests.storage'] = sizeOfStorage(
        resourceQuota['requests.storage'],
      )
      if (resourceQuota['limits.nvidia.com/gpu']) {
        resourceQuota['limits.nvidia.com/gpu'] = parseInt(
          resourceQuota['limits.nvidia.com/gpu'],
        )
      }
      if (resourceQuota['tencent.com/vcuda-core']) {
        resourceQuota['tencent.com/vcuda-core'] = parseInt(
          resourceQuota['tencent.com/vcuda-core'],
        )
      }
      if (resourceQuota['tencent.com/vcuda-memory']) {
        resourceQuota['tencent.com/vcuda-memory'] = parseInt(
          resourceQuota['tencent.com/vcuda-memory'],
        )
      }
      this.obj.ResourceQuota = resourceQuota
    },
  },
}
</script>
