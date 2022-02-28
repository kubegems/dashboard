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
      },
      now: {
        'requests.cpu': 0,
        'limits.cpu': 0,
        'requests.memory': 0,
        'limits.memory': 0,
        'requests.storage': 0,
        'count/pods': 100,
      },
    }
  },
  computed: {
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
      }
    },
  },
  watch: {
    data() {
      this.obj = deepCopy(this.data)
      if (!this.obj.ResourceQuota['count/pods']) {
        this.obj.ResourceQuota['count/pods'] = 5120
      }
      this.removeUnit()
    },
    statistics() {
      this.apply = deepCopy(this.statistics)
    },
  },
  mounted() {
    if (this.data) {
      this.obj = deepCopy(this.data)
      if (!this.obj.ResourceQuota['count/pods']) {
        this.obj.ResourceQuota['count/pods'] = 5120
      }
      this.removeUnit()
      this.now = deepCopy(this.obj.ResourceQuota)
    }
    if (this.statistics) {
      this.apply = deepCopy(this.statistics)
    }
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
      this.obj.ResourceQuota = resourceQuota
    },
  },
}
</script>
